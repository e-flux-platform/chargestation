import React from 'react';
import screen from 'helpers/screen';
import { Button, Loader } from 'semantic';
import { Link } from 'react-router-dom';
import { Transition } from 'semantic-ui-react';

import { ChargeStation16, ChargeStation201 } from 'lib/ocpp';
import { getConfiguration, getSettings, getDefaultSession } from 'lib/settings';

import chargeStationSvg from 'assets/charge-station.svg';
import chargeStationStatusSvg from 'assets/charge-station-status.svg';
import car1Svg from 'assets/car-1.svg';
import car1ConnectorSvg from 'assets/car-1-connector.svg';
import car2Svg from 'assets/car-2.svg';
import roadLogoSvg from 'assets/road-logo-dark-mode.svg';

import SettingsModal from './SettingsModal';

import './dashboard.less';
import StartSessionModal from './StartSessionModal';
import ErrorModal from './ErrorModal';
import { summarizeCommandParams } from 'lib/ocpp/utils';
import CommandDetailsModal from './CommandDetailsModal';
import { formatDateTimeRelative } from 'utils/date';
import StopSessionModal from './StopSessionModal';
import StatusNotificationModal from './StatusNotificationModal';

@screen
export default class Home extends React.Component {
  static title = 'Chargestation.one';
  static layout = 'simulator';

  state = {
    configuration: getConfiguration(),
    settings: getSettings(),
    session: getDefaultSession(),
    logEntries: [],
    session1OnceStarted: false,
    session2OnceStarted: false,
  };

  componentDidMount() {
    const { configuration, settings } = this.state;
    this.initChargeStation(configuration, settings);
    this.tickInterval = setInterval(() => this.nextTick(), 4000);
  }

  componentWillUnmount() {
    clearInterval(this.tickInterval);
  }

  nextTick() {
    this.setState({ tick: Date.now() });
  }

  onLog = (logEntry) => {
    const { logEntries } = this.state;
    logEntries.unshift(logEntry);
    this.setState({ logEntries });
  };

  onError = (error) => {
    this.setState({ error });
    this.nextTick();
  };

  initChargeStation(configuration, settings) {
    let chargeStation;
    switch (settings.ocppProtocol) {
      case '1.6':
        chargeStation = new ChargeStation16(configuration, settings);
        break;
      case '2.0.1':
        chargeStation = new ChargeStation201(configuration, settings);
        break;
      default:
        throw new Error(`unsupported protocol: ${settings.ocppProtocol}`);
    }
    chargeStation.onLog = this.onLog;
    chargeStation.onError = this.onError;
    chargeStation.onSessionStart = (connectorId) => {
      if (connectorId === '1') {
        this.setState({ session1OnceStarted: true });
      } else {
        this.setState({ session2OnceStarted: true });
      }
    };
    chargeStation.connect();
    this.setState({ chargeStation });
  }

  render() {
    const {
      chargeStation,
      tick,
      logEntries,
      settings,
      configuration,
      session,
      error,
      inspectCommand,
      session1OnceStarted,
      session2OnceStarted,
    } = this.state;
    if (!chargeStation) {
      return <Loader />;
    }
    const chargeStationIsCharging =
      chargeStation.hasRunningSession('1') ||
      chargeStation.hasRunningSession('2');
    return (
      <div className="dashboard">
        <CommandDetailsModal
          open={!!inspectCommand}
          command={inspectCommand}
          onClose={() => {
            this.setState({ inspectCommand: null });
          }}
        />
        <ErrorModal
          open={!!error}
          error={error}
          onClose={() => {
            this.setState({ error: null });
          }}
        />
        <div className="logo">
          chargestation.one<p className="subtitle">OCPP simulator</p>
        </div>
        <div className="visualization">
          <div
            className={`car-1 ${
              chargeStation.hasRunningSession('1') ? 'animated' : ''
            } ${session1OnceStarted ? '' : 'initial'}`}>
            <img src={car1Svg} />
          </div>
          <div
            className={`car-2 ${
              chargeStation.hasRunningSession('2') ? 'animated' : ''
            } ${session2OnceStarted ? '' : 'initial'}`}>
            <img src={car2Svg} />
          </div>
          <div className="car-1-connector"></div>
          <div className="car-2-connector"></div>
          <div className="charge-station">
            <img src={chargeStationSvg} />
          </div>
          <div
            className={`charge-station-status ${
              chargeStationIsCharging ? 'charging' : ''
            }`}>
            <img src={chargeStationStatusSvg} />
          </div>
        </div>
        <div className="terminal">
          <div className="actions">
            <StartSessionModal
              availableConnectors={chargeStation.availableConnectors()}
              session={session}
              onSave={({ connectorId, session }) => {
                this.setState({ session });
                chargeStation.startSession(connectorId, session);
                this.nextTick();
              }}
              trigger={
                <Button
                  inverted
                  primary={chargeStationIsCharging ? false : true}
                  loading={
                    chargeStation.isStartingSession('1') ||
                    chargeStation.isStartingSession('2')
                  }
                  icon="play"
                  content="Start Charging"
                />
              }
            />

            <StatusNotificationModal
              availableConnectors={chargeStation.availableConnectors()}
              currentStatus={chargeStation.currentStatus}
              session={session}
              onSave={async ({ connectorId, status }) => {
                await chargeStation.sendStatusNotification(connectorId, status);
                this.nextTick();
              }}
              trigger={
                <Button
                  inverted
                  primary={!!chargeStationIsCharging}
                  disabled={!chargeStationIsCharging}
                  icon="signal"
                  content="Status"
                />
              }
            />

            <StopSessionModal
              availableConnectors={chargeStation.availableConnectors()}
              session={session}
              onSave={async ({ connectorId }) => {
                await chargeStation.stopSession(connectorId, () => {
                  this.nextTick();
                });
                this.nextTick();
              }}
              trigger={
                <Button
                  inverted
                  primary={chargeStationIsCharging ? true : false}
                  disabled={!chargeStationIsCharging}
                  loading={
                    chargeStation.isStoppingSession('1') ||
                    chargeStation.isStoppingSession('2')
                  }
                  icon="stop"
                  content="End Charging"
                />
              }
            />
            <div className="right-actions">
              <Button to="/docs" as={Link} inverted icon="book" />
              <SettingsModal
                trigger={<Button inverted icon="setting" />}
                settings={settings}
                configuration={configuration}
                onSave={async ({ settings, configuration }) => {
                  this.setState({ settings, configuration }, async () => {
                    await chargeStation.powerOff();
                    this.initChargeStation(configuration, settings);
                  });
                }}
              />
            </div>
          </div>
          <div className="console">
            {logEntries.map((logEntry) => {
              if (logEntry.command) {
                const { command } = logEntry;
                const paramSummary = summarizeCommandParams(command.subprotocol, command.request);
                return (
                  <div
                    key={logEntry.id}
                    className="log-entry command"
                    onClick={() => {
                      this.setState({ inspectCommand: command });
                    }}>
                    <div>
                      <span className="date-time">
                        {command.destination === 'central-server'
                          ? formatDateTimeRelative(command.requestSentAt)
                          : formatDateTimeRelative(command.requestReceivedAt)}
                      </span>
                      {command.destination === 'central-server' ? `>` : `<`}{' '}
                      {command.request.method}{' '}
                      {paramSummary && (
                        <span className="params-summary">
                          (
                          <span className="keys">
                            {Object.keys(paramSummary).map((key) => {
                              return (
                                <React.Fragment key={key}>
                                  <span className="key">{key}</span>=
                                  <span className="value">
                                    {paramSummary[key]}
                                  </span>
                                </React.Fragment>
                              );
                            })}
                            )
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="response">
                      {command.destination === 'central-server' ? `<` : `>`}{' '}
                      {JSON.stringify(command.response)}
                    </div>
                  </div>
                );
              }
              return (
                <div key={logEntry.id} className={`log-entry ${logEntry.type}`}>
                  {logEntry.message}
                </div>
              );
            })}
          </div>
          <div className="road-logo">
            <a href="https://road.io" target="_blank">
              <img src={roadLogoSvg} />
            </a>
          </div>
          <div className="tick">{tick}</div>
        </div>
      </div>
    );
  }
}

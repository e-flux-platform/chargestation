import React from 'react';
import screen from 'helpers/screen';
import { Button, Loader } from 'semantic';
import { Link } from 'react-router-dom';
import { Transition } from 'semantic-ui-react';

import ChargeStation from 'lib/ChargeStation';
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
import { summarizeCommandParams } from 'lib/ChargeStation/utils';
import CommandDetailsModal from './CommandDetailsModal';
import { formatDateTimeRelative } from 'utils/date';
@screen
export default class Home extends React.Component {
  static title = 'Chargestation.one';
  static layout = 'simulator';

  state = {
    configuration: getConfiguration(),
    settings: getSettings(),
    session: getDefaultSession(),
    logEntries: [],
  };

  componentDidMount() {
    const { configuration, settings } = this.state;
    const chargeStation = new ChargeStation(configuration, settings);
    chargeStation.onLog = this.onLog;
    chargeStation.onError = this.onError;
    chargeStation.connect();
    this.setState({ chargeStation });
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
      sessionOnceStarted,
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
        <ErrorModal open={!!error} error={error} />
        <div className="logo">
          chargestation.one<p className="subtitle">OCPP simulator</p>
        </div>
        <div className="visualization">
          <div
            className={`car-1 ${
              chargeStation.hasRunningSession('1') ? 'animated' : ''
            } ${sessionOnceStarted ? '' : 'initial'}`}>
            <img src={car1Svg} />
          </div>
          <div
            className={`car-2 ${
              chargeStation.hasRunningSession('2') ? 'animated' : ''
            } ${sessionOnceStarted ? '' : 'initial'}`}>
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
              session={session}
              onSave={({ session }) => {
                this.setState({ session });
                chargeStation.startSession('1', session);
                this.nextTick();
                this.setState({ sessionOnceStarted: true });
              }}
              trigger={
                <Button
                  inverted
                  primary={chargeStation.hasRunningSession('1') ? false : true}
                  disabled={
                    chargeStation.hasRunningSession('1') ||
                    chargeStation.isStartingSession('1') ||
                    chargeStation.isStoppingSession('1')
                  }
                  loading={chargeStation.isStartingSession('1')}
                  icon="play"
                  content="Start Charging"
                />
              }
            />
            <Button
              inverted
              primary={chargeStation.hasRunningSession('1') ? true : false}
              disabled={
                !chargeStation.hasRunningSession('1') ||
                chargeStation.isStartingSession('1') ||
                chargeStation.isStoppingSession('1')
              }
              loading={chargeStation.isStoppingSession('1')}
              icon="stop"
              content="End Charging"
              onClick={async () => {
                await chargeStation.stopSession('1', () => {
                  this.nextTick();
                });
                this.nextTick();
              }}
            />
            <div className="right-actions">
              <Button to="/docs" as={Link} inverted icon="book" />
              <SettingsModal
                trigger={<Button inverted icon="setting" />}
                settings={settings}
                configuration={configuration}
                onSave={({ settings, configuration }) => {
                  this.setState({ settings, configuration }, () => {
                    chargeStation.configuration = configuration;
                    chargeStation.settings = settings;
                    chargeStation.disconnect();
                    setTimeout(() => {
                      chargeStation.connect();
                    }, 1000);
                  });
                }}
              />
            </div>
          </div>
          <div className="console">
            {logEntries.map((logEntry) => {
              if (logEntry.command) {
                const paramSummary = summarizeCommandParams(
                  logEntry.command.request
                );
                return (
                  <div
                    key={logEntry.id}
                    className="log-entry command"
                    onClick={() => {
                      this.setState({ inspectCommand: logEntry.command });
                    }}>
                    <div>
                      <span className="date-time">
                        {formatDateTimeRelative(logEntry.command.requestSentAt)}
                      </span>
                      &gt; {logEntry.command.request.method}{' '}
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
                      &lt; {JSON.stringify(logEntry.command.response)}
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

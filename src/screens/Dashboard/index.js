import React from 'react';
import screen from 'helpers/screen';
import { Button, Loader } from 'semantic';
import { Link } from 'react-router-dom';
import clock from 'lib/ChargeStation/clock';
import Papa from 'papaparse';

import ChargeStation from 'lib/ChargeStation';
import {
  getConfiguration,
  getDefaultSession,
  getDocumentQuery,
  getSettings,
  ocppVersion,
  settingsList,
} from 'lib/settings';

import chargeStationSvg from 'assets/charge-station.svg';
import chargeStationStatusSvg from 'assets/charge-station-status.svg';
import car1Svg from 'assets/car-1.svg';
import car2Svg from 'assets/car-2.svg';
import roadLogoSvg from 'assets/road-logo-dark-mode.svg';

import SettingsModal from './SettingsModal';

import './dashboard.less';
import StartSessionModal from './StartSessionModal';
import SendMessageModal from './SendMessageModal';
import ErrorModal from './ErrorModal';
import { summarizeCommandParams } from 'lib/ChargeStation/utils';
import CommandDetailsModal from './CommandDetailsModal';
import { formatDateTimeRelative } from 'utils/date';
import StopSessionModal from './StopSessionModal';
import StatusNotificationModal from './StatusNotificationModal';
import PlayCommandCsvModal from 'screens/Dashboard/PlayCommandCsvModal';
import ReplyMessageModal from './ReplyMessageModal';
import SetDateTimeModal from 'screens/Dashboard/SetDateTimeModal';
import { Grid, Statistic, StatisticLabel, StatisticValue } from 'semantic';
import { SessionStatistic } from 'screens/Dashboard/SessionStatistic';

const playCommandCsv = getDocumentQuery().has('playCommandCsv');

@screen
export default class Home extends React.Component {
  static title = 'Chargestation.one';
  static layout = 'simulator';

  state = {
    configuration: getConfiguration(
      ocppVersion(),
      getSettings(),
      getDocumentQuery()
    ),
    settings: getSettings(),
    session: getDefaultSession(),
    logEntries: [],
    session1OnceStarted: false,
    session2OnceStarted: false,
    speed: 1,
    speedChangeBurstReset: 0,
    speedChangeBurstTotal: 0,
  };

  async componentDidMount() {
    // check session storage

    let chargeStation = ChargeStation.load();
    if (chargeStation) {
      await new Promise((r) =>
        this.setState(
          {
            settings: chargeStation.settings,
            configuration: chargeStation.configuration,
          },
          r
        )
      );
    } else {
      const { configuration, settings } = this.state;
      chargeStation = new ChargeStation(configuration, settings);
    }

    chargeStation.onLog = this.onLog;
    chargeStation.onError = this.onError;
    chargeStation.onSessionStart = (connectorId) => {
      if (connectorId == '1') {
        this.setState({
          session1OnceStarted: true,
          session1Ongoing: true,
          session1Finishing: false,
        });
      } else {
        this.setState({
          session2OnceStarted: true,
          session2Ongoing: true,
          session2Finishing: false,
        });
      }
    };
    chargeStation.onSessionStop = (connectorId) => {
      if (connectorId == '1') {
        this.setState({
          session1OnceStarted: true,
          session1Ongoing: false,
          session1Finishing: true,
        });
      } else {
        this.setState({
          session2OnceStarted: true,
          session2Ongoing: false,
          session2Finishing: true,
        });
      }
      this.nextTick();
    };
    chargeStation.connect();
    this.setState({ chargeStation });
    this.tickInterval = setInterval(() => this.nextTick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.tickInterval);
  }

  setSpeed(speed) {
    if (this.state.speed === 1) {
      speed -= 1;
    }

    speed = Math.max(1, speed);
    clock.setSpeed(speed);
    this.setState({ speed });
  }

  setDate(date) {
    clock.setNow(date);
  }

  getDate() {
    return clock.now();
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

  growSpeed = (burstSize, stepSize) => {
    const { speed, speedChangeBurstReset, speedChangeBurstTotal } = this.state;
    if (speedChangeBurstReset) {
      clearTimeout(speedChangeBurstReset);
    }
    this.setState({
      speedChangeBurstReset: setTimeout(() => {
        this.setState({ speedChangeBurstTotal: 0, speedChangeBurstReset: 0 });
      }, 300),
    });
    this.setSpeed(
      speed +
        Math.ceil((speedChangeBurstTotal + 1) / Math.abs(burstSize)) * stepSize
    );
    this.setState({ speedChangeBurstTotal: speedChangeBurstTotal + 1 });
  };

  getCarAnimationClass = (connectorNo) => {
    if (this.state[`session${connectorNo}Ongoing`]) {
      return 'animated';
    }
    if (this.state[`session${connectorNo}Finishing`]) {
      return '';
    }

    return 'initial';
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
      speed,
      session1OnceStarted,
      session2OnceStarted,
    } = this.state;

    if (!chargeStation) {
      return <Loader />;
    }
    const chargeStationIsCharging =
      chargeStation.hasRunningSession(1) || chargeStation.hasRunningSession(2);
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
          <div className={`car-1 ${this.getCarAnimationClass(1)}`}>
            <img src={car1Svg} />
          </div>
          <div className={`car-2 ${this.getCarAnimationClass(2)}`}>
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

          <div className="realtime-statistics">
            {chargeStation?.getSessions()?.map((session) => (
              <SessionStatistic
                key={session.connectorId}
                connectorId={session.connectorId}
                kwhCharged={session.kwhElapsed}
                durationSeconds={session.secondsElapsed}
                stateOfCharge={session.stateOfCharge}
                startedAt={session.startTime}
              />
            ))}
          </div>

          <div className="time-control">
            <Grid centered>
              <Grid.Row>
                <Statistic size="tiny" className="time-control-statistic">
                  <StatisticLabel>session speed</StatisticLabel>
                  <StatisticValue>x{this.state.speed}</StatisticValue>
                </Statistic>
              </Grid.Row>
              <Grid.Row>
                <Button icon="play" onClick={() => this.setSpeed(1)} />
                <Button icon="backward" onClick={() => this.growSpeed(3, -5)} />
                <Button icon="forward" onClick={() => this.growSpeed(3, 5)} />
                <SetDateTimeModal
                  onSave={({ date }) => {
                    this.setDate(date);
                  }}
                  date={this.getDate()}
                  size={'mini'}
                  trigger={<Button icon="clock" />}
                />
              </Grid.Row>
            </Grid>
          </div>
        </div>
        <div className="terminal">
          <div className="actions">
            <StartSessionModal
              availableConnectors={chargeStation.availableConnectors()}
              session={session}
              onSave={({ connectorId, session, authorizationType }) => {
                this.setState({ session });
                chargeStation.startSession(
                  Number(connectorId),
                  session,
                  authorizationType
                );
                this.nextTick();
              }}
              trigger={
                <Button
                  inverted
                  primary={chargeStationIsCharging ? false : true}
                  loading={
                    chargeStation.isStartingSession(1) ||
                    chargeStation.isStartingSession(2)
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
                await chargeStation.sendStatusNotification(
                  parseInt(connectorId),
                  status
                );
                this.nextTick();
              }}
              trigger={
                <Button
                  inverted
                  primary={!!chargeStationIsCharging}
                  icon="signal"
                  content="Status"
                />
              }
            />

            <StopSessionModal
              availableConnectors={chargeStation.availableConnectors()}
              session={session}
              onSave={async ({ connectorId }) => {
                await chargeStation.stopSession(Number(connectorId));
                this.nextTick();
              }}
              trigger={
                <Button
                  inverted
                  primary={chargeStationIsCharging ? true : false}
                  disabled={!chargeStationIsCharging}
                  loading={
                    chargeStation.isStoppingSession(1) ||
                    chargeStation.isStoppingSession(2)
                  }
                  icon="stop"
                  content="End Charging"
                />
              }
            />

            <div className="right-actions">
              <Button
                to="/docs"
                as={Link}
                inverted
                icon="book"
                title={'Help'}
              />
              <SendMessageModal
                onSave={async ({ action, payload }) =>
                  chargeStation.writeCall(action, payload)
                }
                trigger={
                  <Button inverted icon="envelope" title={'Send Message'} />
                }
              />
              <ReplyMessageModal
                open={!!chargeStation.callToReplyManually}
                call={chargeStation.callToReplyManually}
                onSave={async ({ payload }) =>
                  chargeStation.writeCallResult(
                    chargeStation.callToReplyManually?.messageId,
                    payload
                  )
                }
                onClose={() => {
                  chargeStation.callToReplyManually = null;
                }}
              />
              {playCommandCsv && (
                <PlayCommandCsvModal
                  trigger={<Button inverted icon="upload" title={'Play CSV'} />}
                  onSave={({ commands }) => {
                    // Expected to match Road dashboard charging station CSV export format
                    const parsed = Papa.parse(commands, {
                      delimiter: ';',
                      header: true,
                    });
                    const rows = parsed.data.filter(
                      (row) => row.destination === 'centralsystem'
                    );
                    if (rows.length > 0) {
                      const id = setInterval(() => {
                        const row = rows.pop();
                        chargeStation.writeCall(
                          row.method,
                          JSON.parse(row.params)
                        );
                        if (rows.length === 0) {
                          clearInterval(id);
                        }
                      }, 1000);
                    }
                  }}
                />
              )}
              <SettingsModal
                trigger={<Button inverted icon="setting" />}
                settings={settings}
                configuration={configuration}
                settingsList={settingsList.filter((setting) =>
                  setting.predicate ? setting.predicate(settings) : true
                )}
                onProtocolChange={(ocppConfiguration) => {
                  const newConfiguration = getConfiguration(
                    ocppConfiguration,
                    settings
                  );
                  this.setState({
                    configuration: newConfiguration,
                  });
                }}
                onSave={({ config, settings: savedSettings }) => {
                  const newConfiguration = getConfiguration(
                    savedSettings.ocppConfiguration,
                    savedSettings
                  );

                  this.setState({
                    configuration: newConfiguration,
                  });
                  newConfiguration.updateVariablesFromKeyValueMap(config);
                  chargeStation.changeConfiguration(newConfiguration);
                  chargeStation.save();
                  this.setState(
                    {
                      settings: savedSettings,
                    },
                    () => {
                      chargeStation.settings = savedSettings;
                      chargeStation.ocppVersion =
                        chargeStation.settings.ocppConfiguration;
                      chargeStation.save();
                      chargeStation.disconnect();
                      setTimeout(() => {
                        chargeStation.connect();
                      }, 1000);
                    }
                  );
                }}
              />
            </div>
          </div>

          <div className="console">
            {logEntries.map((logEntry) => {
              if (logEntry.command) {
                const { command } = logEntry;
                const paramSummary = summarizeCommandParams(command.request);
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
                    <div
                      className="response"
                      data-method={command.request.method}>
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

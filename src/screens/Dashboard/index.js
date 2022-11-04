import React from 'react';
import screen from 'helpers/screen';
import { Button, Loader } from 'semantic';
import { Link } from 'react-router-dom';
import { Transition } from 'semantic-ui-react';

import ChargeStation from 'lib/ChargeStation';
import { getConfiguration, getSettings, getDefaultSession } from 'lib/settings';

import chargeStationSvg from 'assets/charge-station.svg';
import car1Svg from 'assets/car-1.svg';
import car2Svg from 'assets/car-2.svg';
import roadLogoSvg from 'assets/road-logo-dark-mode.svg';

import SettingsModal from './SettingsModal';

import './dashboard.less';
import StartSessionModal from './StartSessionModal';
import ErrorModal from './ErrorModal';
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
  }

  nextTick() {
    this.setState({ tick: Date.now() });
  }

  onLog = (logEntry) => {
    const { logEntries } = this.state;
    logEntries.push(logEntry);
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
    } = this.state;
    if (!chargeStation) {
      return <Loader />;
    }
    console.log(
      'chargeStation.hasRunningSession',
      chargeStation.hasRunningSession('1')
    );
    return (
      <div className="dashboard">
        <ErrorModal open={!!error} error={error} />
        <div className="logo">
          chargestation.one<p className="subtitle">OCPP simulator</p>
        </div>
        <div className="visualization">
          <div
            className={`car-1 ${
              chargeStation.hasRunningSession('1') ? 'animated' : ''
            } ${tick ? '' : 'initial'}`}>
            <img src={car1Svg} />
          </div>
          <div
            className={`car-2 ${
              chargeStation.hasRunningSession('2') ? 'animated' : ''
            } ${tick ? '' : 'initial'}`}>
            <img src={car2Svg} />
          </div>
          <div className="car-1-connector"></div>
          <div className="car-2-connector"></div>
          <div className="charge-station">
            <img src={chargeStationSvg} />
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
              }}
              trigger={
                <Button
                  inverted
                  primary={chargeStation.hasRunningSession('1') ? false : true}
                  disabled={chargeStation.hasRunningSession('1')}
                  icon="play"
                  content="Start Charging"
                />
              }
            />
            <Button
              inverted
              primary={chargeStation.hasRunningSession('1') ? true : false}
              disabled={!chargeStation.hasRunningSession('1')}
              icon="stop"
              content="End Charging"
              onClick={() => {
                chargeStation.stopSession('1');
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
                return (
                  <div key={logEntry.id} className="log-entry command">
                    <div>&gt; {logEntry.command.request.method}</div>
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

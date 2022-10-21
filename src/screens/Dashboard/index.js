import React from 'react';
import screen from 'helpers/screen';
import { Button, Loader } from 'semantic';
import { Transition } from 'semantic-ui-react';

import ChargeStation from 'lib/ChargeStation';
import { getConfiguration, getSettings } from 'lib/settings';

import chargeStationSvg from 'assets/charge-station.svg';
import car1Svg from 'assets/car-1.svg';
import car2Svg from 'assets/car-2.svg';
import roadLogoSvg from 'assets/road-logo-dark-mode.svg';

import SettingsModal from './SettingsModal';

import './dashboard.less';
@screen
export default class Home extends React.Component {
  static title = 'Charge Station One';
  static layout = 'simulator';

  state = {
    configuration: getConfiguration(),
    settings: getSettings(),
    logEntries: [],
  };

  componentDidMount() {
    const { configuration, settings } = this.state;
    const chargeStation = new ChargeStation(configuration, settings);
    chargeStation.onLog = this.onLog;
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

  render() {
    const { chargeStation, tick, logEntries, settings, configuration } =
      this.state;
    if (!chargeStation) {
      return <Loader />;
    }
    return (
      <div className="dashboard">
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
            <Button
              inverted
              primary={chargeStation.hasRunningSession('1') ? false : true}
              disabled={chargeStation.hasRunningSession('1')}
              icon="play"
              content="Start Charging"
              onClick={() => {
                chargeStation.startSession('1');
                this.nextTick();
              }}
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
              <SettingsModal
                trigger={<Button inverted icon="setting" />}
                settings={settings}
                configuration={configuration}
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

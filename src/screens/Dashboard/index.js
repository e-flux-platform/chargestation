import React from 'react';
import screen from 'helpers/screen';
import { Button, Loader } from 'semantic';
import { Transition } from 'semantic-ui-react';

import ChargeStation from 'lib/ChargeStation';

import chargeStationSvg from 'assets/charge-station.svg';
import car1Svg from 'assets/car-1.svg';
import car2Svg from 'assets/car-2.svg';
import roadLogoSvg from 'assets/road-logo-dark-mode.svg';

// TODO: make this configurable via params
function getConfiguration() {
  return {
    Identity: 'ChargeStationOne',
  };
}

function getOptions() {
  return {
    ocppBaseUrl: 'ws://localhost:2600/1.6/e-flux',
  };
}

import './dashboard.less';
@screen
export default class Home extends React.Component {
  static title = 'Charge Station One';
  static layout = 'simulator';

  state = {
    logEntries: [],
  };

  componentDidMount() {
    const chargeStation = new ChargeStation(getConfiguration(), getOptions());
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
    const { chargeStation, tick, logEntries } = this.state;
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
              <Button inverted icon="setting" />
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

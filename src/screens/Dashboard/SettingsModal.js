import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';
import SettingsInput from 'screens/Dashboard/SettingsInput';

@modal
export default class SettingsModal extends React.Component {
  state = {
    config: this.props.configuration.variablesToKeyValueMap(),
    settings: this.props.settings || [],
    settingsList: this.props.settingsList || [],
  };

  setSettingsField = (e, { name, value }) => {
    this.setState({
      settings: {
        ...this.state.settings,
        [name]: value,
      },
      configuration: this.state.configuration,
    });
  };

  setConfigurationField = (e, { name, value }) => {
    this.setState({
      config: {
        ...this.state.config,
        [name]: {
          ...this.state.config[name],
          value,
        },
      },
      settings: this.state.settings,
    });
  };

  static getDerivedStateFromProps({ configuration, settings }, prevState) {
    if (configuration.getVersion() != prevState.currentVersion) {
      return {
        ...prevState,
        config: configuration.variablesToKeyValueMap(),
        currentVersion: configuration.getVersion(),
      };
    }
    return prevState;
  }

  onSubmit = () => {
    this.props.onSave(this.state);
    this.props.close();
  };

  render() {
    const { config, settings, settingsList } = this.state;

    return (
      <>
        <Modal.Header>Settings &amp; Configuration</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit} id="edit-settings">
            <Header as="h3" content="Settings" />
            {settingsList?.map((item) => {
              return (
                <div key={item.key} style={{ marginBottom: '8px' }}>
                  <SettingsInput
                    item={item}
                    value={settings[item.key]?.toString()}
                    onChange={(e, { name, value }) => {
                      if (name === 'ocppConfiguration') {
                        this.props.onProtocolChange(value);
                      }
                      this.setSettingsField(e, { name, value });
                    }}
                  />
                </div>
              );
            })}
            <Divider hidden />
            <Header as="h3" content="Configuration Keys" />
            {Object.values(config).map((item) => {
              return (
                <SettingsInput
                  key={item.key}
                  item={{
                    ...item,
                    name: item.key,
                  }}
                  value={item.value}
                  onChange={this.setConfigurationField}
                />
              );
            })}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="edit-settings" content="Save" />
        </Modal.Actions>
      </>
    );
  }
}

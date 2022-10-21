import React from 'react';
import { Modal, Button, Form, Header } from 'semantic';
import modal from 'helpers/modal';
import { settingsList, getConfiguration, configuration } from 'lib/settings';

@modal
export default class SettingsModal extends React.Component {
  state = {
    settings: this.props.settings,
    configuration: this.props.configuration,
  };
  setField = (e, { name, value }) => {
    this.setState({
      settings: {
        ...this.state.settings,
        [name]: value,
      },
    });
  };
  setConfigurationField = (e, { name, value }) => {
    this.setState({
      configuration: {
        ...this.state.settings,
        [name]: value,
      },
    });
  };
  onSubmit = () => {
    this.props.onSave();
  };
  render() {
    const { settings, configuration } = this.state;
    return (
      <>
        <Modal.Header>Settings &amp; Configuration</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit}>
            <Header as="h3" content="Settings" />
            {settingsList.map((item) => {
              return (
                <Form.Input
                  key={item.key}
                  label={item.name}
                  name={item.key}
                  value={settings[item.key]}
                  onChange={this.setField}
                />
              );
            })}

            <Header as="h3" content="Configuration Keys" />
            {Object.keys(getConfiguration()).map((key) => {
              return (
                <Form.Input
                  key={key}
                  label={key}
                  name={key}
                  value={configuration[key]}
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

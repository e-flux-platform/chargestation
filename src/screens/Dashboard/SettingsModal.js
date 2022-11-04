import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';
import {
  settingsList,
  getConfiguration,
  getConfigurationItem,
} from 'lib/settings';
import { HelpTip } from 'components';

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
                <div key={item.key}>
                  <Form.Input
                    label={
                      <strong
                        style={{
                          marginBottom: '4px',
                          display: 'inline-block',
                        }}>
                        {item.name}
                        {item.description && (
                          <HelpTip text={item.description} />
                        )}
                      </strong>
                    }
                    name={item.key}
                    value={settings[item.key]}
                    onChange={this.setField}
                  />
                </div>
              );
            })}
            <Divider hidden />
            <Header as="h3" content="Configuration Keys" />
            {Object.keys(getConfiguration()).map((key) => {
              const item = getConfigurationItem(key);
              return (
                <Form.Input
                  key={key}
                  label={
                    <strong
                      style={{
                        marginBottom: '4px',
                        display: 'inline-block',
                      }}>
                      {key}
                      {item?.description && <HelpTip text={item.description} />}
                    </strong>
                  }
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

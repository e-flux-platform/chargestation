import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';
import { sessionSettingsList } from 'lib/settings';
import { HelpTip } from 'components';

@modal
export default class StartSessionModal extends React.Component {
  state = {
    session: this.props.session,
    configuration: this.props.configuration,
  };
  setField = (e, { name, value }) => {
    this.setState({
      session: {
        ...this.state.session,
        [name]: value,
      },
    });
  };
  setConfigurationField = (e, { name, value }) => {
    this.setState({
      configuration: {
        ...this.state.session,
        [name]: value,
      },
    });
  };
  onSubmit = () => {
    this.props.onSave(this.state);
    this.props.close();
  };
  render() {
    const { session } = this.state;
    return (
      <>
        <Modal.Header>Start Session</Modal.Header>
        <Modal.Content>
          <p>
            Note: In order for a session to be included in billing, it typically
            takes at least 4 minutes (due to checks on kWh and duration).
          </p>
          <Form onSubmit={this.onSubmit} id="edit-settings">
            {sessionSettingsList.map((item) => {
              return (
                <div key={item.key} style={{ marginBottom: '8px' }}>
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
                    value={session[item.key]}
                    onChange={this.setField}
                  />
                </div>
              );
            })}
            <Divider hidden />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="edit-settings" content="Start" />
        </Modal.Actions>
      </>
    );
  }
}

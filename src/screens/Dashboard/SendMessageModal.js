import React from 'react';
import { Modal, Button, Form, Divider } from 'semantic';
import modal from 'helpers/modal';

@modal
export default class SendMessageModal extends React.Component {
  state = {
    action: 'Heartbeat',
    payload: '{}',
  };

  onSubmit = () => {
    const payload = this.state.payload ? JSON.parse(this.state.payload) : '';
    this.props.onSave({ action: this.state.action, payload });
    this.props.close();
  };

  render() {
    return (
      <>
        <Modal.Header>Send Message to OCPP Server</Modal.Header>
        <Modal.Content>
          <p>Send a message to the OCPP server in a JSON format</p>
          <Form onSubmit={this.onSubmit} id="send-message-form">
            <Form.Input
              label="Action"
              name="action"
              value={this.state.action}
              onChange={(e) => this.setState({ action: e.target.value })}
            />
            <Form.TextArea
              label="Payload"
              name="payload"
              value={this.state.payload}
              onChange={(e) => this.setState({ payload: e.target.value })}
            />
            <Divider hidden />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="send-message-form" content="Send" />
        </Modal.Actions>
      </>
    );
  }
}

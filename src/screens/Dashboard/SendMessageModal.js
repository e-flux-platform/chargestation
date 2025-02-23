import React from 'react';

import { Modal, Button, Form, Divider, Message } from 'semantic';

import modal from 'helpers/modal';

@modal
export default class SendMessageModal extends React.Component {
  state = {
    action: 'Heartbeat',
    payload: '{}',
    error: null,
  };

  onSubmit = () => {
    try {
      this.setState({ error: null });
      const payload = this.state.payload ? JSON.parse(this.state.payload) : '';
      this.props.onSave({ action: this.state.action, payload });
      this.props.close();
    } catch (e) {
      this.setState({ error: e.message });
      console.error(e);
    }
  };

  render() {
    return (
      <>
        <Modal.Header>Send Message</Modal.Header>
        <Modal.Content>
          <p>Send a message to the Central System</p>
          <Form onSubmit={this.onSubmit} id="send-message-form">
            <Form.Input
              label="Action"
              name="action"
              value={this.state.action}
              onChange={(e) => this.setState({ action: e.target.value })}
            />
            <Form.TextArea
              label="Payload (JSON format)"
              name="payload"
              value={this.state.payload}
              onChange={(e) => this.setState({ payload: e.target.value })}
            />
            <Divider hidden />
          </Form>
          {this.state.error && <Message error>{this.state.error}</Message>}
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="send-message-form" content="Send" />
        </Modal.Actions>
      </>
    );
  }
}

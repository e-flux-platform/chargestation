import React from 'react';

import { Modal, Button, Form, Divider } from 'semantic';

import modal from 'helpers/modal';

@modal
export default class ReplyMessageModal extends React.Component {
  state = {
    payload: null,
  };

  onSubmit = () => {
    const payload = this.state.payload ? JSON.parse(this.state.payload) : '';
    this.props.onSave({ payload });
    this.props.close();
  };

  render() {
    const { call } = this.props;

    return (
      <>
        <Modal.Header>Reply Message</Modal.Header>
        <Modal.Content>
          <p>
            Send a reply message to the following message in a JSON format (or
            empty if it doesn't require a reply):
          </p>
          <p>
            <b>Action:</b> {call.action}
          </p>
          <p>
            <b>Payload:</b> {call.from}
          </p>
          <p>
            <code>{JSON.stringify(call.payload, null, 2)}</code>
          </p>

          <Divider />
          <Form onSubmit={this.onSubmit} id="reply-message-form">
            <Form.TextArea
              label="Response"
              name="payload"
              value={this.state.payload}
              onChange={(e) => this.setState({ payload: e.target.value })}
            />
            <Divider hidden />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="reply-message-form" content="Reply" />
        </Modal.Actions>
      </>
    );
  }
}

import React from 'react';
import { Modal, Button, Form, Message } from 'semantic';
import modal from 'helpers/modal';

@modal
export default class ErrorModal extends React.Component {
  onSubmit = () => {
    this.props.close();
  };
  render() {
    const { error } = this.props;
    return (
      <>
        <Modal.Header>Error</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit} id="error-modal">
            <Message content={error.message} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="error-modal" content="Close" />
        </Modal.Actions>
      </>
    );
  }
}

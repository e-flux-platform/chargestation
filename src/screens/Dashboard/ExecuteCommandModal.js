import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';

@modal
export default class ExecuteCommandModal extends React.Component {
  state = {
    commands: '',
  };
  setField = (e, { name, value }) => {
    this.setState({
      ...this.state,
      [name]: value,
    });
  };
  onSubmit = () => {
    this.props.onSave(this.state);
    this.props.close();
  };
  render() {
    const { commands } = this.state;

    return (
      <>
        <Modal.Header>Execute Command</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit} id="execute-command">
            <Form.TextArea
              value={commands}
              name="commands"
              label="Commands"
              type="text"
              required
              onChange={this.setField}
              rows={20}
            />
            <Divider hidden />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="execute-command" content="Execute" />
        </Modal.Actions>
      </>
    );
  }
}

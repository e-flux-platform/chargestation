import React from 'react';
import { Modal, Button, Form, Message, Header } from 'semantic';
import modal from 'helpers/modal';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import { formatDateTimePrecise } from 'utils/date';

@modal
export default class CommandDetailsModal extends React.Component {
  render() {
    const { command } = this.props;
    return (
      <>
        <Modal.Header>Command Details</Modal.Header>
        <Modal.Content>
          {command.destination === 'central-server' ? (
            <p>
              Request from Charge Station (sent at{' '}
              {formatDateTimePrecise(command.requestSentAt)}):
            </p>
          ) : (
            <p>
              Request from Central Server (received at{' '}
              {formatDateTimePrecise(command.requestReceivedAt)}):
            </p>
          )}
          <SyntaxHighlighter language="json" style={atomDark}>
            {JSON.stringify(command?.request || {}, null, 2)}
          </SyntaxHighlighter>
          {command.destination === 'central-server' ? (
            <p>
              Response from Central Server (received at{' '}
              {formatDateTimePrecise(command.responseReceivedAt)}):
            </p>
          ) : (
            <p>
              Response from Charge Station (sent at{' '}
              {formatDateTimePrecise(command.responseSentAt)}):
            </p>
          )}
          <SyntaxHighlighter language="json" style={atomDark}>
            {JSON.stringify(command?.response || {}, null, 2)}
          </SyntaxHighlighter>
        </Modal.Content>
        <Modal.Actions>
          <Button primary content="Close" onClick={() => this.props.close()} />
        </Modal.Actions>
      </>
    );
  }
}

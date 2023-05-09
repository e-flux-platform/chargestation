import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';
import { sessionSettingsList } from 'lib/settings';
import { HelpTip } from 'components';

function selectDefaultConnector(availableConnectors) {
  return ['1', '2'].filter((connectorId) => {
    return !availableConnectors.includes(connectorId);
  });
}
@modal
export default class FinishChargingModal extends React.Component {
  state = {
    session: this.props.session,
    connectorId: selectDefaultConnector(this.props.availableConnectors)[0],
  };
  componentDidUpdate(prevProps) {
    if (
      prevProps.availableConnectors.length !==
      this.props.availableConnectors.length
    ) {
      this.setState({
        connectorId: selectDefaultConnector(this.props.availableConnectors)[0],
      });
    }
  }
  onSubmit = () => {
    this.props.onSave(this.state);
    this.props.close();
  };
  render() {
    const { connectorId } = this.state;
    const { availableConnectors } = this.props;
    console.log('availableConnectors', availableConnectors);
    console.log('connectorId', connectorId);
    const connectorOptions = ['1', '2'].map((key) => {
      return {
        key,
        text: `Connector ${key}`,
        value: key,
        disabled: availableConnectors.includes(key),
      };
    });
    return (
      <>
        <Modal.Header>Finish Charging</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit} id="edit-finish-charging">
            <Form.Dropdown
              label="Connector"
              options={connectorOptions}
              selection
              value={connectorId}
              onChange={(e, { value }) => {
                this.setState({ connectorId: value });
              }}
            />
            <Divider hidden />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="edit-finish-charging" content="Finish" />
        </Modal.Actions>
      </>
    );
  }
}

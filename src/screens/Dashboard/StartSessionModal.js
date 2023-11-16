import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';
import { AuthorizationType, sessionSettingsList } from 'lib/settings';
import { HelpTip } from 'components';

@modal
export default class StartSessionModal extends React.Component {
  state = {
    session: this.props.session,
    connectorId: this.props.availableConnectors[0],
    authorizationType: AuthorizationType.RFID,
  };
  setField = (e, { name, value }) => {
    this.setState({
      session: {
        ...this.state.session,
        [name]: value,
      },
      connectorId: this.state.connectorId,
    });
  };
  onSubmit = () => {
    this.props.onSave(this.state);
    this.props.close();
  };
  render() {
    const { session, connectorId, authorizationType } = this.state;
    const { availableConnectors } = this.props;
    const connectorOptions = ['1', '2'].map((key) => {
      return {
        key,
        text: `Connector ${key}`,
        value: key,
        disabled: !availableConnectors.includes(key),
      };
    });
    const authorizationTypeOptions = Object.entries(AuthorizationType).map(
      ([key, value]) => {
        return {
          key,
          text: key,
          value: value,
        };
      }
    );

    return (
      <>
        <Modal.Header>Start Session</Modal.Header>
        <Modal.Content>
          <p>
            Note: In order for a session to be included in billing, it typically
            takes at least 2 minutes (due to checks on kWh and duration).
          </p>
          <Form onSubmit={this.onSubmit} id="edit-start-session">
            <Form.Dropdown
              label="Connector"
              options={connectorOptions}
              selection
              value={connectorId}
              onChange={(e, { value }) => {
                this.setState({ connectorId: value });
              }}
            />
            <Form.Dropdown
              label="Authorization type"
              selection
              options={authorizationTypeOptions}
              value={authorizationType}
              onChange={(e, { value }) => {
                this.setState({ authorizationType: value });
              }}
            />
            {connectorId && (
              <React.Fragment>
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
              </React.Fragment>
            )}
            <Divider hidden />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="edit-start-session" content="Start" />
        </Modal.Actions>
      </>
    );
  }
}

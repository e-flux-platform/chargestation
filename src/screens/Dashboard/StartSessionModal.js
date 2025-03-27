import React from 'react';
import { Modal, Button, Form, Header, Divider } from 'semantic';
import modal from 'helpers/modal';
import { AuthorizationType, sessionSettingsList } from 'lib/settings';
import SettingsInput from 'screens/Dashboard/SettingsInput';
import { FormField, Label } from 'semantic-ui-react';

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
                      <SettingsInput
                        item={item}
                        value={session[item.key]?.toString()}
                        onChange={this.setField}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            )}
            <Divider hidden />
            <FormField inline>
              <Form.Checkbox
                label="Ignore CSMS Authorization response"
                name="ignoreCSMSAuthResponse"
                checked={session.ignoreCSMSAuthResponse}
                onChange={(e, { name, checked }) => {
                  this.setField(e, { name, value: checked });
                }}
              />

              <Label pointing>
                When enabled, the station will ignore the authorization response
                coming from the CSMS. This is useful for testing CSMS behaviour in
                such a situation.
              </Label>
            </FormField>
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

import { EventTypes as e } from '../eventHandlers/event-types';
import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';
import sendStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-16/send-start-transaction';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import sendAuthorize from 'lib/ChargeStation/eventHandlers/ocpp-16/send-authorize';
import { AuthorizationType } from 'lib/settings';

const initiateSession: ChargeStationEventHandler = async (params) => {
  const { session, chargepoint } = params;
  if (session.options.authorizationType === AuthorizationType.CreditCard) {
    session.options.uid = chargepoint.configuration.getVariableValue(
      'CreditIdToken'
    ) as string;
    await sendStartTransaction(params);
  } else {
    await sendAuthorize(params);
  }
};

export default {
  ...DefaultOCPP16,
  [e.SessionStartInitiated]: [initiateSession],
};

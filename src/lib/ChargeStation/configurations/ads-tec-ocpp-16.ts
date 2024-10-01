import { EventTypes as e } from '../eventHandlers/event-types';
import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizationType } from 'lib/settings';
import sendAuthorizeOrStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-16/send-authorize-or-start-transaction';

const initiateSession: ChargeStationEventHandler = async (params) => {
  const { session, chargepoint } = params;
  if (session.options.authorizationType === AuthorizationType.CreditCard) {
    session.options.uid = chargepoint.configuration.getVariableValue(
      'CreditIdToken'
    ) as string;
    session.options.skipAuthorize = true;
  }
  return sendAuthorizeOrStartTransaction(params);
};

export default {
  ...DefaultOCPP16,
  [e.SessionStartInitiated]: [initiateSession],
};

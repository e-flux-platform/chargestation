import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizationType } from 'lib/settings';

const overrideSessionUid: ChargeStationEventHandler = async (params) => {
  const { session, chargepoint } = params;
  if (session.options.authorizationType !== AuthorizationType.CreditCard) {
    return; // retain current idTag
  }

  session.options.uid = chargepoint.configuration.getVariableValue(
    'TPE_OCPP_TAGID'
  ) as string;
  session.options.skipAuthorize = true; // always skipped for card payment cases
};

export default overrideSessionUid;

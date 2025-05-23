import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizationType } from 'lib/settings';

const overrideSessionUid: ChargeStationEventHandler = async (params) => {
  const { session, chargepoint } = params;
  if (session.options.authorizationType !== AuthorizationType.CreditCard) {
    return; // retain current idTag
  }

  const prefix = chargepoint.settings.g2MobilityIdTagPrefix;

  session.options.uid = `${prefix}*${Math.floor(Math.random() * 999999)}`;
  session.options.skipAuthorize = true; // always skipped for card payment cases
};

export default overrideSessionUid;

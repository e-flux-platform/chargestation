import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const generateSessionUid: ChargeStationEventHandler = ({
  session,
  chargepoint,
}) => {
  const prefix = chargepoint.configuration.getVariableValue(
    'PaymentCardIdTagPrefix'
  );
  session.options.uid = `${prefix}${Math.floor(Math.random() * 999999)}`;
};

export default generateSessionUid;

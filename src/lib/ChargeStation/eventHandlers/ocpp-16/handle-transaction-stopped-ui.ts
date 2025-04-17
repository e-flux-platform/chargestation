import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

interface ChargeStationWithUI extends Record<string, any> {
  onSessionStop?: (connectorId: number) => void;
}

const handleTransactionStoppedUI: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  if (session) {
    // Use type assertion to handle the dynamically added property
    const chargepointWithUI = chargepoint as unknown as ChargeStationWithUI;
    if (chargepointWithUI.onSessionStop) {
      chargepointWithUI.onSessionStop(session.connectorId);
    }
  }
};

export default handleTransactionStoppedUI;

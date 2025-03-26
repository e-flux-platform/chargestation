import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

interface ChargeStationWithUI extends Record<string, any> {
  onSessionStart?: (connectorId: number) => void;
}

const handleTransactionStartedUI: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  if (session) {
    // Use type assertion to handle the dynamically added property
    const chargepointWithUI = chargepoint as unknown as ChargeStationWithUI;
    if (chargepointWithUI.onSessionStart) {
      chargepointWithUI.onSessionStart(session.connectorId);
    }
  }
};

export default handleTransactionStartedUI;

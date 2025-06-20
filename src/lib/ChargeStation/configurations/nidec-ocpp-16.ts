import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';
import { EventTypes as e } from 'lib/ChargeStation/eventHandlers/event-types';
import { sendMeterConfiguration } from 'lib/ChargeStation/eventHandlers/ocpp-16/nidec/handle-boot-notification-received';

export default {
  ...DefaultOCPP16,
  [e.BootNotificationAccepted]: [
    ...DefaultOCPP16[e.BootNotificationAccepted],
    sendMeterConfiguration,
  ],
};

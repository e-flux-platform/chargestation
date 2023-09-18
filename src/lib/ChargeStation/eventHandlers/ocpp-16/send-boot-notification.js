import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function sendBootNotification({ chargepoint, emitter }) {
  await sleep(2000);

  await chargepoint.sendCommand('BootNotification', {
    chargePointVendor: chargepoint.options.chargePointVendor,
    chargePointModel: chargepoint.options.chargePointModel,
    chargePointSerialNumber: chargepoint.options.chargePointSerialNumber,
    chargeBoxSerialNumber: chargepoint.configuration.Identity,
    firmwareVersion: 'v1-000',
    iccid: chargepoint.options.iccid,
    imsi: chargepoint.options.imsi,
  });

  emitter.emitEvent(EventTypes16.BootNotificationAccepted);
}

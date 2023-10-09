import { sleep } from '../../../../utils/csv';

export default async function sendBootNotification({ chargepoint, emitter }) {
  await sleep(2000);

  chargepoint.writeCall('BootNotification', {
    reason: 'PowerUp',
    chargingStation: {
      serialNumber: chargepoint.options.chargePointSerialNumber,
      model: chargepoint.options.chargePointModel,
      vendorName: chargepoint.options.chargePointVendor,
      firmwareVersion: 'v1-000',
    },
  });
}

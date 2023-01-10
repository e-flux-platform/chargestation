export const settingsList = [
  {
    key: 'ocppBaseUrl',
    name: 'OCPP Base URL',
    description: 'Websocket server to connect with',
    defaultValue: 'ws://localhost:2600/1.6/e-flux',
  },
  {
    key: 'chargepointVendor',
    name: 'Boot / Vendor',
    description: 'The chargepointVendor sent during BootNotification',
    defaultValue: 'Chargepoint.one',
  },
  {
    key: 'chargePointModel',
    name: 'Boot / Model',
    description: 'The chargePointModel sent during BootNotification',
    defaultValue: 'Chargepoint.one v1',
  },
  {
    key: 'chargePointSerialNumber',
    name: 'Boot / Serial Number',
    description: 'The chargePointSerialNumber sent during BootNotification',
    defaultValue: 'CP1-2919101',
  },
  {
    key: 'iccid',
    name: 'Boot / MoICCID',
    description: 'The iccid sent during BootNotification',
    defaultValue: '8888888888088888888F',
  },
  {
    key: 'imsi',
    name: 'Boot / IMSI',
    description: 'The imsi sent during BootNotification',
    defaultValue: '888888888888888',
  },
];

export const configurationList = [
  {
    key: 'Identity',
    description: 'OCPP Identity used in authenticating the charge station',
    defaultValue: 'ChargeStationOne',
  },
  {
    key: 'HeartbeatInterval',
    description: 'Frequency of Heartbeat commands in seconds',
    defaultValue: 50,
  },
  {
    key: 'MeterValueSampleInterval',
    description: 'Frequency of MeterValues commands in seconds',
    defaultValue: 60,
  },
  {
    key: 'NumberOfConnectors',
    description:
      'The number of sockets connected to this EVSE (only applies to configuration)',
    defaultValue: 2,
  },
];

export const sessionSettingsList = [
  {
    key: 'uid',
    name: 'UID',
    description: 'RFID card UID that would be used in a StartSession',
    defaultValue: 'FF88888801',
  },
  {
    key: 'maxPowerKw',
    name: "Charge Station's Max Power (kW)",
    description:
      'The power in kW that this charge startion can deliver to a car (e.g. AC single phase is 7.4kW, AC three phase is 22kW, DC Fast charger is 25-175kW',
    defaultValue: 75,
  },
  {
    key: 'carBatteryKwh',
    name: 'Car Battery Capacity (kWh)',
    description:
      "The car battery capacity that we're simulating in kWh - is used for determinig when to flatten MeterValues and send SuspendedEV notice",
    defaultValue: 64,
  },
  {
    key: 'carBatteryStateOfCharge',
    name: 'Car Battery State of Charge (%)',
    description:
      'How full is the car battery we are simulating - is used for determinig when to flatten MeterValues and send SuspendedEV notice',
    defaultValue: 80,
  },
];

function getDocumentQuery() {
  return new URLSearchParams(document.location.search);
}

export function getSettings() {
  const query = getDocumentQuery();
  const result = {};
  for (const item of settingsList) {
    const { key } = item;
    if (query.get(key)) {
      result[key] = query.get(key);
      continue;
    }
    result[key] = item.defaultValue;
  }
  return result;
}

export function getConfiguration() {
  const query = getDocumentQuery();
  const result = {};
  for (const item of configurationList) {
    const { key } = item;
    if (query.get(key)) {
      result[key] = query.get(key);
      continue;
    }
    result[key] = item.defaultValue;
  }
  return result;
}

export function getConfigurationItem(key) {
  return configurationList.filter((item) => item.key === key)[0];
}

export function getDefaultSession() {
  const query = getDocumentQuery();
  const result = {};
  for (const item of sessionSettingsList) {
    const { key } = item;
    if (query.get(key)) {
      result[key] = query.get(key);
      continue;
    }
    result[key] = item.defaultValue;
  }
  return result;
}

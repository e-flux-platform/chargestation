export const settingsList = [
  {
    key: 'ocppProtocol',
    name: 'OCPP Protocol',
    description: 'OCPP protocol version to use',
    defaultValue: '1.6',
  },
  {
    key: 'ocppBaseUrl',
    name: 'OCPP Base URL',
    description: 'Websocket server to connect with',
    defaultValue: 'ws://localhost:2600/1.6/e-flux',
  },
  {
    key: 'chargePointVendor',
    name: 'Boot / Vendor',
    description: 'The chargePointVendor sent during BootNotification',
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
    key: 'identity',
    name: {
      '1.6': 'Identity',
      '2.0.1': 'Identity',
    },
    description: 'OCPP Identity used in authenticating the charge station',
    defaultValue: 'ChargeStationOne',
    component: 'SecurityCtrlr',
    mutability: 'ReadOnly',
    dataType: 'string',
    maxLimit: 48,
  },
  {
    key: 'heartbeat-interval',
    name: {
      '1.6': 'HeartbeatInterval',
      '2.0.1': 'HeartbeatInterval',
    },
    description: 'Frequency of Heartbeat commands in seconds',
    defaultValue: 50,
    component: 'OCPPCommCtrlr',
    mutability: 'ReadWrite',
    unit: 'seconds',
    dataType: 'integer',
    minLimit: 1,
  },
  {
    key: 'meter-value-sample-interval',
    name: {
      '1.6': 'MeterValueSampleInterval',
      '2.0.1': 'SampledDataTxUpdatedInterval',
    },
    description: 'Frequency at which meter value updates are sent',
    defaultValue: 60,
    component: 'SampledDataCtrlr',
    mutability: 'ReadWrite',
    unit: 'seconds',
    dataType: 'integer',
  },
  {
    key: 'number-of-connectors',
    name: {
      '1.6': 'NumberOfConnectors',
    },
    description:
      'The number of sockets connected to this EVSE (only applies to configuration)',
    defaultValue: 2,
  },
  {
    key: 'connector-1-type',
    name: {
      '1.6': 'Connector1-Type',
      '2.0.1': 'ConnectorType',
    },
    description: 'Meta data about connector type on connector 1',
    defaultValue: 'Type 2 socket',
    component: 'Connector',
    evseId: 1,
    evseConnectorId: 1,
    mutability: 'ReadOnly',
    dataType: 'string',
  },
  {
    key: 'connector-2-type',
    name: {
      '1.6': 'Connector2-Type',
      '2.0.1': 'ConnectorType',
    },
    description: 'Meta data about connector type on connector 2',
    defaultValue: 'Type 2 socket',
    component: 'Connector',
    evseId: 1,
    evseConnectorId: 2,
    mutability: 'ReadOnly',
    dataType: 'string',
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

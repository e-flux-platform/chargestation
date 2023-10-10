export const settingsList = [
  {
    key: 'ocppBaseUrl',
    name: 'OCPP Base URL',
    description: 'Websocket server to connect with',
    defaultValue: 'ws://localhost:2600/1.6/e-flux',
  },
  // TODO: Make dropdown
  // Eventually a configuration should be selected automatically based on the Chargepoint model
  {
    key: 'ocppConfiguration',
    name: 'OCPP Configuration',
    description: 'OCPP Configuration to use (ocpp1.6 or ocpp2.0.1)',
    defaultValue: 'ocpp1.6',
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

export const configurationList16 = [
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
  {
    key: 'Connector1-Type',
    description: 'Meta data about connector type on connector 1',
    defaultValue: 'Type 2 socket',
  },
  {
    key: 'Connector1-MaxCurrent',
    description: 'Meta data about max current on connector 1',
    defaultValue: 32,
  },
  {
    key: 'Connector2-Type',
    description: 'Meta data about connector type on connector 2',
    defaultValue: 'Type 2 socket',
  },
  {
    key: 'Connector2-MaxCurrent',
    description: 'Meta data about max current on connector 2',
    defaultValue: 32,
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

export const configurationList201 = [
  {
    component: {
      name: 'SecurityCtrlr',
    },
    variable: {
      name: 'Identity',
    },
    variableAttribute: [
      {
        value: 'ChargeStationOne',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'string',
      maxLimit: 48,
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AlignedDataCtrlr',
    },
    variable: {
      name: 'Interval',
    },
    variableAttribute: [
      {
        value: '0',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      unit: 'seconds',
      dataType: 'integer',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AlignedDataCtrlr',
    },
    variable: {
      name: 'Measurands',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
  },
  {
    component: {
      name: 'AlignedDataCtrlr',
    },
    variable: {
      name: 'SignReadings',
    },
    variableAttribute: [
      {
        value: 'true',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'boolean',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AlignedDataCtrlr',
    },
    variable: {
      name: 'TxEndedInterval',
    },
    variableAttribute: [
      {
        value: '0',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      unit: 'seconds',
      dataType: 'integer',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AlignedDataCtrlr',
    },
    variable: {
      name: 'TxEndedMeasurands',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
  },
  {
    component: {
      name: 'AuthCtrlr',
    },
    variable: {
      name: 'OfflineTxForUnknownIdEnabled',
    },
    variableAttribute: [
      {
        value: 'true',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'boolean',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AuthCtrlr',
    },
    variable: {
      name: 'AuthorizeRemoteStart',
    },
    variableAttribute: [
      {
        value: 'true',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'boolean',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AuthCtrlr',
    },
    variable: {
      name: 'LocalAuthorizeOffline',
    },
    variableAttribute: [
      {
        value: 'true',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'boolean',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AuthCtrlr',
    },
    variable: {
      name: 'LocalPreAuthorize',
    },
    variableAttribute: [
      {
        value: 'false',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'boolean',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AuthCtrlr',
    },
    variable: {
      name: 'MasterPassGroupId',
    },
    variableAttribute: [
      {
        value: '                                     ',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'string',
      maxLimit: 36,
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'AuthCacheCtrlr',
    },
    variable: {
      name: 'Enabled',
    },
    variableAttribute: [
      {
        value: 'false',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'boolean',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'NtpServerUri',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'string',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'NtpSource',
    },
    variableAttribute: [
      {
        value: 'DHCP',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'OptionList',
      valuesList: 'DHCP,manual',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'TimeOffset',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'string',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'NextTimeOffsetTransitionDateTime',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'dateTime',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'TimeOffsetNextTransition',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'string',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'TimeSource',
    },
    variableAttribute: [
      {
        value: 'Heartbeat,RealTimeClock',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'SequenceList',
      valuesList:
        'Heartbeat,NTP,GPS,RealTimeClock,MobileNetwork,RadioTimeTransmitter',
      supportsMonitoring: false,
    },
  },
  {
    component: {
      name: 'ClockCtrlr',
    },
    variable: {
      name: 'TimeZone',
    },
    variableAttribute: [
      {
        value: '',
        persistent: true,
        constant: false,
      },
    ],
    variableCharacteristics: {
      dataType: 'string',
      supportsMonitoring: false,
    },
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

export function getConfiguration(ocppVersion) {
  if (ocppVersion === 'ocpp2.0.1') {
    return buildConfigurationMap201();
  }

  return buildConfigurationMap16();
}

export function getConfigurationItem(ocppVersion, key) {
  return getConfigurationList(ocppVersion).filter(
    (item) => item.key === key
  )[0];
}

export function ocppVersion() {
  return getSettings().ocppConfiguration;
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

function buildConfigurationMap201() {
  const query = getDocumentQuery();
  const list = configurationList201;
  const result = {};

  for (const item of list) {
    const variableName = item.variable.name;
    const evseId = item.component.evse?.id;
    const connectorId = item.component.evse?.connectorId;
    const variableInstance = item.variable.instance;
    const componentName = item.component.name;
    const componentInstance = item.component.instance;
    const value = item.variableAttribute[0].value;

    const key = [
      componentName,
      evseId,
      connectorId,
      componentInstance,
      variableName,
      variableInstance,
    ]
      .filter((v) => v)
      .join('.');

    if (query.get(key)) {
      result[key] = query.get(key);
      continue;
    }
    result[key] = value;
  }

  return result;
}

function buildConfigurationMap16() {
  const list = configurationList16;
  const query = getDocumentQuery();
  const result = {};

  for (const item of list) {
    const { key } = item;
    if (query.get(key)) {
      result[key] = query.get(key);
      continue;
    }
    result[key] = item.defaultValue;
  }

  return result;
}

function getConfigurationList(ocppVersion) {
  if (ocppVersion === 'ocpp2.0.1') {
    return configurationList201;
  }
  return configurationList16;
}

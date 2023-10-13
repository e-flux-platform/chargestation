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

export const defaultVariableConfig16 = [
  {
    key: 'Identity',
    description: 'OCPP Identity used in authenticating the charge station',
    value: 'ChargeStationOne',
  },
  {
    key: 'HeartbeatInterval',
    description: 'Frequency of Heartbeat commands in seconds',
    value: 50,
  },
  {
    key: 'MeterValueSampleInterval',
    description: 'Frequency of MeterValues commands in seconds',
    value: 60,
  },
  {
    key: 'NumberOfConnectors',
    description:
      'The number of sockets connected to this EVSE (only applies to configuration)',
    value: 2,
  },
  {
    key: 'Connector1-Type',
    description: 'Meta data about connector type on connector 1',
    value: 'Type 2 socket',
  },
  {
    key: 'Connector1-MaxCurrent',
    description: 'Meta data about max current on connector 1',
    value: 32,
  },
  {
    key: 'Connector2-Type',
    description: 'Meta data about connector type on connector 2',
    value: 'Type 2 socket',
  },
  {
    key: 'Connector2-MaxCurrent',
    description: 'Meta data about max current on connector 2',
    value: 32,
  },
];

export const defaultVariableConfig201 = [
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
        value: '',
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
  switch (ocppVersion) {
    case 'ocpp1.6':
      return new VariableConfiguration16(defaultVariableConfig16);
    case 'ocpp2.0.1':
      return new VariableConfiguration201(defaultVariableConfig201);
    default:
      throw new Error(`Unsupported OCPP version: ${ocppVersion}`);
  }
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

class VariableConfiguration201 {
  constructor(variables) {
    this.variables = variables.reduce((acc, item) => {
      const key = getConfigurationKey201(item);
      acc[key] = item;
      return acc;
    }, {});
  }

  getOCPPIdentityString() {
    return this.getVariableActualValue('SecurityCtrlr.Identity');
  }

  getMeterValueSampleInterval() {
    const defaultInterval = 60;

    const intervalConfig = this.variables['MeterValueSampleInterval'];

    const actualValue = intervalConfig.variableAttribute.find(
      (attr) => attr.type === 'Actual' || !attr.type
    );

    if (!actualValue) return defaultInterval;

    // Not sure if parseInt is necessary here
    return parseInt(actualValue.value);
  }

  getBaseURL() {
    // Alfen
    if (
      this.variables['BackOffice-URL-wired'] &&
      this.variables['BackOffice-Path-wired']
    ) {
      return `${this.variables['BackOffice-URL-wired']}${this.variables['BackOffice-Path-wired']}`;
    }
    if (
      this.variables['BackOffice-URL-APN'] &&
      this.variables['BackOffice-Path-APN']
    ) {
      return `${this.variables['BackOffice-URL-APN']}${this.variables['BackOffice-Path-APN']}`;
    }

    // Evnex
    if (this.variables['OCPPEndPoint']) {
      return this.variables['OCPPEndPoint'];
    }

    return null;
  }

  variablesToSimpleSettingsMap() {
    return Object.keys(this.variables).reduce((acc, key) => {
      acc[key] = {
        key,
        value: this.getVariableActualValue(key),
      };
      return acc;
    }, {});
  }

  updateVariablesFromSimpleSettingsMap(variables) {
    for (const variable of Object.values(variables)) {
      if (!this.variables[variable.key]) {
        throw new Error(`Variable ${variable.key} not found in configuration`);
      }

      const varAttrIndex = this.variables[
        variable.key
      ].variableAttribute?.findIndex(
        (attr) => attr.type === 'Actual' || !attr.type
      );

      if (varAttrIndex === -1) {
        this.variables[variable.key].variableAttribute.push({
          type: 'Actual',
          value: variable.value,
        });
        continue;
      }

      this.variables[variable.key].variableAttribute[varAttrIndex].value =
        variable.value;
    }
  }

  setVariable(key, variable) {
    if (!this.variables[key]) {
      this.variables[key] = {
        component: variable.component,
        variable: variable.variable,
        variableAttribute: [
          {
            type: variable.attributeType,
            value: variable.attributeValue,
          },
        ],
      };
      return;
    }

    const varAttrIndex = this.variables[key].variableAttribute?.findIndex(
      (attr) => attr.type === (variable.attributeType || 'Actual') || !attr.type
    );

    if (varAttrIndex === -1) {
      this.variables[key].variableAttribute.push({
        type: variable.attributeType,
        value: variable.attributeValue,
      });
      return;
    }

    this.variables[key].variableAttribute[varAttrIndex].value =
      variable.attributeValue;
  }

  getVariableActualValue(key) {
    const intervalConfig = this.variables[key];

    const actualValue = intervalConfig.variableAttribute.find(
      (attr) => attr.type === 'Actual' || !attr.type
    );

    return actualValue.value;
  }

  getVariablesArray() {
    return Object.values(this.variables);
  }
}

class VariableConfiguration16 {
  constructor(variables) {
    this.variables = variables.reduce((acc, item) => {
      acc[item.key] = item;
      return acc;
    }, {});
  }

  getOCPPIdentityString() {
    return this.variables['Identity']?.value;
  }

  getMeterValueSampleInterval() {
    const defaultInterval = 60;

    const intervalConfig = this.variables['MeterValueSampleInterval']?.value;
    if (!intervalConfig) return defaultInterval;

    return parseInt(intervalConfig);
  }

  getBaseURL() {
    // Alfen
    if (
      this.variables['BackOffice-URL-wired'] &&
      this.variables['BackOffice-Path-wired']
    ) {
      return `${this.variables['BackOffice-URL-wired']}${this.variables['BackOffice-Path-wired']}`;
    }
    if (
      this.variables['BackOffice-URL-APN'] &&
      this.variables['BackOffice-Path-APN']
    ) {
      return `${this.variables['BackOffice-URL-APN']}${this.variables['BackOffice-Path-APN']}`;
    }

    // Evnex
    if (this.variables['OCPPEndPoint']) {
      return this.variables['OCPPEndPoint'];
    }

    return null;
  }

  variablesToSimpleSettingsMap() {
    return this.variables;
  }

  updateVariablesFromSimpleSettingsMap(variables) {
    for (const variable of Object.values(variables)) {
      if (!this.variables[variable.key]) {
        throw new Error(`Variable ${variable.key} not found in configuration`);
      }

      this.variables[variable.key].value = variable.value;
    }
  }

  setVariable(key, variable) {
    if (!this.variables[key]) {
      this.variables[key] = variable;
      return;
    }

    this.variables[key].value = variable.value;
  }

  getVariablesArray() {
    return Object.values(this.variables);
  }
}

export const getConfigurationKey201 = (item) => {
  const variableName = item.variable.name;
  const evseId = item.component.evse?.id;
  const connectorId = item.component.evse?.connectorId;
  const variableInstance = item.variable.instance;
  const componentName = item.component.name;
  const componentInstance = item.component.instance;

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

  return key;
};

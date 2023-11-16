import { SetVariableDataType } from '../schemas/ocpp/2.0/SetVariablesRequest';
import { ChangeConfigurationRequest } from '../schemas/ocpp/1.6/ChangeConfiguration';
import { Map } from '../types/generic';

export enum ChargeStationSetting {
  OCPPBaseUrl = 'ocppBaseUrl',
  OCPPConfiguration = 'ocppConfiguration',
  ChargePointVendor = 'chargePointVendor',
  ChargePointModel = 'chargePointModel',
  ChargePointSerialNumber = 'chargePointSerialNumber',
  ICCID = 'iccid',
  IMSI = 'imsi',
}

export enum SessionSetting {
  uid = 'uid',
  maxPowerKw = 'maxPowerKw',
  carBatteryKwh = 'carBatteryKwh',
  carBatteryStateOfCharge = 'carBatteryStateOfCharge',
}

export interface SettingsListSetting<T> {
  key: T;
  name: string;
  type?: undefined | 'dropdown';
  options?: undefined | string[];
  description: string;
  defaultValue: string | number;
}

export const AuthorizationType = {
  RFID: 'rfid',
  CreditCard: 'creditCard',
} as const;
export type AuthorizationType =
  typeof AuthorizationType[keyof typeof AuthorizationType];

export const OCPPVersion = {
  ocpp16: 'ocpp1.6',
  ocpp201: 'ocpp2.0.1',
} as const;
export type OCPPVersion = typeof OCPPVersion[keyof typeof OCPPVersion];

export const settingsList: SettingsListSetting<ChargeStationSetting>[] = [
  {
    key: ChargeStationSetting.OCPPConfiguration,
    type: 'dropdown',
    options: [OCPPVersion.ocpp16, OCPPVersion.ocpp201],
    name: 'OCPP Configuration',
    description: 'OCPP Configuration to use (ocpp1.6 or ocpp2.0.1)',
    defaultValue: OCPPVersion.ocpp16,
  },
  {
    key: ChargeStationSetting.OCPPBaseUrl,
    name: 'OCPP Base URL',
    description: 'Websocket server to connect with',
    defaultValue: 'ws://localhost:2600/1.6/e-flux',
  },
  {
    key: ChargeStationSetting.ChargePointVendor,
    name: 'Boot / Vendor',
    description: 'The chargePointVendor sent during BootNotification',
    defaultValue: 'Chargepoint.one',
  },
  {
    key: ChargeStationSetting.ChargePointModel,
    name: 'Boot / Model',
    description: 'The chargePointModel sent during BootNotification',
    defaultValue: 'Chargepoint.one v1',
  },
  {
    key: ChargeStationSetting.ChargePointSerialNumber,
    name: 'Boot / Serial Number',
    description: 'The chargePointSerialNumber sent during BootNotification',
    defaultValue: 'CP1-2919101',
  },
  {
    key: ChargeStationSetting.ICCID,
    name: 'Boot / MoICCID',
    description: 'The iccid sent during BootNotification',
    defaultValue: '8888888888088888888F',
  },
  {
    key: ChargeStationSetting.IMSI,
    name: 'Boot / IMSI',
    description: 'The imsi sent during BootNotification',
    defaultValue: '888888888888888',
  },
];

export const sessionSettingsList: SettingsListSetting<SessionSetting>[] = [
  {
    key: SessionSetting.uid,
    name: 'UID',
    description: 'RFID card UID that would be used in a StartSession',
    defaultValue: 'FF88888801',
  },
  {
    key: SessionSetting.maxPowerKw,
    name: "Charge Station's Max Power (kW)",
    description:
      'The power in kW that this charge startion can deliver to a car (e.g. AC single phase is 7.4kW, AC three phase is 22kW, DC Fast charger is 25-175kW',
    defaultValue: 75,
  },
  {
    key: SessionSetting.carBatteryKwh,
    name: 'Car Battery Capacity (kWh)',
    description:
      "The car battery capacity that we're simulating in kWh - is used for determinig when to flatten MeterValues and send SuspendedEV notice",
    defaultValue: 64,
  },
  {
    key: SessionSetting.carBatteryStateOfCharge,
    name: 'Car Battery State of Charge (%)',
    description:
      'How full is the car battery we are simulating - is used for determinig when to flatten MeterValues and send SuspendedEV notice',
    defaultValue: 80,
  },
];

export interface Variable16 {
  key: string;
  description?: string;
  value: string | number;
}

export const defaultVariableConfig16: Variable16[] = [
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

export interface Variable201 {
  component: {
    name: string;
    instance?: string;
    evse?: {
      id: number;
      connectorId?: number;
    };
  };
  variable: {
    name: string;
    instance?: string;
  };
  variableAttribute: {
    value: string;
    persistent?: boolean;
    constant?: boolean;
    type?: 'Actual' | 'Target' | 'MinSet' | 'MaxSet' | 'Default' | 'Error';
  }[];
  variableCharacteristics?: {
    dataType: string;
    maxLimit?: number;
    unit?: string;
    valuesList?: string;
    supportsMonitoring: boolean;
  };
}

export const defaultVariableConfig201: Variable201[] = [
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

export function getDocumentQuery() {
  return new URLSearchParams(document.location.search);
}

export function getSettings(): Map<string | number> {
  const query = getDocumentQuery();
  const result: Map<string | number> = {};
  for (const item of settingsList) {
    const { key } = item;
    if (query.get(key)) {
      result[key] = query.get(key) as string | number;
      continue;
    }
    result[key] = item.defaultValue;
  }
  return result;
}

export type Variable = Variable16 | Variable201;

export function getConfiguration(
  ocppVersion: OCPPVersion,
  query: URLSearchParams
): VariableConfiguration<Variable> {
  switch (ocppVersion) {
    case OCPPVersion.ocpp16:
      return new VariableConfiguration16(defaultVariableConfig16, query);
    case OCPPVersion.ocpp201:
      return new VariableConfiguration201(defaultVariableConfig201, query);
    default:
      throw new Error(`Unsupported OCPP version: ${ocppVersion}`);
  }
}

export function ocppVersion() {
  return getSettings().ocppConfiguration;
}

export function getDefaultSession() {
  const query = getDocumentQuery();
  const result: Map<string | number> = {};
  for (const item of sessionSettingsList) {
    const { key } = item;
    if (query.get(key)) {
      result[key] = query.get(key) as string | number;
      continue;
    }
    result[key] = item.defaultValue;
  }
  return result;
}

interface VariableKeyValueMap
  extends Map<{
    key: string;
    value: string | number;
  }> {}

export interface VariableConfiguration<Variable> {
  getOCPPIdentityString(): string;
  getMeterValueSampleInterval(): number;
  getHeartbeatInterval(): number;
  variablesToKeyValueMap(): VariableKeyValueMap;
  updateVariablesFromKeyValueMap(variables: VariableKeyValueMap): void;
  setVariable(
    key: string,
    variable: SetVariableDataType | ChangeConfigurationRequest
  ): void;
  getVariablesArray(): Variable[];
  getVersion(): OCPPVersion;
}

class VariableConfiguration201 implements VariableConfiguration<Variable201> {
  private variables: Map<Variable201> = {};

  constructor(variables: Variable201[], query: URLSearchParams) {
    this.variables = variables.reduce((acc: Map<Variable201>, item) => {
      const key = getConfigurationKey201(item);
      const value = query && query.get(key);
      if (value) {
        acc[key] = {
          ...item,
          variableAttribute: [{ ...item.variableAttribute[0], value }],
        };
      } else {
        acc[key] = item;
      }

      return acc;
    }, {});
  }

  getVersion(): OCPPVersion {
    return OCPPVersion.ocpp201;
  }

  getOCPPIdentityString(): string {
    const ocppIdentity = this.getVariableActualValue('SecurityCtrlr.Identity');
    if (!ocppIdentity) {
      throw new Error('OCPP Identity not found in configuration');
    }

    return ocppIdentity;
  }

  getHeartbeatInterval(): number {
    const defaultInterval = 60;
    const value = this.getVariableActualValue('HeartbeatInterval');

    return (value ? Number(value) : defaultInterval) * 1000;
  }

  getMeterValueSampleInterval() {
    const defaultInterval = 60;
    const value = this.getVariableActualValue('MeterValueSampleInterval');
    return value ? parseInt(value) : defaultInterval;
  }

  variablesToKeyValueMap(): VariableKeyValueMap {
    return Object.keys(this.variables).reduce(
      (acc: VariableKeyValueMap, key) => {
        acc[key] = {
          key,
          value: this.getVariableActualValue(key),
        };
        return acc;
      },
      {}
    );
  }

  updateVariablesFromKeyValueMap(variables: VariableKeyValueMap) {
    for (const variable of Object.values(variables)) {
      if (!this.variables[variable.key]) {
        throw new Error(
          `Variable ${variable.key} not found in configuration when updating variables`
        );
      }

      const varAttrIndex = this.variables[
        variable.key
      ].variableAttribute?.findIndex(
        (attr) => attr.type === 'Actual' || !attr.type
      );

      if (varAttrIndex === -1) {
        this.variables[variable.key].variableAttribute.push({
          type: 'Actual',
          value: variable.value.toString(),
        });
        continue;
      }

      this.variables[variable.key].variableAttribute[varAttrIndex].value =
        variable.value.toString();
    }
  }

  setVariable(key: string, variable: SetVariableDataType) {
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

  getVariableActualValue(key: string): string {
    const intervalConfig = this.variables[key];
    if (!intervalConfig) return '';

    const actualValue = intervalConfig.variableAttribute.find(
      (attr) => attr.type === 'Actual' || !attr.type
    );

    if (actualValue?.value === null || actualValue?.value === undefined)
      throw new Error(
        `Variable ${key} not found in configuration when getting actual value`
      );

    return actualValue.value;
  }

  getVariablesArray(): Variable201[] {
    return Object.values(this.variables);
  }
}

class VariableConfiguration16 implements VariableConfiguration<Variable16> {
  private variables: Map<Variable16> = {};

  constructor(variables: Variable16[], query: URLSearchParams) {
    this.variables = variables.reduce((acc: VariableKeyValueMap, item) => {
      const value = query && query.get(item.key);

      if (value) {
        acc[item.key] = { ...item, value };
      } else {
        acc[item.key] = item;
      }

      return acc;
    }, {});
  }

  getVersion(): OCPPVersion {
    return OCPPVersion.ocpp16;
  }

  getOCPPIdentityString(): string {
    return this.variables['Identity']?.value as string;
  }

  getHeartbeatInterval(): number {
    const defaultInterval = 60;
    const value = this.variables['HeartbeatInterval']?.value;
    return (value ? Number(value) : defaultInterval) * 1000;
  }

  getMeterValueSampleInterval(): number {
    const defaultInterval = 60;

    const intervalConfig = this.variables['MeterValueSampleInterval']?.value;
    if (!intervalConfig) return defaultInterval;

    return typeof intervalConfig === 'number'
      ? intervalConfig
      : parseInt(intervalConfig);
  }

  variablesToKeyValueMap() {
    return this.variables;
  }

  updateVariablesFromKeyValueMap(variables: VariableKeyValueMap) {
    for (const variable of Object.values(variables)) {
      if (!this.variables[variable.key]) {
        throw new Error(
          `Variable ${variable.key} not found in configuration when updating variables`
        );
      }

      this.variables[variable.key].value = variable.value;
    }
  }

  setVariable(key: string, variable: ChangeConfigurationRequest) {
    if (!this.variables[key]) {
      this.variables[key] = variable;
      return;
    }

    this.variables[key].value = variable.value;
  }

  getVariablesArray(): Variable16[] {
    return Object.values(this.variables);
  }

  getVariableValue(key: string): string | number | null {
    const variable = this.variables[key];
    if (variable) {
      return variable.value;
    }
    return null;
  }
}

export const getConfigurationKey201 = (item: Variable201): string => {
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

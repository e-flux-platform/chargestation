export const EventTypes = {
  StationBooted: 'stationBooted',
  StationConnected: 'stationConnected',
  BootNotificationAccepted: 'bootNotificationAccepted',
  HeartbeatAccepted: 'heartbeatAccepted',
  BootNotificationCallResultReceived: 'bootNotificationCallResultReceived',
  HeartbeatCallResultReceived: 'heartbeatCallResultReceived',
  SessionStartInitiated: 'sessionInitiated',
  SessionStopInitiated: 'sessionStopInitiated',
  Charging: 'charging',
  Stopped: 'stopped',
  SessionCancelled: 'sessionCancelled',
  AuthorizationFailed: 'authorizationFailed',
  AuthorizationAccepted: 'authorizationAccepted',
  AuthorizeCallResultReceived: 'authorizeCallResultReceived',
  AuthorizationFailedDuringTransactionStart:
    'authorizationFailedDuringTransactionStart',
  AuthorizationFailedDuringTransactionStop:
    'authorizationFailedDuringTransactionStop',
  ChargingLimitReached: 'chargingLimitReached',
  ChargingTick: 'chargingTick',
  ResetReceived: 'resetReceived',
  SetChargingProfileReceived: 'setChargingProfileReceived',
  DataTransferReceived: 'dataTransferReceived',
  DataTransferCallResultReceived: 'dataTransferCallResultReceived',
  GetInstalledCertificatedIdsReceived: 'getInstalledCertificateIdsReceived',
  UpdateFirmwareReceived: 'updateFirmwareReceived',
  TriggerMessageReceived: 'triggerMessageReceived',
};

// OCPP 1.6 specific events
export const EventTypes16 = {
  StartTransactionAccepted: 'startTransactionAccepted',
  StopTransactionAccepted: 'stopTransactionAccepted',
  GetConfigurationReceived: 'getConfigurationReceived',
  ChangeConfigurationReceived: 'changeConfigurationReceived',
  RemoteStartTransactionReceived: 'remoteStartTransactionReceived',
  RemoteStopTransactionReceived: 'remoteStopTransactionReceived',
  StartTransactionCallResultReceived: 'startTransactionCallResultReceived',
  StopTransactionCallResultReceived: 'stopTransactionCallResultReceived',
  SignedUpdateFirmwareReceived: 'signedUpdateFirmwareReceived',
};

// Specific to OCPP 2.0.1
export const EventTypes201 = {
  GetBaseReportReceived: 'getBaseReportReceived',
  SetVariablesReceived: 'setVariablesReceived',
  GetVariablesReceived: 'getVariablesReceived',
  TransactionEventCallResultReceived: 'transactionEventCallResultReceived',
  RequestStartTransactionReceived: 'requestStartTransactionReceived',
  RequestStopTransactionReceived: 'requestStopTransactionReceived',
};

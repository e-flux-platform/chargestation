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
  SessionCancelled: 'sessionCancelled',
  AuthorizationFailed: 'authorizationFailed',
  AuthorizationAccepted: 'authorizationAccepted',
  AuthorizeCallResultReceived: 'authorizeCallResultReceived',
  ChargingLimitReached: 'charingLimitReached',
  ChargingTick: 'chargingTick',
};

// OCPP 1.6 specific events
export const EventTypes16 = {
  AuthorizationFailedDuringStartTransaction:
    'authorizationFailedDuringStartTransaction',
  AuthorizationFailedDuringStopTransaction:
    'authorizationFailedDuringStopTransaction',
  StartTransactionAccepted: 'startTransactionAccepted',
  StopTransactionAccepted: 'stopTransactionAccepted',
  GetConfigurationReceived: 'getConfigurationReceived',
  ChangeConfigurationReceived: 'changeConfigurationReceived',
  RemoteStartTransactionReceived: 'remoteStartTransactionReceived',
  RemoteStopTransactionReceived: 'remoteStopTransactionReceived',
  StartTransactionCallResultReceived: 'startTransactionCallResultReceived',
  StopTransactionCallResultReceived: 'stopTransactionCallResultReceived',
};

// Specific to OCPP 2.0.1
export const EventTypes201 = {
  GetBaseReportReceived: 'getBaseReportReceived',
  SetVariablesReceived: 'setVariablesReceived',
  TransactionEventCallResultReceived: 'transactionEventCallResultReceived',
};

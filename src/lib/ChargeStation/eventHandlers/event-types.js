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
};

// OCPP 1.6 specific events
export const EventTypes16 = {
  AuthorizationFailed: 'authorizationFailed',
  AuthorizationAccepted: 'authorizationAccepted',
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
  AuthorizeCallResultReceived: 'authorizeCallResultReceived',
  StartTransactionCallResultReceived: 'startTransactionCallResultReceived',
  StopTransactionCallResultReceived: 'stopTransactionCallResultReceived',
};

// Specific to OCPP 2.0.1
export const EventTypes201 = {};

export const EventTypes = {
  SessionStartInitiated: 'sessionInitiated',
  SessionStopInitiated: 'sessionStopInitiated',
  Charging: 'charging',
  SessionCancelled: 'sessionCancelled',
};

export const EventTypes16 = {
  StationBooted: 'stationBooted',
  StationConnected: 'stationConnected',
  BootNotificationAccepted: 'bootNotificationAccepted',
  HeartbeatAccepted: 'heartbeatAccepted',
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
  BootNotificationCallResultReceived: 'bootNotificationCallResultReceived',
  HeartbeatCallResultReceived: 'heartbeatCallResultReceived',
  AuthorizeCallResultReceived: 'authorizeCallResultReceived',
  StartTransactionCallResultReceived: 'startTransactionCallResultReceived',
  StopTransactionCallResultReceived: 'stopTransactionCallResultReceived',
};

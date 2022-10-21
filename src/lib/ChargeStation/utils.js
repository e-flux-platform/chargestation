export function extractOcppBaseUrlFromConfiguration(configuration) {
  // Alfen
  if (
    configuration['BackOffice-URL-wired'] &&
    configuration['BackOffice-Path-wired']
  ) {
    return `${configuration['BackOffice-URL-wired']}${configuration['BackOffice-Path-wired']}`;
  }
  if (
    configuration['BackOffice-URL-APN'] &&
    configuration['BackOffice-Path-APN']
  ) {
    return `${configuration['BackOffice-URL-APN']}${configuration['BackOffice-Path-APN']}`;
  }

  // Evnex
  if (configuration['OCPPEndPoint']) {
    return configuration['OCPPEndPoint'];
  }

  return null;
}

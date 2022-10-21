export const settingsList = [
  {
    key: 'ocppBaseUrl',
    name: 'OCPP Base URL',
    description: 'Websocket server to connect with',
    defaultValue: 'ws://localhost:2600/1.6/e-flux',
  },
];

export const configurationList = [
  {
    key: 'Identity',
    description: 'OCPP Identity used in authenticating the charge station',
    defaultValue: 'ChargeStationOne',
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

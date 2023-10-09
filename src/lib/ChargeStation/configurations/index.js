import DefaultOCPP16 from './default-ocpp-16';

const options = {
  'default-1.6': DefaultOCPP16,
};

export function getOCPPConfigurationOptions() {
  return Object.keys(options);
}

export function getOCPPConfiguration(key) {
  return options[key];
}

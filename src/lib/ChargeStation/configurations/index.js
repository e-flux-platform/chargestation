import DefaultOCPP16 from './default-ocpp-16';
import DefaultOCPP201 from './default-ocpp-201';

const options = {
  'default-1.6': DefaultOCPP16,
  'default-2.0.1': DefaultOCPP201,
};

export function getOCPPConfigurationOptions() {
  return Object.keys(options);
}

export function getOCPPConfiguration(key) {
  return options[key];
}

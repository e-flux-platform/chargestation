import DefaultOCPP16 from './default-ocpp-16';
import DefaultOCPP201 from './default-ocpp-201';

const options = {
  'ocpp1.6': DefaultOCPP16,
  'ocpp2.0.1': DefaultOCPP201,
};

export function getOCPPConfigurationOptions() {
  return Object.keys(options);
}

export function getOCPPConfiguration(key) {
  return options[key];
}

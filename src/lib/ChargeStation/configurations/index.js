import DefaultOCPP16 from './default-ocpp-16';
import DefaultOCPP20 from './default-ocpp-20';
import AlpitronicCCVOCPP16 from './alpitronic-ccv-ocpp-16';

const options = {
  'ocpp1.6': AlpitronicCCVOCPP16,
  'ocpp2.0.1': DefaultOCPP20,
};

export function getOCPPConfigurationOptions() {
  return Object.keys(options);
}

export function getOCPPConfiguration(key) {
  return options[key];
}

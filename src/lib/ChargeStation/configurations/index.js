import DefaultOCPP16 from './default-ocpp-16';
import DefaultOCPP20 from './default-ocpp-20';
import AlpitronicCCVOCPP16 from './alpitronic-ccv-ocpp-16';
import SichargeOCPP16 from './sicharge';

const options = {
  'default-ocpp1.6': DefaultOCPP16,
  'default-ocpp2.0.1': DefaultOCPP20,
  'ccv-alpitronic-ocpp1.6': AlpitronicCCVOCPP16,
  'sicharge-ocpp1.6': SichargeOCPP16,
};

export function getOCPPConfigurationOptions() {
  return Object.keys(options);
}

export function getOCPPConfiguration(ocppVersion, model) {
  return options[`${model}-${ocppVersion}`];
}

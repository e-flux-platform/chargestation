import DefaultOCPP16 from './default-ocpp-16';
import DefaultOCPP20 from './default-ocpp-20';
import AlpitronicCCVOCPP16 from './alpitronic-ccv-ocpp-16';
import SichargeOCPP16 from './sicharge-ocpp-16';
import AdsTecOCPP16 from './ads-tec-ocpp-16';
import ETotemOCPP16 from './e-totem-ocpp-16';
import MadicLafonOCPP16 from './madic-lafon-ocpp-16';
import EVBoxOCPP16 from './evbox-ocpp-16';
import { OCPPVersion } from 'lib/settings';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { Map } from '../../../types/generic';

// Use any to avoid type issues with the generic ChargeStationEventHandler
// This is a compromise to make the TypeScript conversion work without major refactoring
type OCPPConfigurationMap = Map<any[]>;

const options: Record<string, OCPPConfigurationMap> = {
  'default-ocpp1.6': DefaultOCPP16,
  'default-ocpp2.0.1': DefaultOCPP20,
  'ccv-alpitronic-ocpp1.6': AlpitronicCCVOCPP16,
  'sicharge-ocpp1.6': SichargeOCPP16,
  'ads-tec-ocpp1.6': AdsTecOCPP16,
  'e-totem-ocpp1.6': ETotemOCPP16,
  'madic/lafon-ocpp1.6': MadicLafonOCPP16,
  'evbox-ocpp1.6': EVBoxOCPP16,
};

export function getOCPPConfigurationOptions(): string[] {
  return Object.keys(options);
}

export function getOCPPConfiguration(
  ocppVersion: OCPPVersion,
  model: string
): OCPPConfigurationMap | undefined {
  return options[`${model}-${ocppVersion}`];
}

import ChargeStation16 from './1.6';
import ChargeStation201 from './2.0.1';

const createChargeStation = (protocol, configuration, options = {}) => {
  switch (protocol) {
    case '1.6':
      return new ChargeStation16(configuration, options);
    case '2.0.1':
      return new ChargeStation201(configuration, options);
    default:
      throw new Error(`unrecognised protocol: ${protocol}`);
  }
};

export {
  createChargeStation,
};

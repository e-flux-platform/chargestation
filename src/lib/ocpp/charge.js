class ChargeState {
  /*
  64kwh car battery:

  Type Of Charger	Speed	Range Added Per Hour	Charging Time
  8 Amp Portable Charger	1.8kW	10km	35 hours
  AC Charger Single-phase	7.4kW	40km	9 hours
  AC Charger Three-phase	22kW	120km	3 hours
  DC Charger Medium	25kW	150km	1.5 hours (to 80%)
  DC Rapid Charger	50kW	300km	1 hour (to 80%)
  DC Ultra Rapid Charger	175kW	1000km	15 minutes (to 80%)
  */
  constructor(options = {}) {
    this.maxPowerKw = options.maxPowerKw || 22;
    this.carBatteryKwh = options.carBatteryKwh || 64;
    this.carBatteryStateOfCharge = options.carBatteryStateOfCharge || 80;
    this.kwhElapsed = 0;
    this.lastMeterValuesTimestamp = undefined;
    this.chargeLimitReached = false;
  }

  progress(sessionActive, secondsElapsed) {
    const amountKwhToCharge = (this.maxPowerKw / 3600) * secondsElapsed;
    const carNeededKwh =
      this.carBatteryKwh -
      this.carBatteryKwh * (this.carBatteryStateOfCharge / 100);

    this.chargeLimitReached = this.kwhElapsed >= carNeededKwh;

    if (sessionActive && !this.chargeLimitReached) {
      this.kwhElapsed += amountKwhToCharge;
    }

    console.info(
      `Charge session progressed, kwhElapsed=${this.kwhElapsed}, carNeededKwh=${carNeededKwh}, chargeLimitReached=${this.chargeLimitReached}, amountKwhToCharge=${amountKwhToCharge}}`
    );

    this.lastMeterValuesTimestamp = new Date();
  }
}

export { ChargeState };
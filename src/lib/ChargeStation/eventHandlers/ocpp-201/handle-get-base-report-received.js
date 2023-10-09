import { EventTypes201 } from '../event-types';

export default async function handleGetBaseReportReceived({
  chargepoint,
  callMessageId,
}) {
  chargepoint.writeCallResult(callMessageId, { status: 'Accepted' });
  emitter.emitEvent(EventTypes201.GetBaseReportAccepted);
}

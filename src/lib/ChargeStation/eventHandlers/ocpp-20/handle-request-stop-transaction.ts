import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import {RequestStopTransactionRequest} from "schemas/ocpp/2.0/RequestStopTransactionRequest";
import {RequestStopTransactionResponse} from "schemas/ocpp/2.0/RequestStopTransactionResponse";

const handleRequestStartTransaction: ChargeStationEventHandler<RequestStopTransactionRequest> =
    ({ chargepoint, callMessageId, callMessageBody }) => {
        const { transactionId } = callMessageBody;

        let connectorId  = '';
        let response: RequestStopTransactionResponse = {status: 'Accepted'};

        ['1', '2'].forEach((cId) => {
            if (
                chargepoint.sessions[cId] &&
                chargepoint.sessions[cId].transactionId === transactionId
            ) {
                connectorId = cId.toString();
            }
        });
        if (!connectorId || !chargepoint.hasRunningSession(Number(connectorId))) {
            response = {
                status: 'Rejected',
            };
        }
        setTimeout(() => {
            chargepoint.stopSession(Number(connectorId));
        }, 100);
        response = {
            status: 'Accepted',
        };

        chargepoint.writeCallResult(callMessageId, response);
    };

export default handleRequestStartTransaction;

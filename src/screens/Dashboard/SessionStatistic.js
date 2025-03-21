import {Card, CardHeader, Divider} from "semantic-ui-react";
import React from "react";
import {round} from "utils/formatting";

export function SessionStatistic({
	connectorId,
																	 kwhCharged,
	durationSeconds,
	startedAt
																 }) {
	return (
    <Card className="session-statistic">
      <Card.Content>
        <CardHeader>Connector {connectorId}</CardHeader>
        <Divider />
				<p>
					Started on <strong>{startedAt?.toDateString()} {startedAt?.toLocaleTimeString()}</strong>
				</p>
        <p>
          <strong>{formatEnergy(kwhCharged)}</strong> charged
        </p>
        <p>
          <strong>{formatTime(durationSeconds)}</strong> passed
        </p>
      </Card.Content>
    </Card>
  );
}

function formatTime(durationSeconds) {
	const hours = Math.floor(durationSeconds / 3600);
	const minutes = Math.floor((durationSeconds % 3600) / 60);
	const seconds = durationSeconds % 60;

	return `${hours}h ${minutes}m ${seconds}s`;
}

function formatEnergy(kwhCharged) {
	// show Whs if below 1000, otherwise show kWhs
 	const rounded = round(kwhCharged, 3);

	if (rounded < 1) {
		return `${rounded * 1000} Wh`;
	}

	return `${rounded} kWh`;
}
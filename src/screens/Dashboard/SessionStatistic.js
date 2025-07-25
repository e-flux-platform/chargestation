import { Card, CardHeader, Divider } from 'semantic';
import React from 'react';
import { round } from 'utils/formatting';

export function SessionStatistic({
  connectorId,
  kwhCharged,
  durationSeconds,
  stateOfCharge,
  startedAt,
}) {
  return (
    <Card className="session-statistic">
      <Card.Content>
        <CardHeader>Connector {connectorId}</CardHeader>
        <Divider />
        <table>
          <tbody>
            <tr>
              <td>Started</td>
              <td>
                <strong>
                  {startedAt?.toDateString()} {startedAt?.toLocaleTimeString()}
                </strong>
              </td>
            </tr>
            <tr>
              <td>Charged</td>
              <td>
                <strong>{formatEnergy(kwhCharged)}</strong>
              </td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>
                <strong>{formatTime(durationSeconds)}</strong>
              </td>
            </tr>
            <tr>
              <td>SoC</td>
              <td>
                <strong>{formatPercentage(stateOfCharge)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
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

function formatPercentage(percent) {
  return `${round(percent, 2)}%`;
}

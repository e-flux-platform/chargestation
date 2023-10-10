# <APP_NAME> API v1

This is a free and
[open source](https://github.com/e-flux-platform/chargestation) simulator UI
tool. It is intended to simulate and debug OCPP connections from charge stations
to OCPP backends.

You can pass various GET query parameters to this URL to control and configure
it. For example, to set the OCPP backend it is connecting to:

<APP_URL>?ocppBaseUrl=ws://localhost:2600

## General Settings

<SETTINGS_MARKDOWN>

## Session Specific Settings

<SESSION_SETTINGS_MARKDOWN>

## Configuration OCPP 1.6

Any GET query parameter that is not in the above Settings list will be set as a
charge station configuration key. These can be retrieved or changed using the
`GetConfiguration` and `ChangeConfiguration` OCPP commands.

Here's a list of configuration keys that are implemented:

<CONFIGURATION_MARKDOWN_16>

## Configuration OCPP 2.0.1

OCPP 2.0.1 has many different keys. Therefore, we have not implemented them all.
We just provide a few configuration keys for testing.

## Learn More

Need more tools for building EV applications? Contact us at https://road.io

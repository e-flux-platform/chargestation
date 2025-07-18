# chargestation.one ⚡️

Browser based charging station simulator with support for OCPP 1.6 and OCPP 2.0.1

## Features

- OCPP 1.6 and 2.0.1 support
- Connect to any endpoint hosting an OCPP backend
- Standard OCPP configuration support
- Start and stop transactions with various parameters
- Ability to send custom messages
- Interactive message reply (when enabled)
- Remote transaction start/stop support
- OCMF meter data signing
- Transaction speed control and time travel
- Limited payment terminal support

## Running

When running locally, we recommend installing [volta](https://volta.sh/) to ensure the node and yarn versions are
aligned with those used during active development.

First install the required dependencies:

```
yarn install
```

And then run:

```
yarn run start
```

By default, the application is available at http://localhost:2100/

## Configuration

A small number of environment variables can be used to override defaults used at runtime:

- `SERVER_HOS`T` - Host to bind to, defaults to `"0.0.0.0"`
- `SERVER_PORT` - Port to bind to, defaults to `2100`
- `ENV_NAME` - Deployment environment name, default `development`
- `APP_NAME` - Default product name to be used in views
- `OCPP_BASE_URL` - Default OCPP backend, defaults to ws://localhost

## Demo

https://github.com/user-attachments/assets/a909a7aa-1a78-4afb-b0aa-165fc8a04feb

## TODO

Our current wishlist of features:

- [ ] OCPP 2.1
- [ ] Auto-start transactions via URL parameters
- [ ] Improved visualizations around state of charge
- [ ] Emulation of offline transaction handling
- [ ] More sophisticated animations
- [ ] Better release strategy
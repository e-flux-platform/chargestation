# Chargestation.one

Open source OCPP charge station simulator (work in progress).

Todo:

- [x] Basic web UI
- [x] Basic connectivity & heartbeats
- [x] Settings UI
- [x] Allow Settings and Configuration via URL params
- [x] API Documentation
- [x] Support for BootNotification
- [x] Basic charge session simulation
- [x] Terminal scrolling
- [x] OCPP Command drill-down
- [x] OCPP Command summary
- [x] Visual indicator that charging is happening
- [x] Make GetConfiguration and ChangeConfiguration work
- [x] Support for using two connectors
- [x] Support for Remote Start/Stop
- [ ] Run any OCPP command
- [ ] Auto start session via parameters
- [ ] Visual progress bar on car state of charge
- [ ] Support for authorization
- [ ] Terminate session on disconnect
- [ ] Simulate being offline (and buffering commands)
- [x] Time travel
- [x] OCPP 2.1 Support
- [ ] Animation for plugging in cable
- [x] Animation for cars
- [ ] Animation for connectivity on the station
- [ ] Tweak UI for big screens
- [ ] Tweak responsiveness for mobile

## Setup

### Run in Docker

Todo

## Development

### Directory Structure

- `package.json` - Configure dependencies
- `webpack.config.js` - Bundling and build configuration
- `.env` - Enviroment variables
- `src/components` - Home of reuseable components
- `src/utils` - Home of specific JS helper utilities
- `src/index.html` - Main entrypoint into App UI (Webpack injected)
- `serve/static.js` - Static server
- `serve/dev.js` - Static server for development
- `dist/*` - Files generated by webpack, incuding index.html. These are the
  assets that should be HTTP served

### Install Dependencies

Ensure Node.js version uniformity using Volta:

```
curl -sSLf https://get.volta.sh | bash
```

Install dependencies: (will install correct Node.js version)

```
yarn install
```

### Run

The following command serves all HTML/JS/CSS and watches all changes to
`src/*.js`

```bash
yarn start
```

UI is running at [http://localhost:2100/](http://localhost:2100/)

### Configuration

All configuration is done using environment variables. The default values in
`.env` can be overwritten using environment variables.

- `SERVER_HOST` - Host to bind to, defaults to `"0.0.0.0"`
- `SERVER_PORT` - Port to bind to, defaults to `2300`
- `HTTP_BASIC_AUTH_PATH` - Basic Auth: Path to protect
- `HTTP_BASIC_AUTH_USER` - Basic Auth: Username
- `HTTP_BASIC_AUTH_PASS` - Basic Auth: Password
- `ENV_NAME` - Node environment `development`
- `APP_NAME` - Default product name to be used in views
- `API_URL` - URL for API defaults to `http://localhost:2300`
- `SENTRY_DSN` - Sentry error monitoring credentials

All config vars are available in the `serve/dev.js` and `serve/static.js`
server-side code. In the browser-side all variables are available as a global
object `window.__env_conf`.

### Deployment

Deployment to staging happens automatically when pushing to `master`.

To deploy to production:

to deploy to production:
- Grab the hash of the image that you want to deploy from https://quay.io/repository/road/chargestation?tab=tags
- Update the hash in e-flux/deployment/environments/production/services/chargestation/chargestation-deployment.yml and merge to master (using a PR of course)


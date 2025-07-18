const Koa = require('koa');

const { loggingMiddleware } = require('@bedrockio/instrumentation');
const koaMount = require('koa-mount');
const koaBasicAuth = require('koa-basic-auth');

const config = require('@bedrockio/config');

const envMiddleware = require('./middleware/env');
const assetsMiddleware = require('./middleware/assets');
const historyMiddleware = require('./middleware/history');
const templateMiddleware = require('./middleware/template');
const statusMiddleware = require('./middleware/status');

const SERVER_PORT = config.get('SERVER_PORT');
const SERVER_HOST = config.get('SERVER_HOST');

const app = new Koa();

app.use(statusMiddleware);

app
  .use(koaMount('/assets/', assetsMiddleware('./dist/assets')))
  .use(loggingMiddleware())
  .use(envMiddleware())
  .use(historyMiddleware({ apps: ['/'] }))
  .use(templateMiddleware({ apps: ['/'] }));

app.listen(SERVER_PORT, SERVER_HOST, (err) => {
  if (err) {
    throw err;
  }
  // eslint-disable-next-line
  console.info(
    `🐬  Prod App server listening at http://${SERVER_HOST}:${SERVER_PORT} 🐬\r\n\r\n`
  );
});

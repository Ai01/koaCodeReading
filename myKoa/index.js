const Koa = require('./koa');
const log = require('../koaMiddleware/log').log;
const bodyParse = require('../koaMiddleware/bodyParse').bodyParse;

const app = new Koa();

app.use(log);
app.use(bodyParse);

app.use((ctx) => {
  const { res } = ctx;
  res.end('hello, this is my koa');
})

app.listen(8007);

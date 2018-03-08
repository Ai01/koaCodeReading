const koa = require('koa');
const log = require('./log').log;
const bodyParse = require('./bodyParse').bodyParse;
const compose = require('./compose');


const app = new koa();

app.use(compose([log, bodyParse]));

app.use((ctx)=>{
  ctx.body = 'hello';
});

app.listen(8005);

const http = require('http');
const compose = require('../koaMiddleware/compose');

class Koa {
  constructor() {
    this.middleWares = [];
  }

  use(middleWare) {
    if (typeof middleWare !== 'function') throw new TypeError('middleWare need to be a function');
    this.middleWares.push(middleWare);
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
    return server;
  }

  callback() {
    const fnMiddleWare = compose(this.middleWares);
    return (req, res) => {
      const ctx = {
        req,
        res,
        request: req,
        response: res,
      }
      fnMiddleWare(ctx).then(()=>{console.log('success')}).catch(e => console.log('fail',e));
    };
  }
}

module.exports = Koa;

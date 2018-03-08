'use strict'

const Emitter = require('events');
const http = require('http');

const context = require('./context');
const request = require('./request');
const response = require('./response');

modulex.exports = class Application extends Emitter {
  constructor(){
    super();

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  listen(...args){
    debug('listen');
    const server = http.createServer(this.callback()); // TODO:bai 理解callback，非常重要
    return server.listen(...args);
  }

  callback() {
    const fn = compose(this.middleware); // 实质上是将多个middleWare组合为一个

    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      // 利用req, res来创造ctx
      const ctx = this.createContext(req, res); // TODO:bai 在实现了对middleWare的调用过后，需要了解如何将ctx作为参数传递给middleWare
      return this.handleRequest(ctx, fn);
    }

    return handleRequest;

  }

  handleRequest(ctx, fnMiddleWare) {
    const res = ctx.res;
    return fnMiddleWare(ctx).then(()=>res.end()).catch((err)=>{console.error(err)}); // 调用组合的中间件，然后res.end或者error
  }


}

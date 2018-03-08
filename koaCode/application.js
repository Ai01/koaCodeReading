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
    const fn = compose(this.middleware);

    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    }

    return handleRequest;

  }


}

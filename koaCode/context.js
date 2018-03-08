'use strict';

const util = require('util');
const createError = require('http-errors'); // TODO:bai what
const httpAssert = require('http-assert'); // TODO:bai what
const delegate = require('delegates'); // TODO:bai what
const statuses = require('statuses'); // TODO:bai what

/*
* context prototype
* */

const proto = (module.exports = {
  /*
 * inspect
 * */

  // TODO:bai 这个函数有什么用
  inspect() {
    if (this.proto) {
      return this;
    }
    return this.toJSON();
  },

  toJSON() {
    // TODO:bai 为什么要这样toJson
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.originalUrl,
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>',
    };
  },

  // TODO:bai assert的作用？已经有了throw了
  assert: httpAssert,

  throw(...args) {
    throw createError(...args);
  },

  onerror(err) {
    if (null == err) {
      return;
    }
    // TODO:bai js 中的类型判断
    if (!(err instanceof Error)) {
      err = new Error(util.format('non-error thrown %j', err));
    }

    // TODO:bai what
    let headerSent = false;
    if(this.headerSent || !this.writable) {
      headerSent = err.headerSent = true;
    }

    this.app.emit('error', err, this);

    if(headerSent) {
      return;
    }

    const { res } = this;

    if(typeof res.getHeaderNames === 'function') {
      res.getHeaderNames().forEach(name => res.removeHeader(name));
    }else{
      res._headers = {};
    }

    this.set(err.headers);
    this.type = 'text';
    if('ENOENT' == err.code){ err.status = 404; }
    if('number' != typeof err.status || !statuses[err.status] ) {
      err.status = 500;
    }

    const code = statuses[err.status];
    const msg = err.expose ? err.message : code;
    this.status = err.status;
    this.length = Buffer.byteLength(msg);
    this.res.end(msg);

  },

});


// TODO:bai what
delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable');

delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .getter('origin')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip');

'use strict';

const contentDisposition = require('content-disposition');
const ensureErrorHandler = require('error-inject');
const getType = require('mime-types').contentType;
const onFinish = require('on-finished');
const isJSON = require('koa-is-json');
const escape = require('escape-html');
const typeis = require('type-is').is;
const statuses = require('statuses');
const destroy = require('destroy');
const assert = require('assert');
const extname = require('path').extname;
const vary = require('vary'); // TODO:bai what
const only = require('only'); // TODO:bai what

module.exports = {
  get socket() {
    return this.ctx.req.socket;
  },

  get header() {
    const { res } = this;
    return typeof res.getHeaders === 'function' ? res.getHeaders() : res._headers || {};
  },

  get headers() {
    return this.header;
  },

  get status() {
    return this.res.statusCode;
  },

  set status(code) {
    if (this.headerSent) {
      return;
    }

    assert('number' == typeof code, 'status code must be a number');
    assert(statuses[code], `invalid status code: ${code}`);
    this._explicitStatus = true;
    this.res.statusCode = code;
    if (this.req.httpVersionMajor < 2) {
      this.res.statusMessage = statuses[code];
    }
    if (this.body && statuses.empty[code]) {
      this.body = null;
    }
  },

  get message() {
    return this.res.statusMessage || statuses[this.status];
  },

  set message(msg) {
    this.res.statusMessage = msg;
  },

  get body() {
    return this._body;
  },

  set body(val) {
    const original = this._body;
    this._body = val;

    if (null == val) {
      if (!statuses.empty[this.status]) {
        this.status = 204;
      }
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    if (!this._explicitStatus) {
      this.status = 200;
    }

    const setType = !this.header['content-type'];

    if ('string' == typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    if ('function' == typeof val.pipe) {
      onFinish(this.res, destroy.bind(null, val));
      ensureErrorHandler(val, err => this.ctx.onerror(err));
      if (null != original && original != val) this.remove('Content-Length');
      if (setType) this.type = 'bin';
      return;
    }

    this.remove('Content-Length');
    this.type = 'json';
  },

  set length(n) {
    this.set('Content-Length', n);
  },

  get length() {
    const len = this.header['content-length'];
    const body = this.body;

    if (null == len) {
      if (!body) return;
      if ('string' == typeof body) return Buffer.byteLength(body);
      if (Buffer.isBuffer(body)) return body.length;
      if (isJSON(body)) return Buffer.byteLength(JSON.stringify(body));
      return;
    }

    return ~~len;
  },

  get headerSent() {
    return this.res.headersSent;
  },

  vary(field) {
    if (this.headerSent) return;
    vary(this.refs, field);
  },

  redirect(url, alt) {
    if ('back' == url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', url);

    if (!statuses.redirect[this.status]) this.status = 302;

    if (this.ctx.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}" >${url}</a>.`;
      return;
    }

    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  },

  attachment(filename) {
    if (filename) this.type = extname(filename);
    this.set('Content-Disposition', contentDisposition(filename));
  },

  set type(type) {
    type = getType(type);
    if (type) {
      this.set('Content-Type', type);
    } else {
      this.remove('Content-Type');
    }
  },

  set lastModified(val) {
    if ('string' == typeof val) val = new Date(val);
    this.set('Last-Modified', val.toUTCString());
  },

  get lastModified() {
    const date = this.get('last-modified');
    if (date) return new Date(date);
  },

  set etag(val) {
    if (!/^(w\/)?"/.test(val)) val = `${val}`;
    this.set('ETag', val);
  },

  get etag() {
    return this.get('ETag');
  },

  get type() {
    const type = this.get('Content-type');
    if (!type) return '';
    return type.split(';')[0];
  },

  is(types) {
    const type = this.type;
    if (!types) return type || false;
    if (!Array.isArray(types)) types = [].slice().call(arguments);
    return typeis(type, types);
  },

  get(field) {
    return this.header[field.toLowerCase()] || '';
  },

  set(field, val) {
    if (this.headerSent) return;

    if (2 == arguments.length) {
      if (Array.isArray(val)) val = val.map(String);
      else val = String(val);
      this.res.setHeader(field, val);
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
  },

  append(field, val) {
    const prev = this.get(field);

    if(prev) {
      val = Array.isArray(prev) ? prev.concat(val) : [prev].concat(val);
    }

    return this.set(field, val);
  },

  remove(field) {
    if(this.headerSent) return;

    this.res.removeHeader(field);
  },

  get writable() {
    if(this.res.finished) return false;

    const socket = this.res.socket;
    if(!socket) return true;
    return socket.writable;
  },

  inspect() {
    if(!this.res) return;
    const o = this.toJSON();
    o.body = this.body;
    return o;
  },

  toJSON() {
    return only(this, [
      'status',
      'message',
      'header'
    ]);
  },

  flushHeaders() {
    this.res.flushHeaders();
  }


};

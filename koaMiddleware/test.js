const delegate = require('delegates');
const assert = require('assert');

const obj = {};

obj.request = {
  foo: function(bar){
    assert(this == obj.request);
    return bar;
  }
};

delegate(obj, 'request').method('foo');

console.log(obj);

console.log(obj.foo('something'));

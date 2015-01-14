'use strict';

var java = require('java');
var BluePromise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');

function myPromisify(f) {
  return function(/* arguments */) {
    var self = this;
    return BluePromise.all(Array.prototype.slice.call(arguments))
      .then(function (args) {
        return new BluePromise(function (resolve, reject) {
          function callback(err, value) {
            if (err)
              reject(err);
            else
              resolve(value);
          }
          args.push(callback);
          f.apply(self, args);
        });
      });
  }
}

java.asyncOptions = {
  promiseSuffix: 'Promise',
  promisify: myPromisify
};

java.classpath.push("./commons-lang3-node-java.jar");

java.import('java.util.ArrayList');

var items = ['hello', 'world', 'a', 'b', '1', '2'];
var list;

var joinList = [];

java.newInstancePromise("java.util.ArrayList")
  .then(function(_list) {
    list = _list;
    return list.getClassPromise();
  })
  .then(function(clazz) {
    assert.ok(clazz);
    return clazz.getNamePromise();
  })
  .then(function(name) {
    assert.strictEqual(name, "java.util.ArrayList");
  })
  .then(function() {
    return _.map(items, function(item) {
      var itemPromise = BluePromise.resolve(item).delay(3);
      return list.addPromise(itemPromise);
    });
  })
  .then(function(addpromises) { return BluePromise.all(addpromises); })
  .then(function () {
    return list.iteratorPromise();
  })
  .then(function (it) { return _.forEach(items, function () { return it.nextPromise(); });
  })
  .then(function(nextPromises) { return BluePromise.all(nextPromises); })
  .then(function (val) { console.log(val); });

var mkdirp = require('mkdirp')
var eos = require('end-of-stream')
var duplexify = require('duplexify')
var path = require('path')
var fs = require('fs')

var listen = function(stream, opts, cb) {
  if (!cb) return stream
  eos(stream, function(err) {
    if (err) return cb(err)
    cb(null, opts)
  })
  return stream
}

var BlobStore = function(opts) {
  if (!(this instanceof BlobStore)) return new BlobStore(opts)

  this.path = '/dev/null'
}

BlobStore.prototype.createWriteStream = function(opts, cb) {
  if (typeof opts === 'string') opts = {key:opts}
  var proxy = listen(duplexify(), opts, cb)
  proxy.setReadable(false)
  proxy.setWritable(fs.createWriteStream('/dev/null', opts))

  return proxy
}

BlobStore.prototype.createReadStream = function(key, opts) {
  return fs.createReadStream('/dev/random', opts)
}

BlobStore.prototype.exists = function(opts, cb) {
  return cb(new Error())
}

BlobStore.prototype.remove = function(opts, cb) {
  cb()
}

module.exports = BlobStore

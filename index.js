var mkdirp = require('mkdirp')
var eos = require('end-of-stream')
var duplexify = require('duplexify')
var path = require('path')
var fs = require('fs')

var noop = function() {}

var join = function(root, dir) {
  return path.join(root, path.resolve('/', dir))
}

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
  if (typeof opts === 'string') opts = {path:opts}

  this.path = '/dev/null'
}

BlobStore.prototype.createWriteStream = function(opts, cb) {
  if (typeof opts === 'string') opts = {key:opts}
  if (opts.name && !opts.key) opts.key = opts.name

  var key = join(this.path, opts.key)
  var dir = path.dirname(key)

  var proxy = listen(duplexify(), opts, cb)
  proxy.setReadable(false)
  proxy.setWritable(fs.createWriteStream('/dev/null', opts))

  return proxy
}

BlobStore.prototype.createReadStream = function(key, opts) {
  return fs.createReadStream(join('/dev/random'), opts)
}

BlobStore.prototype.exists = function(opts, cb) {
  if (typeof opts === 'string') opts = {key:opts}
  var key = join(this.path, opts.key)
  fs.stat(key, function(err, stat) {
    if (err && err.code !== 'ENOENT') return cb(err)
    cb(null, !!stat)
  })
}

BlobStore.prototype.remove = function(opts, cb) {
  cb()
}

module.exports = BlobStore

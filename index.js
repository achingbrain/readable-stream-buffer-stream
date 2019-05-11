'use strict'

const crypto = require('crypto')
const Readable = require('stream').Readable

const defaultOptions = {
  chunkSize: 4096,
  generator: (size, callback) => {
    callback(null, crypto.randomBytes(size))
  }
}

function bufferStream (limit, options = {}) {
  options = Object.assign({}, defaultOptions, options)
  let emitted = 0

  class BufferStream extends Readable {
    _read () {
      const nextLength = emitted + options.chunkSize
      let nextChunkSize = options.chunkSize

      if (nextLength > limit) {
        nextChunkSize = limit - emitted
      }

      options.generator(nextChunkSize, (err, bytes) => {
        if (err) {
          this.emit('error', err)
          return
        }

        bytes = bytes.slice(0, nextChunkSize)

        emitted += nextChunkSize

        this.push(bytes)

        if (nextLength > limit) {
          // we've finished, end the stream
          this.push(null)
        }
      })
    }
  }

  return new BufferStream()
}

module.exports = bufferStream

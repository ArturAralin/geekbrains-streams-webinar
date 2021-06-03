const stream = require('stream');

class ParseTransform extends stream.Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
    })
  }

  _transform(chunk, encoding, callback) {
    const [
      id,
      name,
    ] = chunk.toString().split(';');

    this.push({
      id,
      name,
    });

    callback(null);
  }
}


module.exports = ParseTransform;

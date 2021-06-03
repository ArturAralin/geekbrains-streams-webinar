const stream = require('stream');

class ParseTransform extends stream.Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
    })
  }

  _transform(lineChunk, encoding, callback) {
    const [
      id,
      name,
    ] = lineChunk.toString().split(';');

    const dataObject = {
      id,
      name,
    };

    this.push(dataObject);

    callback(null);
  }
}

module.exports = ParseTransform;

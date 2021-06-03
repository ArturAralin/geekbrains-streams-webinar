
const express = require('express');
const Busboy = require('busboy');
const fs = require('fs');
const split2 = require('split2');
const ParseTransform = require('./parse-transform');
const stream = require('stream');

const app = express();

const logReadBytesInMB = (text, size) => {
  const mb = (size / (1024 * 1024)).toFixed(1);

  console.log(`${text}: ${mb} Mb`);
};

const memoryUsage = () => {
  const used = process.memoryUsage().rss;

  logReadBytesInMB('Max memory used', used)
}

app.post('/upload', (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const file = fs.createWriteStream('./uploaded.jsonl')
  let bytesRead = 0;

  busboy.on('file', (_, fileStream) => {
    // START: Only for demonstration
    fileStream.on('data', (chunk) => {
      bytesRead += chunk.length;
      logReadBytesInMB('Bytes read', bytesRead);
    });

    fileStream.on('end', () => {

      memoryUsage();
    });
    // END: Only for demonstration

    // id,name,address,...
    fileStream
      .pipe(split2()) // transform который парсит входящий поток и разбивает его по симповлу \n (перенос строки)
      .pipe(new ParseTransform()) // { id, name }
      .pipe(new stream.Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          const line = `${JSON.stringify(chunk)}\n`;

          callback(null, line);
        }
      }))
      .pipe(file);
  });

  req.pipe(busboy);
});

app.listen(6677, () => {
  console.log('listen on http://localhost:6677');
});


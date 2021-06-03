const express = require('express');
const Busboy = require('busboy');
const fs = require('fs');

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

  let bytesRead = 0;
  let chunks = [];
  let bufferWithFile = null;

  busboy.on('file', (_, fileStream) => {
    fileStream.on('data', (chunk) => {
      chunks.push(chunk);

      bytesRead += chunk.length;

      logReadBytesInMB('Bytes read', bytesRead);
    });

    fileStream.on('end', () => {
      bufferWithFile = Buffer.from(chunks);
      chunks = null;

      memoryUsage();
      // 2.4gb memory used
      fs.writeFileSync('./uploaded.csv', bufferWithFile);
    });
  });

  req.pipe(busboy);
});


app.post('/upload_with_stream', (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const fileWriteStream = fs.createWriteStream('./uploaded.csv');

  let bytesRead = 0;

  busboy.on('file', (_, fileStream) => {
    fileStream.on('data', (chunk) => {
      fileWriteStream.write(chunk);

      bytesRead += chunk.length;
      logReadBytesInMB('Bytes read', bytesRead);
    });

    fileStream.on('end', () => {
      fileWriteStream.end();

      memoryUsage();
    });
  });

  req.pipe(busboy);
});

app.listen(6677, () => {
  console.log('listen on http://localhost:6677');
});

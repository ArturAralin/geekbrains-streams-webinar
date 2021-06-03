// -- create database
// create database gb_import_test;
// -- add uuid extension
// create extension if not exists "uuid-ossp";
// -- create table
// create table users (
//   id uuid not null primary key,
//   name text not null,
//   address text,
//   created_at timestamp default now()
// );

const express = require('express');
const Busboy = require('busboy');
const stream = require('stream');
const split2 = require('split2');
const pg = require('pg');
const copyFrom = require('pg-copy-streams').from;

const app = express();

const pgClient = new pg.Client({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'gb_import_test'
});

pgClient
  .connect()
  .then(() => {
    console.log('db connected');
  })
  .catch((err) => {
    console.log(err);
  });

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

  const queryStream = pgClient.query(copyFrom(`COPY users (id, name, address) FROM STDIN WITH DELIMITER ';'`));

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

    fileStream
      .pipe(split2())
      .pipe(new stream.Transform({
        objectMode: true,
        transform(line, _, callback) {
          const [id, name, address] = line.toString().split(';');
          const row = [id, name, address].join(';');

          callback(null, `${row}\n`);
        }
      }))
      .pipe(queryStream);
  });

  req.pipe(busboy);
});

app.listen(6678, () => {
  console.log('listen on http://localhost:6677');
});


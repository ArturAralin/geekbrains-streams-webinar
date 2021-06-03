
const express = require('express');
const Busboy = require('busboy');
const fs = require('fs');
const split2 = require('split2');
const ParseTransform = require('./parse-transform');
const stream = require('stream');
const pg = require('pg')
const QueryStream = require('pg-query-stream')

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

app.get('/export', (req, res) => {
  // const query = new QueryStream('SELECT * FROM generate_series(0, $1) num', [1000000]);
  // const stream = client.query(query);
});

app.listen(6677, () => {
  console.log('listen on http://localhost:6677');
});


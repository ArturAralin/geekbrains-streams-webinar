const fs = require('fs');
const uuid = require('uuid');
const data = require('./generated.json');

const COUNT = 15000000;

try {
  fs.unlinkSync(`${__dirname}/data.csv`);
  fs.unlinkSync(`${__dirname}/small_data.csv`);
} catch (e) {
  // ignore
}


const logProgress = (i) => {
  console.log(`${(i * 100 / COUNT).toFixed(2)}%`);
}

// id; name; address; birthday; email; phone
(async () => {
  let batch = [];

  for (let i = 0; i < COUNT; i += 1) {
    const dataItem = data[i % data.length];
    const line = [
      uuid.v4(),
      dataItem.name,
      dataItem.address,
      dataItem.birthday,
      dataItem.email,
      dataItem.phone,
    ].join(';');

    batch.push(`${line}`);

    if (i % 5000 === 0) {
      await fs.promises.appendFile(`${__dirname}/data.csv`, batch.join('\n'));
      batch = [];

      logProgress(i);
    }
  }

  console.log('Finished');
})();

(async () => {
  let batch = [];

  for (let i = 0; i < COUNT / 10; i += 1) {
    const dataItem = data[i % data.length];
    const line = [
      uuid.v4(),
      dataItem.name,
      dataItem.address,
      dataItem.birthday,
      dataItem.email,
      dataItem.phone,
    ].join(';');

    batch.push(`${line}`);

    if (i % 5000 === 0) {
      await fs.promises.appendFile(`${__dirname}/small_data.csv`, batch.join('\n'));
      batch = [];

      logProgress(i);
    }
  }

  console.log('Finished');
})();
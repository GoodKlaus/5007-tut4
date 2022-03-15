const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/traveller';

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(function(err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('customers');

    const customer = { id: 1, name: 'A', phone: '11111111' };
    collection.insertOne(customer, function(err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log('Result of insert:\n', result.insertedId);
      collection.find({ _id: result.insertedId})
        .toArray(function(err, docs) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log('Result of find:\n', docs);
        client.close();
        callback(err);
      });
    });
  });
}

async function testWithAsync() {
  console.log('\n--- testWithAsync ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();
    const collection = db.collection('customers');

    const customer = { id: 2, name: 'B', phone: '22222222' };
    const result = await collection.insertOne(customer);
    console.log('Result of insert:\n', result.insertedId);
    var docs = await collection.find({ _id: result.insertedId })
      .toArray();
    console.log('Result of find:\n', docs);

    const result_u = await collection.updateOne({name: 'A'}, { $set: {phone: '99999999'}});
    console.log('id of the updated document:\n', result_u.connection.id);
    docs = await collection.find({ id: result_u.connection.id })
    .toArray();
    console.log('Result of find:\n', docs);

    docs = await collection.find({}).toArray();
    console.log('Before deletion:\n', docs);
    const result_d = await collection.deleteOne({id: 2});
    docs = await collection.find({}).toArray();
    console.log('After deletion:\n', docs);

  } catch(err) {
    console.log(err);
  } finally {
    client.close();
  }
}

testWithCallbacks(function(err) {
  if (err) {
    console.log(err);
  }
  testWithAsync();
});

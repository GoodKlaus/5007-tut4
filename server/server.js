const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/traveller';

let db;

let aboutMessage = "Singapore-Thailand High-Speed Railway Reservation System";

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    recordList,
  },
  Mutation: {
    setAboutMessage,
    recordAdd,
    recordDelete,
    createBlackList
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function recordList() {
  const records = await db.collection('records').find({}).toArray();
  return records;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function recordAdd(_, { record }) {
  const hit_bl = await db.collection('blacklist').find({name: record.name, phone: record.phone}).count();
  if (hit_bl > 0){
    throw new UserInputError('Sorry, this customer is blacklisted!');
  }
  const hit = await db.collection('records').find({name: record.name}).count();
  if (hit > 0) {
    throw new UserInputError('Sorry, there is a booking under this name!');
  }
  record.timestamp = new Date();
  record.id = await getNextSequence('records');

  const result = await db.collection('records').insertOne(record);
  const savedRecord = await db.collection('records')
    .findOne({ _id: result.insertedId });
  return savedRecord;
}

async function updateFollowingID(target, total) {
  for (let i=target+1; i<=total; i++){
    const result = await db.collection('records').updateOne(
      { id: i },
      { $inc: { id: 1 } }
    );
  }
  return "Done";
}

async function recordDelete(_, { record }) {
  const hit = await db.collection('records').find({name: record.name, phone: record.phone}).count();
  if (hit == 0) {
    throw new UserInputError("Sorry, we cannot find your booking. Please check the name and phone number!");
  }
  const target = await db.collection('records').findOne({name: record.name});
  const tid = target['id'];
  const result_del = await db.collection('records').deleteOne({
    name: record.name, phone: record.phone},);
  const result_upd = await db.collection('records').updateMany(
    {id: {$gt:tid}}, {$inc: {id: -1}},)
  const result_cnt = await db.collection('counters').findOneAndUpdate(
      { _id: 'records' }, { $inc: { current: -1 } },{ returnOriginal: false },);
  return result_del;
}

async function createBlackList(_, { name, phone }) {
  const hit = await db.collection('blacklist').find({name: name, phone: phone}).count();
  if (hit == 0)  {
    const result = await db.collection('blacklist').insertOne({name: name, phone: phone});
    return "Done"
  }
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    db.collection('records').createIndex({ id: 1 }, { unique: true });
    db.collection('records').createIndex({ name: 1 });
    db.collection('records').createIndex({ phone: 1 });
    app.listen(3000, function () {
      console.log('App started on port 3000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();

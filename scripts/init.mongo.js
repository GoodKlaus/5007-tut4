db.records.remove({});

const count = db.records.count();
print('Inserted', count, 'records');

db.counters.remove({ _id: 'records' });
db.counters.insert({ _id: 'records', current: count });

db.blacklist.remove({});

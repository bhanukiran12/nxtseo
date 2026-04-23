db.createUser({
  user: process.env.MONGO_ROOT_USER || 'root',
  pwd: process.env.MONGO_ROOT_PASSWORD || 'password',
  roles: [{ role: 'readWrite', db: process.env.MONGO_DB || 'nxtseo' }]
});


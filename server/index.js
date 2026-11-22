'use strict';
const path = require('node:path');
const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;
const root = path.join(__dirname, '..');
const server = createApp({
  dbFile: process.env.DB_FILE || path.join(root, 'data', 'scentfromv.db'),
  publicDir: path.join(root, 'public'),
  adminToken: process.env.ADMIN_TOKEN || '',
});
server.listen(port, () => {
  console.log(`ScentFromV: http://localhost:${port}` + (process.env.ADMIN_TOKEN ? '' : '  (адміністрування вимкнено: не задано ADMIN_TOKEN)'));
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));

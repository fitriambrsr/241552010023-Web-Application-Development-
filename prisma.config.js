const { defineConfig } = require('@prisma/config');
const path = require('path');

module.exports = defineConfig({
  datasource: {
    // Ini akan memaksa database dibuat di dalam folder prisma dengan benar
    url: `file:${path.join(__dirname, 'prisma', 'dev.db')}`,
  },
});
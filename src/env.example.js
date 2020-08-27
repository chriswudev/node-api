'use strict';

const ENV_TYPE = {
  development: 'development',
  production: 'production',
};

module.exports = {
  ENV_TYPE: ENV_TYPE,
  NODE_ENV: process.env.NODE_ENV || ENV_TYPE.development,
  PORT: process.env.PORT || 8087,
  HTTPS_DISABLED: !!process.env.HTTPS_DISABLED,
  PRIVATE_KEY: process.env.PRIVATE_KEY || '../key.pem',
  PUBLIC_KEY: process.env.PUBLIC_KEY || '../server.crt',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://localhost:4200',
  DATA_SOURCE_URL:
    process.env.DATABASE_URL ||
    'postgres://postgres:qq32167q[]@localhost:5432/boilerplate',
  DEFAULT_ADMINISTRATOR_NAME: 'admin',
  DEFAULT_ADMINISTRATOR_PASSWORD: 'Zaqwsx321',
};

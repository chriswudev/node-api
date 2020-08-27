'use strict';

module.exports.REG_EXP = {
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};

module.exports.VALIDATOR_TYPE = {
  letters_and_numbers: 'letters_and_numbers',
  different_register: 'different_register',
  required: 'required',
  min_length: 'minlength',
  email_format: 'email_format',
};

module.exports.HTTP_CODE = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

'use strict';

const _ = require('lodash');
const constants = require('./constants');

const error = require('./error');
const ValidationError = error.ValidationError;

const INCORRECT_VALUE_ERROR_MESSAGE = 'Incorrect value';

const checkRequired = function (
  validatorType,
  value,
  validatorValue = null,
  errorMessage = 'Value is required'
) {
  return !value && value !== 0 && value !== false
    ? _.set({}, validatorType, errorMessage)
    : null;
};

const checkMinLength = function (
  validatorType,
  value,
  validatorValue = null,
  errorMessage = 'String should be longer'
) {
  return value && (typeof value !== 'string' || value.length < validatorValue)
    ? _.set({}, validatorType, errorMessage)
    : null;
};

const checkContainsLettersAndNumbers = function (
  value,
  validatorValue = null,
  errorMessage = 'Value should contain letters and numbers'
) {
  value = value || '';
  let lettersValue = value.replace(
    /[0-9]|[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/g,
    ''
  );
  let letter = /([a-z]|[^\x00-\x7F]|\w)+/;
  let number = /[0-9]/;
  if (value && !(number.test(value) && letter.test(lettersValue))) {
    return _.set(
      {},
      constants.VALIDATOR_TYPE.letters_and_numbers,
      errorMessage
    );
  } else {
    return null;
  }
};

const checkHasDifferentRegisterLetters = function (
  value,
  validatorValue = null,
  errorMessage = 'Value should contain uppercase and lowercase letters'
) {
  return value && value.toLowerCase() === value
    ? _.set({}, constants.VALIDATOR_TYPE.different_register, errorMessage)
    : null;
};

const checkRegexp = function (
  value,
  validatorValue = null,
  errorMessage = 'The string do not match regexp format',
  validator
) {
  validatorValue =
    typeof validatorValue === 'string'
      ? new RegExp(validatorValue)
      : validatorValue;
  return value && !validatorValue.test(value)
    ? _.set({}, validator.type, errorMessage)
    : null;
};

const checkEmailFormat = function (
  value,
  validatorValue = null,
  errorMessage = 'Incorrect email: Should be valid email address',
  validator
) {
  return checkRegexp(value, constants.REG_EXP.email, errorMessage, validator);
};

const handleValidationResult = function (res) {
  if (res) {
    _.forEach(res, (error) => {
      throw new ValidationError(error);
    });
    throw new ValidationError(INCORRECT_VALUE_ERROR_MESSAGE);
  }
};

module.exports.checkPassword = function (password) {
  let res = checkRequired(
    constants.VALIDATOR_TYPE.required,
    password,
    null,
    'Password is required'
  );
  res = !res
    ? checkMinLength(
        constants.VALIDATOR_TYPE.min_length,
        password,
        8,
        'Password should be at least 8 characters'
      )
    : res;
  res = !res
    ? checkContainsLettersAndNumbers(
        password,
        null,
        'Password should contain letters and numbers'
      )
    : res;
  res = !res
    ? checkHasDifferentRegisterLetters(
        password,
        null,
        'Password should contain uppercase and lowercase letters'
      )
    : res;
  handleValidationResult(res);
};

module.exports.checkMinLen = function (value, minLen, errorMessage) {
  let res = checkMinLength(
    constants.VALIDATOR_TYPE.min_length,
    value,
    minLen,
    errorMessage
  );
  handleValidationResult(res);
};

module.exports.checkEmail = function (value) {
  let res = checkEmailFormat(value, undefined, undefined, {
    type: constants.VALIDATOR_TYPE.email_format,
  });
  handleValidationResult(res);
};

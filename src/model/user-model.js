'use strict';

const passwordHash = require('password-hash');
const passwordGenerator = require('generate-password');

const database = require('../database');
const sequelize = database.sequelize;
const Sequelize = database.Sequelize;

const core = require('../core');
const validator = core.validator;
const Model = core.Model;
const ValidationError = core.error.ValidationError;

const MODEL_ATTRIBUTES = {
  username: {
    type: Sequelize.TEXT,
    validate: {
      validateUserName(value) {
        validator.checkMinLen(
          value,
          4,
          'User name should contain minimum 4 chars'
        );
      },
    },
  },
  email: {
    type: Sequelize.TEXT,
    validate: {
      validateEmail(value) {
        validator.checkEmail(value);
      },
    },
  },
  firstName: {
    type: Sequelize.TEXT,
    field: 'first_name',
    allowNull: false,
    validate: { len: 1 },
  },
  lastName: {
    field: 'last_name',
    type: Sequelize.TEXT,
    allowNull: false,
    validate: { len: 1 },
  },
  displayName: {
    field: 'display_name',
    type: Sequelize.TEXT,
    allowNull: false,
  },
  password: { type: Sequelize.TEXT, allowNull: false },
};

const MODEL_OPTIONS = {
  validate: {
    validateUser() {
      let user = this;
      if (
        typeof user.username !== 'undefined' &&
        typeof user.email !== 'undefined' &&
        !user.username &&
        !user.email
      ) {
        throw new ValidationError('User name or email is required');
      }
    },
  },
};

class UserModel extends Model {
  constructor() {
    super('users', [
      'id',
      'username',
      'email',
      'firstName',
      'lastName',
      'displayName',
    ]);
    this.buildModel(MODEL_ATTRIBUTES, MODEL_OPTIONS);
  }

  _findByUserNameOrEmail(fields, usernameOrEmail = '', transaction) {
    usernameOrEmail = usernameOrEmail.trim().toLowerCase();
    return this.sequelizeModel.findOne({
      attributes: fields,
      where: {
        $or: [
          {
            username: Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('username')),
              usernameOrEmail
            ),
          },
          {
            email: Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('email')),
              usernameOrEmail
            ),
          },
        ],
      },
      transaction: transaction,
    });
  }

  save(user, transaction) {
    if (!transaction) {
      return sequelize.transaction((transaction) => {
        return this.save(user, transaction);
      });
    }

    user.password =
      !user.id && !user.password
        ? passwordGenerator.generate({
            length: 20,
            numbers: true,
            symbols: true,
            uppercase: true,
            strict: true,
          })
        : user.password;

    if (user.password) {
      validator.checkPassword(user.password);
      user.password = passwordHash.generate(user.password);
    } else {
      delete user['password'];
    }

    user.id = user.id ? user.id : undefined;
    user.username = user.username ? user.username.trim() : '';
    user.email = user.email ? user.email.trim() : '';
    user.displayName = `${user.firstName} ${user.lastName}`;

    return new Promise((resolve, reject) => {
      let username = user.username.toLowerCase();
      let email = user.email.toLowerCase();

      if (username || email) {
        let filter = { $or: [] };
        if (user.id) {
          filter.id = { $ne: user.id };
        }
        if (username) {
          filter.$or.push({
            username: Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('username')),
              username
            ),
          });
          filter.$or.push({
            email: Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('email')),
              username
            ),
          });
        }
        if (email) {
          filter.$or.push({
            username: Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('username')),
              email
            ),
          });
          filter.$or.push({
            email: Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('email')),
              email
            ),
          });
        }
        this.sequelizeModel
          .findOne({
            attributes: ['id'],
            where: filter,
            transaction: transaction,
          })
          .then((user) => {
            !user
              ? resolve()
              : reject(
                  new ValidationError(
                    'User with this name or email is already exist'
                  )
                );
          })
          .catch(reject);
      } else {
        resolve();
      }
    }).then(() => super.save(user, transaction));
  }

  loadAuthDataByByUsernameOrEmail(usernameOrEmail, transaction) {
    return this._findByUserNameOrEmail(
      ['id', 'password'],
      usernameOrEmail,
      transaction
    );
  }

  findByUsernameOrEmail(usernameOrEmail = '', transaction) {
    return this._findByUserNameOrEmail(
      this.fields,
      usernameOrEmail,
      transaction
    );
  }
}

module.exports = new UserModel();

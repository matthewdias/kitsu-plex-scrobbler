const knex = require('knex')
const { Model, knexSnakeCaseMappers } = require('objection')

const { DATABASE_URL } = require('../config')

Model.knex(knex({
  client: 'pg',
  connection: DATABASE_URL,
  useNullasDefault: true,
  ...knexSnakeCaseMappers()
}))

module.exports = class User extends Model {
  static get tableName() { return 'users' }
}

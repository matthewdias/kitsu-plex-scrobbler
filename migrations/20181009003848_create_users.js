module.exports = {
  up (knex, Promise) {
    return knex.schema.createTable('users', (t) => {
      t.string('id').primary().unique().index()
      t.string('username').unique()
      t.string('auth_token')
      t.string('thumb')
      t.string('kitsu_user')
      t.string('kitsu_token')
      t.string('kitsu_refresh')
      t.timestamp('kitsu_expires')
      t.jsonb('sections')
    })
  },

  down (knex, Promise) {
    return knex.schema.dropTableIfExists('users')
  }
}

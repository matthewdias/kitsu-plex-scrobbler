const { throwStatus, mergeSections, buildUser } = require('../util')
const plex = require('../data/plex')
const kitsu = require('../data/kitsu')
const User = require('../models/User')

module.exports = {
  async post ({ body: { login, password } }, res, next) {
    try {
      let token = await plex.login(login, password)
      let { id, username, thumb, authToken } = token

      let user = await User.query().findById(1)

      if (!user || (user && user.username == username)) {
        id = 1
      } else {
        user = await User.query().findById(id)
      }

      if (!user) {
        user = await User.query().insert({ id, username, thumb, authToken })
      }

      res.json(user)
    } catch (e) { next(e) }
  },

  async get ({ params: { id } }, res, next) {
    try {
      let user = await User.query().findById(id)

      if (!user) {
        throwStatus(404, 'User not found: ' + id)
      }

      user = await buildUser(user)
      res.json(user)
    } catch (e) { next (e) }
  },

  async patch ({ params, body }, res, next) {
    try {
      let { id } = params
      let { kitsuUser, kitsuPass, sections } = body

      let kitsuToken, kitsuRefresh, kitsuExpires
      if (kitsuUser) {
        let token = await kitsu.login(kitsuUser, kitsuPass)
          .catch(({ message }) => throwStatus(401, message))

        kitsuToken = token.accessToken
        kitsuRefresh = token.refreshToken
        kitsuExpires = new Date(token.expires)
      }

      if (sections) {
        let user = await User.query().findById(id)
        if (user.sections) {
          sections = mergeSections(user.sections, sections)
        }
      }

      if (kitsuUser || sections) {
        let user = await User.query().patchAndFetchById(id, {
          kitsuUser, kitsuToken, kitsuRefresh, kitsuExpires,
          sections: JSON.stringify(sections)
        })

        user = await buildUser(user)
        res.json(user)
      } else {
        res.status(304).json('Not modified')
      }
    } catch (e) { next(e) }
  },

  async kitsuLogout ({ params: { id } }, res) {
    try {
      let user = await User.query().patchAndFetchById(id, {
        kitsuUser: null,
        kitsuToken: null,
        kitsuRefresh: null,
        kitsuExpires: null
      })

      user = await buildUser(user)
      res.json(user)
    } catch (e) { next(e) }
  }
}

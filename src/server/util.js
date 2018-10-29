const plex = require('./data/plex')
const kitsu = require('./data/kitsu')
const User = require('./models/User')

const auth = async (req, res, next) => {
  let { params: { id } } = req
  let token = req.get('Authorization')

  let user = await User.query().findById(id)
  if (user && user.authToken == token) {
    next()
  } else {
    let error = new Error('Forbidden')
    error.status = 403
    next(error)
  }
}

const handleError = (error, req, res, next) => {
  let { status, message, stack } = error
  status < 500 ? console.log(stack) : console.error(stack)
  res.status(status || 500).json({ message })
}

const throwStatus = (status, message) => {
  let error = new Error(message)
  error.status = status
  throw error
}

const mergeSections = (defer, prefer) => {
  let result = []
  return defer.map(d => {
    return prefer.find(p => p.uuid == d.uuid)
  })
}

const buildUser = async (user) => {
  if (user.kitsuUser) {
    let kitsuUser = await kitsu.getUser(user)
    if (kitsuUser) {
      user = {
        ...user,
        name: kitsuUser.name,
        avatar: kitsuUser.avatar
      }
    }
  }

  let sections = await plex.getSections(user)

  if (user.sections) {
    user.sections = mergeSections(sections, user.sections)
  } else {
    user.sections = sections
  }

  return user
}

module.exports = { auth, handleError, throwStatus, mergeSections, buildUser }

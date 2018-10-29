const { Tail } = require('tail')
const path = require('path')
const untildify = require('untildify')

const { PLEX_LOGS } = require('./config')
const { buildUser } = require('./util')
const plex = require('./data/plex')
const kitsu = require('./data/kitsu')
const User = require('./models/User')

const tail = new Tail(untildify(path.join(PLEX_LOGS, 'Plex Media Server.log')))

tail.on('line', async (line) => {
  try {
    let matches = line.match(/Library item (\d+) \'(.*?)\' got played by account (\d+)!.*?/)
    if (matches) {
      let [ match, key, title, id ] = matches
      console.log('pmslog:', match)

      let user = await User.query().findById(id)
      if (!user || !user.kitsuUser) {
        return console.log('user has not logged in')
      }

      user = await buildUser(user)
      let sections = user.sections
        .filter(s => s.scrobble)
        .map(s => s.uuid)

      let metadata = await plex.getMetadata(sections, key, user.authToken)
      if (metadata) {
        let kitsuUser = await kitsu.getUser(user)
        kitsu.scrobble(user, kitsuUser, metadata)
      }
    }
  } catch (e) { console.error(e) }
})

console.log('monitoring pmslog at', PLEX_LOGS)

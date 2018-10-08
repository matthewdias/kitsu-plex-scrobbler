const { Tail } = require('tail')
const untildify = require('untildify')
const Plex = require('./plex')
const Kitsu = require('./kitsu')

const kitsu = new Kitsu(process.env)
const plex = new Plex(process.env.PLEX_HOST)
const tail = new Tail(untildify(process.env.PLEX_LOG))

tail.on('line', async (line) => {
  if (kitsu.authorized && plex.authorized) {
    let matches = line.match(/Library item (\d+) \'(.*?)\' got played by account (\d+)!.*?/)
    if (matches) {
      let [ match, id, title, account ] = matches
      console.log('pmslog:', match)

      let libraries = process.env.PLEX_LIBRARIES.split(",").map(library => library.trim())
      let metadata = await plex.getMetadata(libraries, id)
      if (metadata) {
        kitsu.scrobble(metadata)
      }
    }
  }
})

console.log('monitoring pmslog at', process.env.PLEX_LOG)

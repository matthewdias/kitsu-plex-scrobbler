const { Tail } = require('tail')
const untildify = require('untildify')
const { getMetadata } = require('./plex')
const Kitsu = require('./kitsu')

const kitsu = new Kitsu(process.env)
const tail = new Tail(untildify(process.env.PLEX_LOG))
console.log('monitoring pmslog at', process.env.PLEX_LOG)
tail.on('line', async (line) => {
  let matches = line.match(/Library item (\d+) \'(.*?)\' got played by account (\d+)!.*?/)
  if (matches) {
    let [ match, id, title, account ] = matches
    console.log('pmslog:', match)
    let libraries = process.env.PLEX_LIBRARIES.split(",")
    let metadata = await getMetadata(process.env.PLEX_HOST, process.env.PLEX_TOKEN, libraries, id)
    if (metadata) {
      kitsu.scrobble(metadata)
    }
  }
})

const PlexAPI = require('plex-api')
const PinAuth = require('plex-api-pinauth')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const getHost = url => url.match(/(https?):\/\/(.+):(\d+)/)

module.exports = class Plex {
  constructor(host) {
    this.pinAuth = PinAuth()
    this.authorized = false

    let [_, protocol, hostname, port] = getHost(host)
    this.client = new PlexAPI({
      https: protocol == 'https',
      hostname,
      port,
      authenticator: this.pinAuth,
      identifier: 'kitsu-plex-scrobbler',
      deviceName: 'kitsu-plex-scrobbler'
    })

    this.auth()
  }

  async auth () {
    while (!this.authorized) {
      let pin
      try {
        pin = await this.pinAuth.getNewPin()
        console.log(`Visit https://plex.tv/link and enter code: ${pin.code}`)

        let waiting = true
        while (waiting) {
          await sleep(5000)
          this.pinAuth.checkPinForAuth(pin, (error, status) => {
            if (error) {
              console.log(error)
              waiting = false
              return
            } else {
              if (status == 'waiting') {
                waiting = true
                return
              }
              if (status == 'invalid') {
                console.log('plex pin expired')
                waiting = false
                return
              }
              if (status == 'authorized') {
                waiting = false
                this.authorized = true
                return
              }
            }
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    console.log('authorized plex')
  }

  async getMetadata (libraries, id) {
    let response
    try {
      response = await this.client.query('/library/metadata/' + id)

      let { librarySectionTitle, guid, title, parentTitle, grandparentTitle } =
        response.MediaContainer.Metadata[0]

      if (libraries.includes(librarySectionTitle)) {
        console.log('guid ', guid)
        let kitsu, anidb, tvdb, media
        let matches = /.*\.(\w+):\/\/(.+)\/(\d+)\/(\d+)*/g.exec(guid)
        if (matches) {
          let [_, agent, id, season, episode] = matches

          if (agent == 'kitsu') {
            kitsu = id
          } else if (agent == 'hama') {
            if (id.includes('anidb')) {
              anidb = id.replace('anidb-', '')
            } else if (id.includes('tvdb')) {
              tvdb = id.replace('tvdb-', '')
            }
          } else if (agent == 'thetvdb') {
            tvdb = id
          } else {
            console.log('agent not supported')
            return
          }

          media = grandparentTitle || parentTitle

          return { kitsu, anidb, tvdb, media, season, episode }
        } else {
          matches = /.*\.(\w+):\/\/([^?]+)/g.exec(guid)
          if (matches) {
            let [_, agent, id] = matches

            if (agent == 'kitsu') {
              kitsu = id
            } else if (agent == 'hama' && id.includes('anidb')) {
              anidb = id.replace('anidb-', '')
            } else {
              console.log('agent not supported')
              return
            }

            media = title

            return { kitsu, anidb, media }
          } else {
            console.log('invalid metadata')
          }
        }
      } else {
        console.log('not in selected libraries')
      }
    } catch (e) {
      console.log('error fetching metadata:', e)
    }
  }
}

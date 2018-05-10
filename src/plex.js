const request = require('request-promise-native')

module.exports = {
  async getMetadata (host, token, libraries, id) {
    let response
    try {
      response = await request({
        url: host + '/library/metadata/' + id,
        qs: { 'X-Plex-Token': token },
        headers: { Accept: 'application/json' },
        json: true
      })
    } catch (e) {
      console.log('error fetching metadata:', e)
      return
    }

    let { librarySectionTitle, type, guid, parentTitle, grandparentTitle } =
      response.MediaContainer.Metadata[0];
    if (type == 'episode' && libraries.includes(librarySectionTitle)) {
      console.log('guid ', guid)
      let matches = /.*\.(\w+):\/\/(.+)\/(\d+)\/(\d+)*/g.exec(guid)
      if (matches) {
        let [match, agent, id, season, episode] = matches
        let anidb, tvdb
        if (agent == 'hama') {
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

        let series = grandparentTitle || parentTitle

        return { anidb, tvdb, series, season, episode }
      } else {
        console.log('invalid metadata')
      }
    } else {
      console.log('not an episode or not in selected libraries')
    }
  }
}

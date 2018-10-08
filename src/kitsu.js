const Api = require('kitsu/node')
const OAuth2 = require('client-oauth2')

module.exports = class Kitsu {
  constructor ({ KITSU_CLIENT, KITSU_SECRET, KITSU_USERNAME, KITSU_PASSWORD }) {
    this.authorized = false

    new OAuth2({
      clientId: KITSU_CLIENT,
      clientSecret: KITSU_SECRET,
      accessTokenUri: 'https://kitsu.io/api/oauth/token'
    }).owner.getToken(KITSU_USERNAME, KITSU_PASSWORD).then(({ accessToken }) => {
      this.api = new Api({
        headers: {
          'User-Agent': 'kitsu-plex-scrobbler/0.0.1',
          Authorization: 'Bearer ' + accessToken
        }
      })
      this.api.self({ fields: { users: 'slug' } }).then((user) => {
        this.user = user
        this.authorized = true
        console.log('signed into kitsu as', user.slug)
      }).catch(e => console.log('error loading user:', e))
    })
    .catch(e => console.log('error signing in to kitsu:', e))
  }

  async scrobble ({ kitsu, anidb, tvdb, media, season, episode }) {
    console.log('scrobbling:', media, episode ? `${season} ${episode}` : '')

    let anime
    if (kitsu) {
      anime = await this.getAnime(kitsu)
    } else {
      let mapping

      if (anidb) {
        mapping = await this.findMapping('anidb', anidb)
      }

      if (tvdb && !mapping) {
        let tvdbSeason = `${tvdb}/${season}`
        mapping = await this.findMapping('thetvdb', tvdbSeason)
        if (!mapping) {
          mapping = await this.findMapping('thetvdb', tvdb)
        }
        if (!mapping) {
          mapping = await this.findMapping('thetvdb/series', tvdbSeason)
        }
        if (!mapping) {
          mapping = await this.findMapping('thetvdb/series', tvdb)
        }
      }

      if (mapping) {
        anime = mapping.item
      } else {
        console.log('no mapping found');
      }
    }

    if (!anime) {
      return
    }

    episode = episode || 1

    let entry = await this.findEntry(anime.id)
    if (entry) {
      if (entry.progress >= episode) {
        console.log('progress is farther than episode, ignoring')
        return
      }
      try {
        await this.api.patch('libraryEntries', {
          id: entry.id,
          progress: episode
        })
        console.log('updated library entry to', episode)
      } catch (e) {
        console.log('error updating library entry:', e)
      }
    } else {
      try {
        await this.api.post('libraryEntries', {
          progress: episode,
          status: episode == anime.episodeCount ? 'completed' : 'current',
          anime: { type: 'anime', id: anime.id },
          user: { type: 'users', id: this.user.id }
        })
        console.log('created library entry at progress', episode)
      } catch (e) {
        console.log('error creating library entry:', e)
      }
    }
  }

  async getAnime (id) {
    try {
      let { data: anime } = await this.api.get('anime/' + id)
      console.log('found anime:', anime.canonicalTitle)
      return anime
    } catch (e) {
      console.log('error getting anime for id', id, e)
    }
  }

  async findMapping (externalSite, externalId) {
    try {
      let response = await this.api.get('mappings', {
        filter: { externalSite, externalId },
        include: 'item',
        fields: {
          mappings: 'item',
          anime: 'id,episodeCount'
        }
      })
      let mapping = response.data[0]
      if (mapping) {
        console.log('found mapping:', externalSite, mapping.id)
        return mapping
      }
    } catch (e) {
      console.log('error looking up by', externalSite, e)
    }
  }

  async findEntry (animeId) {
    try {
      let response = await this.api.get('libraryEntries', {
        filter: {
          userId: this.user.id,
          animeId
        },
        fields: {
          libraryEntries: 'id,progress'
        }
      })
      let entry = response.data[0]
      if (entry) {
        console.log('found entry:', entry.id)
        return entry
      }
    } catch (e) {
      console.log('error getting library entry:', e)
    }
  }
}

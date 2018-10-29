const Kitsu = require('kitsu')
const OAuth2 = require('client-oauth2')

const User = require('../models/User')

const kitsu = new Kitsu({
  headers: { 'User-Agent': 'kitsu-plex-scrobbler/1.0.0' }
})

const auth = new OAuth2({ accessTokenUri: 'https://kitsu.io/api/oauth/token' })

const login = async (username, password) => {
  return await auth.owner.getToken(username, password)
}

const refresh = async (user) => {
  let token = auth.createToken(user.kitsuToken, user.kitsuRefresh, 'bearer')
  let refresh = await token.refresh()
  let {
    accessToken: kitsuToken,
    refreshToken: kitsuRefresh,
    expires
  } = refresh

  let { username } = user
  let [refreshed] = await User.query().patch({
    kitsuToken,
    kitsuRefresh,
    kitsuExpires: new Date(expires)
  }).where({ username }).returning('*')
  return refreshed
}

const withAuth = async (user, action) => {
  if (user.kitsuExpires < new Date(Date.now)) {
    user = await refresh(user)
  }

  kitsu.headers['Authorization'] = 'Bearer ' + user.kitsuToken
  try {
    return await action()
  } finally {
    delete kitsu.headers['Authorization']
  }
}

const getUser = user => withAuth(user, async () => {
  return await kitsu.self({ fields: { users: 'id,avatar,name' } })
})

const scrobble = (user, kitsuUser, metadata) => withAuth(user, async () => {
  let {
    kitsu: kitsuId, anidb, tvdb,
    media, season, episode
  } = metadata
  let { id: userId } = kitsuUser

  console.log('scrobbling:', media, episode ? `${season} ${episode}` : '')

  let anime
  if (kitsuId) {
    anime = await getAnime(kitsuId)
  } else {
    let mapping

    if (anidb) {
      mapping = await findMapping('anidb', anidb)
    }

    if (tvdb && !mapping) {
      let tvdbSeason = `${tvdb}/${season}`
      mapping = await findMapping('thetvdb', tvdbSeason)
      if (!mapping) {
        mapping = await findMapping('thetvdb', tvdb)
      }
      if (!mapping) {
        mapping = await findMapping('thetvdb/series', tvdbSeason)
      }
      if (!mapping) {
        mapping = await findMapping('thetvdb/series', tvdb)
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

  let entry = await findEntry(anime.id, userId)
  if (entry) {
    if (entry.progress >= episode) {
      console.log('progress is farther than episode, ignoring')
      return
    }
    try {
      await kitsu.patch('libraryEntries', {
        id: entry.id,
        progress: episode
      })
      console.log('updated library entry to', episode)
    } catch (e) {
      console.log('error updating library entry:', e)
    }
  } else {
    try {
      await kitsu.post('libraryEntries', {
        progress: episode,
        status: episode == anime.episodeCount ? 'completed' : 'current',
        anime: { type: 'anime', id: anime.id },
        user: { type: 'users', id: userId }
      })
      console.log('created library entry at progress', episode)
    } catch (e) {
      console.log('error creating library entry:', e)
    }
  }
})

const getAnime = async (id) => {
  try {
    let { data: anime } = await kitsu.get('anime/' + id)
    console.log('found anime:', anime.canonicalTitle)
    return anime
  } catch (e) {
    console.log('error getting anime for id', id, e)
  }
}

const findMapping = async (externalSite, externalId) => {
  try {
    let response = await kitsu.get('mappings', {
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

const findEntry = async (animeId, userId) => {
  try {
    let response = await kitsu.get('libraryEntries', {
      filter: { userId, animeId },
      fields: { libraryEntries: 'id,progress' }
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

module.exports = { login, getUser, scrobble }

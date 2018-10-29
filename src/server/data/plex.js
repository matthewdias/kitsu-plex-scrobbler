const fetch = require('isomorphic-unfetch')
const parseXml = require('@rgrove/parse-xml')
const PlexAPI = require('plex-api')

const User = require('../models/User')

const { PLEX_HOST } = require('../config')

const getHost = url => url.match(/(https?):\/\/(.+):(\d+)/)
const base64 = source => Buffer.from(source, 'binary').toString('base64')

let [_, protocol, hostname, port] = getHost(PLEX_HOST)
const plex = new PlexAPI({
  https: protocol == 'https',
  hostname,
  port,
  identifier: 'kitsu-plex-scrobbler',
  deviceName: 'kitsu-plex-scrobbler'
})

const login = async (login, password) => {
  let response = await fetch('https://plex.tv/users/sign_in.json', {
    method: 'POST',
    headers: {
      'X-Plex-Client-Identifier': 'kitsu-plex-scrobbler',
      Authorization: 'Basic ' + base64(login + ':' + password)
    }
  })

  if (!response.ok) {
    throw new Error(response.status)
  }

  let { user } = await response.json()
  let { authToken } = user

  let admin = await User.query().findById(1)
  if (!admin) {
    return user
  }

  let { MediaContainer } = await plex.query(`/?X-Plex-Token=${admin.authToken}`)
  let { machineIdentifier } = MediaContainer

  response = await fetch(`https://plex.tv/pms/resources?X-Plex-Token=${authToken}`, {
    headers: { 'X-Plex-Client-Identifier': 'kitsu-plex-scrobbler' }
  }).then(res => res.text()).then(parseXml)

  let devices = response.children[0].children.filter(child => child.name == 'Device')
  let server = devices.find(device => device.attributes.clientIdentifier == machineIdentifier)
  let { accessToken } = server.attributes

  return { ...user, authToken: accessToken }
}

const getSections = async (user) => {
  let sectionEndpoint = `/library/sections?X-Plex-Token=${user.authToken}`
  let response = await plex.query(sectionEndpoint)
  let sections = response.MediaContainer.Directory.map(({ uuid, title, type }) => ({
    uuid, title, type, scrobble: false
  })).filter(section => ['movie', 'show'].includes(section.type))
  return sections
}

const getMetadata = async (sections, key, authToken) => {
  try {
    let url = `/library/metadata/${key}?X-Plex-Token=${authToken}`
    let { MediaContainer } = await plex.query(url)

    let { librarySectionUUID } = MediaContainer
    let {
      guid,
      title,
      parentTitle,
      grandparentTitle
    } = MediaContainer.Metadata[0]

    if (!sections.includes(librarySectionUUID)) {
      console.log('not in selected libraries')
      return
    }

    console.log('guid ', guid)
    let kitsu, anidb, tvdb, media
    let episodeMatches = /.*\.(\w+):\/\/(.+)\/(\d+)\/(\d+)*/g.exec(guid)
    if (episodeMatches) {
      let [_, agent, id, season, episode] = episodeMatches

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
      let movieMatches = /.*\.(\w+):\/\/([^?]+)/g.exec(guid)
      if (movieMatches) {
        let [_, agent, id] = movieMatches

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
  } catch (e) {
    console.log('error fetching metadata:', e)
  }
}

module.exports = { login, getSections, getMetadata }

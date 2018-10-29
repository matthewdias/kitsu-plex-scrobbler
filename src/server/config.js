process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const { NODE_ENV } = process.env

const config = {
  development: {
    PORT: 8080,
    PLEX_HOST: 'http://localhost:32400',
    DATABASE_URL: { user: 'postgres', database: 'kitsu-plex-scrobbler' }
  },
  production: {
    PORT: 8929,
    PLEX_HOST: 'http://localhost:32400',
    DATABASE_URL: { user: 'postgres', database: 'kitsu-plex-scrobbler' }
  }
}

const env = {
  PORT: process.env.PORT,
  PLEX_HOST: process.env.PLEX_HOST,
  PLEX_LOGS: process.env.PLEX_LOGS,
  DATABASE_URL: process.env.DATABASE_URL
}

const mergeConfig = (defer, prefer) => {
  let result = {}
  Object.keys(prefer).forEach((key) => {
    result[key] = prefer[key] ? prefer[key] : defer[key]
  })
  return result
}

module.exports = mergeConfig(config[NODE_ENV], env)

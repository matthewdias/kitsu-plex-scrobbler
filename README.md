### Features/Constraints

- Watches Plex log file for activity and submits to Kitsu
- Supports [kitsu](https://github.com/matthewdias/Kitsu.bundle), thetvdb and [hama](https://github.com/ZeroQI/Hama.bundle) agents. (Use kitsu for best results)
- thetvdb and hama agents require tvdb/anidb mappings for the media to exist in Kitsu's database
- Must run on same machine as Plex Media Server

### Run it

##### Running with Node.js

1. Install [PostgreSQL](https://www.postgresql.org/)
2. Create a database
3. Install [current Node.js](https://nodejs.org)
4. run `npm install`
5. Set [env vars](#Env-vars)
6. run `npm start`

##### Running with Docker

1. Install [Docker](https://store.docker.com/search?offering=community&type=edition)
2. Set [env vars](#Env-vars)
3. Run `docker-compose up`

##### Env vars

| Var | Default Value | Description | Node | Docker |
|---|---|---|---|---|
| `PLEX_HOST` | `http://localhost:32400` | Plex Media Server host | Optional | Optional <br /> (Docker for Mac/Windows users should set this to `http://host.docker.internal:<plex port>`) |
| `PLEX_LOGS` | none | Location of your Plex Media Server log files [(instructions)](https://support.plex.tv/articles/200250417-plex-media-server-log-files/) <br /> Common locations: <ul> <li>macOS: `"~/Library/Logs/Plex Media Server"`</li> <li>Linux: `"/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Logs"`</li> <li>Windows: `"~\\AppData\\Local\\Plex Media Server\\Logs"`</li> <li>FreeBSD: `"/usr/local/plexdata/Plex Media Server/Logs"`</li> <ul> | Required | Required |
| `PORT` | `8929` | Port for web server to listen on | Optional | Optional |
| `DATABASE_URL` | `postgres://postgres@localhost:5432/kitsu-plex-scrobbler` | Connection URL for your PostgreSQL database | Optional | Ignored |
| `POSTGRES_PORT` | `5434` | Port for included PostgreSQL database to listen on | Ignored | Optional |
  
##### Setting env vars for a command

- Unix/Bash-like Shell: `VAR1="value 1" docker-compose up`
- Windows PowerShell: `$env:VAR1 = "value 1"; docker-compose up`

### Use it

- After starting the scrobbler, navigate to `http://localhost:<PORT>` in your browser
- Login with your Plex account credentials. **Important:** The owner of the Plex server must be the first to login
- Configure settings (These will only apply when watching via your Plex account)
  - Choose which libraries you want to scrobble for your Plex account
  - Connect your Kitsu account
- Watch something on Plex and your Kitsu library will be updated

### Screenshots

<div style="display: flex; justify-content: space-between;">
  <img src="https://i.imgur.com/KQrzFIx.png" width=500 height=427 />
  <img src="https://i.imgur.com/cdAPU3w.png" width=500 height=427 />
</div>

### Acknowledgements

Thanks to
- [@xiprox](https://github.com/xiprox) for mocking up the design
- [Arcanemagus/plex-api](https://github.com/Arcanemagus/plex-api/wiki) for guiding me through the dark

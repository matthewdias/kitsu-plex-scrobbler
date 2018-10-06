### Features/Constraints

- Watches Plex log file for activity and submits to Kitsu
- Supports thetvdb and [hama](https://github.com/ZeroQI/Hama.bundle) agents. (Use hama for best results)
- Will only work for shows that have a TheTVDB or AniDB mapping on Kitsu
- Must run on same machine as Plex Media Server
- Requires [Node.js](http://nodejs.org/)

### Running

1. run `npm install`
2. Set env vars
  - `KITSU_CLIENT`: dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd
  - `KITSU_SECRET`: 54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151
  - `KITSU_USERNAME`: your Kitsu username
  - `KITSU_PASSWORD`: your Kitsu password
  - `PLEX_HOST`: Plex Media Server host (eg. `http://localhost:32400`)
  - `PLEX_TOKEN`: your Plex token [(instructions)](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/) (Only required for claimed servers)
  - `PLEX_LOG`: location of your Plex Media Server log file [(instructions)](https://support.plex.tv/articles/200250417-plex-media-server-log-files/)
    - plex defaults:
      - macOS: `"~/Library/Logs/Plex Media Server/Plex Media Server.log"`
      - Linux: `"/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Logs/Plex Media Server.log"`
      - Windows: `"~\\AppData\\Local\\Plex Media Server\\Logs\\Plex Media Server.log"`
      - FreeBSD: `"/usr/local/plexdata/Plex Media Server/Logs/Plex Media Server.log"`
  - `PLEX_LIBRARIES`: comma-delimited list of library names to watch (e.g. `"Anime, Anime2"`)
2. run `npm start`

### Running with Docker

```
docker run --name kitsu-plex-scrobbler \
  -e KITSU_CLIENT=dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd \
  -e KITSU_SECRET=54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151 \
  -e KITSU_USERNAME=<username> \
  -e KITSU_PASSWORD=<password> \
  -e PLEX_HOST=http://localhost:32400
  -e PLEX_TOKEN=<token> \
  -e PLEX_LOG="/logs/Plex Media Server.log" \
  -e PLEX_LIBRARIES=Anime \
  -v "/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Logs:/logs" \
  matthewdias/kitsu-plex-scrobbler
```

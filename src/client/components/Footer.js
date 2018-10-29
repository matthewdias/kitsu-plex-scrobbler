import React from 'react'

import KitsuIcon from '../static/kitsu.png'
import PlexIcon from '../static/plex.png'

export default () => (
  <div className="footer">
    <div>
      <img src={PlexIcon} className="footer-plex" />
      <img src={KitsuIcon} className="footer-kitsu" />
    </div>
    <span className="footer-text">kitsu-plex-scrobbler</span>
  </div>
)

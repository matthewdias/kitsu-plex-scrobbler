import React from 'react'

import show from '../static/show.png'
import movie from '../static/movie.png'
import photo from '../static/photo.png'
import artist from '../static/artist.png'

const icons = { show, movie, photo, artist }

export default (props) => {
  let { uuid, title, type, scrobble } = props.section
  return (
    <div className="section">
      <span className="check-container" onClick={() => props.onChange(uuid, scrobble)}>
        <div className="checkbox" />
        <span className={scrobble ? 'check' : 'checkbox-hide'} />
      </span>
      <img src={icons[type]} className="section-icon" />
      <label htmlFor={uuid}>{title}</label>
    </div>
  )
}

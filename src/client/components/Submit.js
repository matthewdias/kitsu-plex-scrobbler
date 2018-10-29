import React from 'react'

export default (props) => {
  if (props.loading) {
    return (
      <div className="submit loading">
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span className="loading-text">{props.value}</span>
      </div>
    )
  } else {
    return (
      <input
        type="submit"
        value={props.value}
        className="submit" />
    )
  }
}

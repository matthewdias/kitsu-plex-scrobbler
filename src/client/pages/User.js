import React from 'react'
import { Redirect } from 'react-router'

import { alertResponse } from '../util'
import KitsuAccount from '../components/KitsuAccount'
import LibraryPicker from '../components/LibraryPicker'
import PlexIcon from '../static/plex.png'
import LogoutIcon from '../static/logout.png'

export default class User extends React.Component {
  state = {}

  logout = async (event) => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('id')
    this.setState({ user: null })
  }

  async componentDidMount () {
    if (localStorage.getItem('authToken')) {
      let { id, notify, history } = this.props
      let response = await fetch('/api/user/' + id, {
        headers: { Authorization: localStorage.getItem('authToken') }
      })
      if (response.ok) {
        let user = await response.json()
        this.setState({ user })
      } else {
        localStorage.removeItem('authToken')
        localStorage.removeItem('id')
        alertResponse(response, notify)
        history.push('/')
      }
    }
  }

  render () {
    if (this.state.user) {
      return (
        <div className="container">
          <h2>User Settings</h2>
          <div className="avatar-container">
            <img src={this.state.user.thumb} className="avatar contained" />
          </div>
          <div className="inset row">
            <img src={PlexIcon} className="icon" />
            <span className="account-name">{this.state.user.username}</span>
            <img src={LogoutIcon} title="Log out" onClick={this.logout} className="logout"/>
          </div>
          <LibraryPicker user={this.state.user} notify={this.props.notify} />
          <KitsuAccount
            user={this.state.user}
            key={this.state.user.slug}
            notify={this.props.notify} />
        </div>
      )
    } else if (!localStorage.getItem('authToken')) {
      return ( <Redirect to="/" /> )
    } else return ( <div className="container">Loading...</div> )
  }
}

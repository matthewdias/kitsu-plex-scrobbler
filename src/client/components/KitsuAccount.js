import React from 'react'

import { alertResponse } from '../util'
import Submit from '../components/Submit'
import KitsuIcon from '../static/kitsu.png'
import LogoutIcon from '../static/logout.png'
import NoFace from '../static/noface.png'

export default class KitsuAccount extends React.Component {
  state = { user: this.props.user, loading: false }
  username = React.createRef()
  password = React.createRef()

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    let response = await fetch('/api/user/' + this.state.user.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('authToken')
      },
      body: JSON.stringify({
        kitsuUser: this.username.current.value,
        kitsuPass: this.password.current.value
      })
    })

    if (response.ok) {
      let user = await response.json()
      this.setState({ user })
    } else {
      alertResponse(response, this.props.notify)
    }

    this.setState({ loading: false })
  }

  logout = async (event) => {
    let url = '/api/user/' + this.state.user.id + '/kitsu-logout'
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('authToken')
      }
    })

    if (response.ok) {
      let user = await response.json()
      this.setState({ user })
    } else {
      alertResponse(response, this.props.notify)
    }
  }

  render () {
    return this.state.user.name ? (
      <div>
        <h4>Kitsu Account</h4>
        <div className="row inset large">
          <img src={KitsuIcon} className="cover" width="140" height="90"/>
          <img
            src={this.state.user.avatar ? this.state.user.avatar.small : NoFace}
            className="avatar" />
          <span className="account-name">{this.state.user.name}</span>
          <img src={LogoutIcon} title="Log out" onClick={this.logout} className="logout"/>
        </div>
      </div>
    ) : (
      <form onSubmit={this.handleSubmit}>
        <h4>Login with Kitsu</h4>
        <input
          className="inset"
          ref={this.username}
          type="text"
          placeholder="Kitsu Email" />
        <input
          className="inset"
          ref={this.password}
          type="password"
          placeholder="Kitsu Password" />
        <Submit value="Login" loading={this.state.loading} />
      </form>
    )
  }
}

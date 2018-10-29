import React from 'react'
import { withRouter } from 'react-router'

import { alertResponse } from '../util'
import Submit from '../components/Submit'

class Login extends React.Component {
  state = { loading: false }
  username = React.createRef()
  password = React.createRef()

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    let response = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: this.username.current.value,
        password: this.password.current.value
      })
    })

    if (response.ok) {
      let { id, authToken } = await response.json()
      localStorage.setItem('authToken', authToken)
      localStorage.setItem('id', id)
      this.props.history.push('/user/' + id)
    } else {
      alertResponse(response, this.props.notify)
      this.setState({ loading: false })
    }
  }

  componentDidMount() {
    let id = localStorage.getItem('id')
    if (id) {
      this.props.history.push('/user/' + id)
    }
  }

  render() {
    return (
      <div className="container">
        <form className="login-form" onSubmit={this.handleSubmit}>
          <h2 className="important">Login with Plex</h2>
          <input
            className="inset"
            ref={this.username}
            type="text"
            placeholder="Plex Username"
            autoComplete="username" />
          <input
            className="inset important"
            ref={this.password}
            type="password"
            placeholder="Plex Password"
            autoComplete="current-password" />
          <div />
          <Submit value="Login" loading={this.state.loading} />
        </form>
      </div>
    )
  }
}

export default withRouter(Login)

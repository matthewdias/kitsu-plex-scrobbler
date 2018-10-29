import React from 'react'

import { alertResponse } from '../util'
import Library from './Library'
import Submit from './Submit'

export default class LibraryPicker extends React.Component {
  state = { sections: this.props.user.sections, loading: false }

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    let { sections } = this.state
    let response = await fetch('/api/user/' + this.props.user.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('authToken')
      },
      body: JSON.stringify({ sections })
    })

    if (response.ok) {
      let user = await response.json()
      this.setState({ sections: user.sections })
    } else {
      alertResponse(response, this.props.notify)
    }

    this.setState({ loading: false })
  }

  handleChange = (uuid, scrobble) => {
    this.setState(({ sections }, props) => {
      let index = sections.findIndex(s => s.uuid == uuid)
      sections[index].scrobble = !scrobble
      return { ...this.state, sections }
    })
  }

  renderSections = sections => sections.map((section) => (
    <Library
      section={section}
      key={section.uuid}
      onChange={this.handleChange} />
  ))

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h4>Enable Plex Libraries for Scrobbling</h4>
        <div>
          { this.renderSections(this.state.sections) }
        </div>
        <Submit value="Save" loading={this.state.loading}/>
      </form>
    )
  }
}

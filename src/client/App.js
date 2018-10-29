import React from 'react'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { ToastContainer, toast, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

import { Login, User } from './pages'
import Footer from './components/Footer'
import './static/styles.css'

export default class App extends React.Component {
  notify = message => toast(message, {
    className: 'notif',
    bodyClassName: 'notif-body',
    closeButton: false,
    transition: Slide,
    hideProgressBar: true
  })

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route path="/user/:id" render={props => (
              <User
                {...props}
                id={props.match.params.id}
                notify={this.notify} />
            )} />
            <Route exact path="/" render={props => (
              <Login
                {...props}
                notify={this.notify} />
            )} />
            <Redirect to="/" />
          </Switch>
        </Router>
        <ToastContainer />
        <Footer />
      </div>
    )
  }
}

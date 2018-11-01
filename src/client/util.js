import { withRouter } from 'react-router'

const alertResponse = async (response, notify) => {
  let message
  if (response.headers.get('Content-Type').includes('application/json')) {
    let error = await response.json()
    message = error.message || error
  } else {
    message = await response.text()
  }

  notify(`${response.status} error: ${message}`)
}

export { alertResponse }

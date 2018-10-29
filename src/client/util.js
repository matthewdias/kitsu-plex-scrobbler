import { withRouter } from 'react-router'

const alertResponse = async (response, notify) => {
  let message
  if (response.headers.get('Content-Type') == 'application/json') {
    message = await response.json()
  } else {
    message = await response.text()
  }

  notify(`${response.status} error: ${message}`)
}

export { alertResponse }

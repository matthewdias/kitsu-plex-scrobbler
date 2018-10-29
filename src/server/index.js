const express = require('express')
const fallback = require('express-history-api-fallback')

const { PORT } = require('./config')
const { auth, handleError } = require('./util')
const user = require('./routes/user')

const app = express()
const root = __dirname + '../../../dist'

app.use(express.static(root))
app.use(express.json())

app.post('/api/user', user.post)
app.get('/api/user/:id', auth, user.get)
app.patch('/api/user/:id', auth, user.patch)
app.post('/api/user/:id/kitsu-logout', auth, user.kitsuLogout)

app.use(fallback('index.html', { root }))
app.use(handleError)

app.listen(PORT, console.log('Server started on port', PORT))

require('./monitor')

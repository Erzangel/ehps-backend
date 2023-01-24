
const db = require('./db')
const express = require('express')
const cors = require('cors')
const authenticator = require('./authenticator')
const bcrypt = require('bcrypt');

const app = express()
const authenticate = authenticator({
  test_payload_email: process.env['TEST_PAYLOAD_EMAIL'],
  jwks_uri: 'http://127.0.0.1:5556/dex/keys'
})

app.use(require('body-parser').json())
app.use(cors())

app.get('/', (req, res) => {
  res.send([
    '<h1>EHPS Backend</h1>'
  ].join(''))
})

// Users
app.get('/users', async (req, res) => {
  const users = await db.users.list()
  res.json(users)
})

app.post('/users', async (req, res) => {
  const user = await db.users.create(req.body)
  const passwordHash = await db.userAuth.create(user.id, user.password)
  await db.useremailtoid.create(user.email, user.id)
  res.status(201).json(user)
})

app.delete('/users/:id', async (req, res) => {
  await db.users.delete(req.params.id, req.body)
  await db.userAuth.delete(req.params.id)
  await db.useremailtoid.delete(req.body.email)
  res.status(200).json({})
})

app.get('/users/:id',  async (req, res) => {
  try {
    const user = await db.users.get(req.params.id)
    res.json(user)
  } catch(err) {
    res.json({message: err.type})
  }
})

app.put('/users/:id', async (req, res) => {
  const user = await db.users.update(req.params.id, req.body)
  try {
    await db.useremailtoid.delete(user.email)
    await db.useremailtoid.create(req.body.email, req.params.id)
  } catch(err) {
    throw err
  }
  res.json(user)
})

// User Auth (No post method, managed from the users operations)
app.put('/userAuth/:id', async (req, res) => {
  try {
    if (!req.body.password) res.status(401).json("No password in request body")
    const authResponse = await db.userAuth.get(req.params.id)
    const passwordHash = authResponse.passwordHash
    bcrypt.compare(req.body.password, passwordHash, function(err, result) {
      if (err) throw Error(err)
      if (result === true) {
        res.status(200).json(result)
      }
      else {
        res.status(401).json("Provided password does not match")
      }
    });
  } catch(err) {
    if (err.notFound) {
      res.status(404).json(err)
    }
    else throw err
  }
})

// User Index (No post method, managed from the users operations)
app.get('/userbyemail', async (req, res) => {
  const index = await db.useremailtoid.list()
  res.json(index)
})

app.get('/userbyemail/:email', async (req, res) => {
  try {
    const user = await db.useremailtoid.get(req.params.email)
    res.status(200).json(user)
  } catch(err) {
    if (err.notFound) {
      res.status(404).json(err)
    }
    else throw err
  }
})

module.exports = app

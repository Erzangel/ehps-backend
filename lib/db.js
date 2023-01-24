
const {v4: uuid} = require('uuid')
const {clone, merge} = require('mixme')
const microtime = require('microtime')
const level = require('level')
const db = level(__dirname + '/../db')
const bcrypt = require('bcrypt');

module.exports = {
  // User schema:
  // Key:
  // - id:            A randomly generated UUID
  // Value:
  // - email:         email of the user, used for identification
  // - password:      hashed password of the user, it is hashed in the backend
  // - username:      A name for the user
  // - imageid:      An int describing which profile picture to use in the front end
  users: {
    create: async (user) => {
      if(!user.username) throw Error('Invalid user')
      const id = uuid()
      const copiedUser = {...user}
      delete copiedUser.password
      console.log(user)
      console.log(copiedUser)
      await db.put(`users:${id}`, JSON.stringify(copiedUser))
      return merge(user, {id: id})
    },
    get: async (id) => {
      if(!id) throw Error('Invalid id')
      const data = await db.get(`users:${id}`)
      const user = JSON.parse(data)
      return merge(user, {id: id})
    },
    list: async () => {
      return new Promise( (resolve, reject) => {
        const users = []
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        }).on( 'data', ({key, value}) => {
          user = JSON.parse(value)
          user.id = key.split(':')[1]
          users.push(user)
        }).on( 'error', (err) => {
          reject(err)
        }).on( 'end', () => {
          resolve(users)
        })
      })
    },
    update: async (id, user) => {
      try {
        const data = await db.get(`users:${id}`)
        const original = JSON.parse(data)
        if (original) {
          await db.put(`users:${id}`, JSON.stringify(user))
          return merge(original, {id: id})
        }
      } catch(err) {
        if (err.notFound) {
          throw Error('Unregistered user id on update request')
        }
        else throw Error(err)
      }
    },
    delete: async (id, user) => {
      if(!id) throw Error('Invalid user')
      await db.del(`users:${id}`)
    }
  },
  useremailtoid: {
    create: async (email, id) => {
      await db.put(`users-by-email:${email}`, JSON.stringify({
        id: id
      }))
      return { email: email, id: id }
    },
    get: async (email) => {
      const data = await db.get(`users-by-email:${email}`)
      const id = JSON.parse(data)
      return { email: email, id: id.id}
    },
    list: async () => {
      return new Promise( (resolve, reject) => {
        const index = []
        db.createReadStream({
          gt: "users-by-email:",
          lte: "users-by-email" + String.fromCharCode(":".charCodeAt(0) + 1),
        }).on( 'data', ({key, value}) => {
          entry = JSON.parse(value)
          entry.email = key.split(':')[1]
          index.push(entry)
        }).on( 'error', (err) => {
          reject(err)
        }).on( 'end', () => {
          resolve(index)
        })
      })
    },
    delete: async (email) => {
      if(!email) throw Error('Invalid email')
      await db.del(`users-by-email:${email}`)
    }
  },
  // userAuth: pair of ids and bcrypt passwords
  userAuth: {
    create: async (id, password) => {
      if(!id) throw Error('Invalid ID when storing auth')
      if(!password) throw Error('Invalid password when storing auth')
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          throw Error(err)
        }
        db.put(`user-auth:${id}`, JSON.stringify(hash))
        return {passwordHash: hash}
      } )
    },
    get: async (id) => {
      if(!id) throw Error('Invalid ID when retrieving auth info')
      const data = await db.get(`user-auth:${id}`)
      const passwordHash = JSON.parse(data)
      return { id: id, passwordHash: passwordHash}
    },
    delete: async(id) => {
      if(!id) throw Error('Invalid ID when attempting to delete auth info')
      await db.del(`user-auth:${id}`)
    }
  },
  admin: {
    clear: async () => {
      await db.clear()
    }
  }
}

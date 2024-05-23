const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'userData.db')

module.exports = app
app.use(express.json())

let db = null

initlizeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(-1)
  }
}

initlizeDBAndServer()
app.use(express.json())

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const passwordLength = password.length
  if (passwordLength < 5) {
    response.status(400)
    response.send('Password is too short')
  } else {
    const userQuery = `SELECT * FROM user WHERE username = '${username}';`
    const userQueryResponse = await db.get(userQuery)
    if (userQueryResponse === undefined) {
      const encriptedPassword = await bcrypt.hash(request.body.password, 10)
      const newUserQuery = `INSERT INTO user (username,name,password,gender,location)
    VALUES
    ('${username}', '${name}', '${encriptedPassword}', '${gender}', '${location}');`
      await db.run(newUserQuery)
      response.status(200)
      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('User already exists')
    }
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const userDetails = `SELECT * FROM user WHERE username = '${username}';`
  const isUserValidResponse = await db.get(userDetails)
  if (isUserValidResponse === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const validateUserPassword = await bcrypt.compare(
      password,
      isUserValidResponse.password,
    )
    if (validateUserPassword === true) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// app.put('/change-password', async (request, response) => {
//   const {username, oldPassword, newPassword} = request.body
//   const userDetails = `SELECT * FROM user WHERE username = '${username}';`
//   const dbUser = await db.get(userDetails)
//   console.log(dbUser)
//   const lengthOfPassword = newPassword.length
//   if (lengthOfPassword < 5) {
//     response.status(400)
//     response.send('Password is too short')
//   }
//   if (dbUser === undefined) {
//     response.status(400)
//     response.send('Invalid password')
//   } else {
//     const valadiateUserPassword = await bcrypt.compare(
//       oldPassword,
//       dbUser.password,
//     )
//     console.log(valadiateUserPassword)
//     const encriptedPasswordUser = await bcrypt.hash(newPassword, 10)
//     if (valadiateUserPassword === true) {
//       const updateUserPassword = `UPDATE user
//             SET
//             password='${encriptedPasswordUser}'
//             WHERE
//             username = '${username}';`
//       await db.run(updateUserPassword)

//       response.status(200)
//       response.send('Password updated')
//     } else {
//       response.status(400)
//       response.send('Invalid current password')
//     }
//   }
// })

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const checkForUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await db.get(checkForUserQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid current password')
  } else {
    const isUserPassword = await bcrypt.compare(oldPassword, dbUser.password)
    if (isUserPassword === true) {
      const lengthOfPassword = newPassword.length
      if (lengthOfPassword < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const encriptedPassword = await bcrypt.hash(newPassword, 10)
        const userPasswordUpdate = `UPDATE user
        SET password = '${encriptedPassword}'
        WHERE username = '${username}';`
        await db.run(userPasswordUpdate)
        response.status(200)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})

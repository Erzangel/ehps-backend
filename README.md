
# EHPS Backend for Users

This is the backend for the users from the ECE Horror Picture Show/Project Mirage's user database prototype.

## Usage

Start the web application:

```bash
./bin/start 
```

Run the tests with mocha:

```bash
npm run test
```

## Instructions

### Getting users

### Listing all users - GET

List all users with a GET request.

URL: `http://90.91.27.127:25565/users`

### Create new user - POST

Create a new user with a POST request.

URL: `http://90.91.27.127:25565/users`

Example of input in body:

```json
{
  "username": "john",
  "email": "johndoe@example.com",
  "password": "iamjohndoe",
  "imageid": "1"
}
```

The password is hashed using [bcrypt](https://www.npmjs.com/package/bcrypt), so that any given password is secured.

### Get user info - GET

Get info of a specific user with his ID.

URL: `http://90.91.27.127:25565/users/<user-id>`

Example of response:

```json
{"username":"luka","email":"luka@mail.com","imageid":"1","id":"4e625da2-9ab4-47b9-a71d-e7410dfb1fbd"}
```

### Getting a user's password hash - PUT

Test a user's password against its hash in the database with a PUT method.

URL: `http://90.91.27.127:25565/userAuth/<user-id>`, such as:

Request body must contain the password, like:

```json
{"password": "iamjohndoe"}
```

Example of response:

```json
{"id":"4e625da2-9ab4-47b9-a71d-e7410dfb1fbd","passwordHash":"$2b$10$L9GA5nImqYsNUxkyHH5g7uSvLoQfN6G0D9OnP08wpgqWgn79HLNRe"}
```

### Getting a user's ID from his email - GET

Using an user's email, get his ID.

URL: `http://90.91.27.127:25565/userbyemail/<user-email>`

Example of response:

```json
{"email":"luka@mail.com","id":"4e625da2-9ab4-47b9-a71d-e7410dfb1fbd"}
```
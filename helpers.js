const generateRandomString = function() {
  const randomStringLength = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < randomStringLength; i++) {
    const randomCharIndex = Math.floor((Math.random() * characters.length));
    randomString += characters[randomCharIndex];
  }
  return randomString;
};

// Checks a value against "users object" with specified key and database
const checkExisting = function(value, key, database) {
  let isExisting = false;

  Object.values(database).forEach(user => {
    if (user[key] === value) {
      return isExisting = true;
    }
  });
  return isExisting;
};

// Retrieves user id from 'users object' given email
const getUserByEmail = function(email, database) {
  let userId;

  Object.values(database).forEach(user => {
    if (user.email === email) {
      userId = user;
    }
  });
  return userId;
};

// Checks for urls object in database by user_id, adds to new object and returns filtered object
const urlsForUser = function(id, database) {
  let userDB = {};
  Object.entries(database).forEach(([key, value]) => {
    if (value.userID === id) {
      userDB[key] = value;
    }
  });
  return userDB;
};

module.exports = {
  generateRandomString,
  checkExisting,
  getUserByEmail,
  urlsForUser,
}
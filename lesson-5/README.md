# Authentication with Sessions

This lesson will add on to some of the concepts taught in Lesson 4 by adding an authentication layer to API. We will be going over Logging in with Sessions via [passport.js](http://www.passportjs.org/)

## Part 1: Setup

**Setting up the project**

Inside the `lesson-5` directory, create a new directory called `lesson-5-<your-name>` and `cd` into it.

Create a Node.js project by typing the following:
```
npm init
```
You should now see a `package.json` file inside your project directory.

Make sure to install Express as a dependency.
```
npm install --save express
```

‎

**Creating the Express.js project**

Make sure you are in the same directory with `package.json`. You should have `express-generator` globally installed from the previous projects.
```
express --view=ejs
```
This creates an Express application in your current directory and sets `ejs` to the default view engine. More cli options can be found at https://expressjs.com/en/starter/generator.html. For simplicity's sake, we will be using this relatively barebones configuration.

----------

## Part 2: Updating our User model and User POST route

**We need some security**

In the previous lesson, we logged in simply by passing in a username. Doesn't that mean anyone could log into anyone account? YES 😠. We also need to store a password on our Mongoose model.

‎

**Add a Password field to our User model**

Go into `models/user.js`, and add a field called `password` which is **required** and is of type `String` (identical structure to the username field defined)

‎

**Updating our Create User route**

First, add validation to ensure the existence of a `password` field in our request body. Write this code under the part where we check for the existence of a `username` field.

```JS
if (!username) {
  return res.status(400).send({ error: 'Username must be specified. '});
}

// WRITE YOUR PASSWORD VALIDATION HERE

// Be creative, like checking to see if the password is at least 8 characters long, etc.
```

‎

**A Lil' Cryptography Aside**

Now, when we store passwords on our database, we don't want to store the plaintext password because that's bad! If a hacker manages to get in our database, they have access to all of our user's passwords.

Instead, our protocol of authentication will be to hash the user's password using a hash function known to be cryptographically secure. When we want to check if the user inputted the correct password, we will hash the input and compare it with the hash in our database.

However, we have another problem. A lot of known password hashes are saved throughout the internet in something known as a **Rainbow Table**. This makes our password hashes as susceptible to hacking as a plaintext password.

Hence, our solution is to hash our password with an additional string called a **salt**. The salt is unknown to the hacker which defends our database from a Rainbow Table attack.

Don't worry though, all this can be done for us with an npm module. Yay!

‎

**Back to updating our route**

Install the following:
```
npm install --save bcryptjs
```

At the top of our file, let's also include our newly installed dependency.
```JS
// Top of the file
const bcrypt = require('bcryptjs');
```

Now, let's include the following logic in the `.then(user => {...})` section of our route. (Right after we do `User.findOne`)

```JS
if (user) {
  throw `${username} already exists.`;
}

// NEW CODE
const salt = bcrypt.genSaltSync();
const data = {
  username: req.body.username,
  password: bcrypt.hashSync(req.body.password, salt)
}
const newUser = new User(data);
return newUser.save();
```

We first create our salt with `bcrypt.genSaltSync`. The `Sync` part just means to do it synchronously (because JS is notoriously asynchronous).

Next, we create our password hash using `bcrypt.hashSync` and save our new user with the data created.


## Part 3: Initializing the Session middleware and store
**Installing our dependencies**

Make sure to install the following before we get started
```
npm install --save express-session connect-mongodb-session
```

Next, in our `app.js` make sure to include the new dependencies we installed.

```JS
const express = require('express');
...
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
```

The second dependency `connect-mongodb-session` takes in `express-session` as a parameter, so remember to do that!

‎

**Creating the Store**

The store is essentially a module that will handle all of the logic involving storing the actual Sessions in our database.

Copy and paste the following code after you initialize your app's static directory

```JS
...
app.use(express.static(path.join(__dirname, 'public')));

// Create our session store
const store = new MongoDBStore({
  uri: 'mongodb://scope:scope@ds064799.mlab.com:64799/scope-lesson-4',
  collection: 'Sessions'
})
```

* The `uri` field specifies where our URI of our Mongo instance
* The `collection` field specifies what we want to name our document used for storing sessions. In this case, `Sessions`

‎

**Creating the Session Middleware**

[express-session](https://github.com/expressjs/session) is a module that will do all the heavy-lifting related to creating our Session data on the store we also just created. Essentially, it updates/creates new sessions for users via cookies, and saves the session data on your database.

Copy and paste the following code to use the initialize the session middleware.

```JS
app.use(session({
  secret: 'keyboard cat',
  store: store,
  cookie: { secure: true },
  resave: true,
  saveUninitialized: true
}));
```

* The `secret` field is a string or array of strings used to sign the cookie (We don't have to worry about this since we aren't actually deploying our site)
* The `store` field specifies what store it will use (In this case the MongoDBStore we just created)
* The `cookie` field specifies the settings for the session cookies

We don't have to worry about the `resave` and `saveUninitialized` fields. If you want to understand more in-depth on how this works, check out the docs!



## Part 4: Setting up Passport
**Installing our dependencies**

Make sure to install the following before we get started
```
npm install --save passport passport-local
```


Next, in our `app.js` make sure to include the new dependencies we installed.

```JS
// Top of the file
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
```

‎

**Motivation**

Passport is an authentication middleware which helps you authenticate requests. In addition, Passport offers multiple methods authentication known as "Strategies". Strategies include Facebook, Google, or even Github OAuth.

Passport allows a very general way our authentication strategies (in the case we need to have multiple login buttons), which makes it easier to integrate a lot of different types of logins.

In this case we will be working with a Local Strategy with authentication involving users in our own database.

‎

**Serializing and Deserializing our users**

Before we write our login logic, Passport must have a protocol of serializing/deserializing our users into sessions (e.g. a method of compressing the user object into a single string)

In this case, the easiest method of serialization is via user id. As so, go into your `app.js` and write serialize function shown in the snippet below.

```JS
// Passport serialization
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
```

This method gets called everything passport authenticates a request, passing in the user it receives, and a callback function called `done`. Weird syntax, but bare with the framework!

The `done` callback has a signature similar to

```JS
function done(err, obj) {...}
```

Therefore, when we serialize our user correctly, we pass in `null` for the error, and the serialized user (which is the user's id) for the object.

Our deserialization code is very similar. We just need to write a function such that when given a user id, it will return the User object.

How do we do this? Well we can use what we learned from the previous lesson! Mongoose!

```JS
// Up in our imports in the top of our file
const User = require('./models/user');

...

// Back down right below our serializeUser function

// Deserialization
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(err) {
      // We use return so we don't call the callback again below
      return done(err);

      /*
      We could also do something like:
        done(err);
        return;
      */
    }

    done(null, user);
  });
});
```

Simple right? Now that that's out of the way, let's get into our login logic!

‎

**Writing our Local Login Strategy**

Strategies in Passport are defined with the following function

```JS
passport.use(strategy_type, StrategyObject)
```

In this case, our `strategy_type` will be `'local'` (could be anything honestly), and our `StrategyObject` will be using our `LocalStrategy` module that we imported above.

Let's start off with our basic strategy definition:

```JS
passport.use('local', new LocalStrategy(
  function(username, password, done) {
  }
));
```

The `LocalStrategy` module takes in a function as a parameter (hence the weird indentation) which takes in a `username` string, a `password` string, and a `done` callback with the same format as described above.

Our plan of attack is as follows:

1. Find the user associated with the username.
1. Check if the user exists, if the user doesn't exist, return an error via the `done` callback.
1. If the user does exist, check if the password matches the password hash in our database. (We can use `bcrypt` for this)

```JS
passport.use('local', new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }

      // User doesn't exist
      if (!user) {
        return done(null, false, { message: 'No User Found!' }));
      }

      // Password doesn't match
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Password does not match!' });
      }

      // Everything succeeded! Serialize the user
      return done(null, user);
    });
  }
));
```

Finally, let our app use passport
```JS
// Make sure this is below the code where the app uses express-session

app.use(passport.initialize());
app.use(passport.session());
```

## Part 4: Writing our Login Routes
**Login**

‎

**Logout**

‎

**Route Protection**

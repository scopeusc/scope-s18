# Authentication with Sessions

This lesson will add on to some of the concepts taught in Lesson 4 by adding an authentication layer to API. We will be going over Logging in with Sessions via [passport.js](http://www.passportjs.org/)

## Part 1: Setup

### Setting up the project

Inside the `lesson-5` directory, copy over your completed code and paste it into the lesson `lesson-5-skeleton` directory (But be sure **not** to replace the **views** folder as that has been updated to factor in login). We will be using this code as a starting point for learning about Authentication! 
If you weren't able to complete the code from last time, use the `lesson-5-skeleton` as the starting point.

----------

## Part 2: Updating our User model and User POST route
### We need some security

In the previous lesson, we logged in simply by passing in a username. Doesn't that mean anyone could log into anyone account? YES 😠. We also need to store a password on our Mongoose model.

‎

### Add a Password field to our User model

Go into `models/user.js`, and add a field called `password` which is **required** and is of type `String` (identical structure to the username field defined)

‎

### Updating our Create User route

First, add validation to ensure the existence of a `password` field in our request body. Write this code under the part where we check for the existence of a `username` field.

```JS
if (!username) {
  return res.status(400).send({ error: 'Username must be specified. '});
}

// WRITE YOUR PASSWORD VALIDATION HERE

// Be creative, like checking to see if the password is at least 8 characters long, etc.
```

‎

### A Lil' Cryptography Aside

Now, when we store passwords on our database, we don't want to store the plaintext password because that's bad! If a hacker manages to get in our database, they have access to all of our user's passwords.

Instead, our protocol of authentication will be to hash the user's password using a hash function known to be cryptographically secure. When we want to check if the user inputted the correct password, we will hash the input and compare it with the hash in our database.

However, we have another problem. A lot of known password hashes are saved throughout the internet in something known as a **Rainbow Table**. This makes our password hashes as susceptible to hacking as a plaintext password.

Hence, our solution is to hash our password with an additional string called a **salt**. The salt is unknown to the hacker which defends our database from a Rainbow Table attack.

Don't worry though, all this can be done for us with an npm module. Yay!

‎

### Back to updating our route

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
### Installing our dependencies

Make sure to install the following before we get started
```
npm install --save express-session connect-mongo
```

Next, in our `app.js` make sure to include the new dependencies we installed.

```JS
const express = require('express');
...
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);
```

The second dependency `connect-mongo` takes in `express-session` as a parameter, so remember to do that!

‎

### Creating the Store

The store is essentially a module that will handle all of the logic involving storing the actual Sessions in our database.

Copy and paste the following code after you initialize your app's static directory

```JS
...
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(dbUri);

// Create and link our session store
const store = new MongoDBStore({
  mongooseConnection: mongoose.connection
});
```

* The `uri` field specifies where our URI of our Mongo instance
* The `collection` field specifies what we want to name our document used for storing sessions. In this case, `Sessions`

‎

### Creating the Session Middleware

[express-session](https://github.com/expressjs/session) is a module that will do all the heavy-lifting related to creating our Session data on the store we also just created. Essentially, it updates/creates new sessions for users via cookies, and saves the session data on your database.

Copy and paste the following code to use the initialize the session middleware.

```JS
app.use(session({
  secret: 'keyboard cat',
  store: store,
  resave: true,
  saveUninitialized: true
}));
```

* The `secret` field is a string or array of strings used to sign the cookie (We don't have to worry about this since we aren't actually deploying our site)
* The `store` field specifies what store it will use (In this case the MongoDBStore we just created)

We don't have to worry about the `resave` and `saveUninitialized` fields. If you want to understand more in-depth on how this works, check out the docs!

**ALSO** remember to remove the line that says, we won't need it anymore
```JS
app.use(cookieParser());
```

## Part 4: Setting up Passport
### Installing our dependencies

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

### Motivation

Passport is an authentication middleware which helps you authenticate requests. In addition, Passport offers multiple methods authentication known as "Strategies". Strategies include Facebook, Google, or even Github OAuth.

Passport allows a very general way our authentication strategies (in the case we need to have multiple login buttons), which makes it easier to integrate a lot of different types of logins.

In this case we will be working with a Local Strategy with authentication involving users in our own database.‎

‎

### Serializing and Deserializing our users

Before we write our login logic, Passport must have a protocol of serializing/deserializing our users into sessions (e.g. a method of compressing the user object into a single string)

In this case, the easiest method of serialization is via user id. As so, go into your `app.js` and write serialize function shown in the snippet below.

Also, make sure to write this **before** we configure our routes (e.g. `app.use('/', index)`).

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

### Writing our Local Login Strategy

Strategies in Passport are defined with the following function

```JS
passport.use(strategy_type, StrategyObject)
```

In this case, our `strategy_type` will be `'local'` (could be anything honestly), and our `StrategyObject` will be using our `LocalStrategy` module that we imported above.

Let's start off with our basic strategy definition:

```JS
passport.use('local', new LocalStrategy(
  function(username, password, done) {
    ...
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
// Make sure this is below the code where the app uses express-session, and above the code where the app uses its routes

app.use(passport.initialize());
app.use(passport.session());

...

app.use('/', index);
```

## Part 5: Writing our Login Routes
### Login

Now that we have our business logic done, let's finally write our login/logout routes!

Let's first discuss the [Express routing syntax](http://expressjs.com/en/api.html#app.get.method)
```JS
router.get(url_path, callback [, callback...])
```

We've seen cases where we had to write our own callback looking like this:

```JS
router.get('/home', function (request, response) {
  // or (req, res)
  ...
})
```

However, it is possible to add a chain of callbacks/functions to call in a sequence. In this case, passport gives us a function called `passport.authenticate('strategy_type')` which we will need to call right before our own callback.

So, go into `routes/index.js`, and copy and paste the following code:

```JS
// Up in your imports
const passport = require('passport');

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).send();
});
```

Simple right?

This is a **POST** request, we pass in the `username` and `password` via the `request.body`.

In addition, in our `passport.authenticate` function we pass in `'local'` as the strategy type because that's what we defined earlier for passport.

Finally, if everything passes, we send an empty **200 OK** response stating that the login credentials were correct. If the login credentials weren't correct, `passport.authenticate` will return **401 Unauthorized** status code.

‎

### Logout

Passport also adds the following functions to the `req` object:
* `req.login` or `req.logIn`
* `req.logout` or `req.logOut`
* `req.isAuthenticated`
* `req.isUnauthenticated`

Note, we don't need to write `req.login` in our `/login` route because `passport.authenticate` does that for us.

Our logout route is also fairly simple, copy and paste the following below:

```JS
router.get('/logout', (req, res) => {
  if(req.isAuthenticated()){
    req.logout();
  }

  res.redirect('/');
});
```

Essentially we just test if the current user has a session via `req.isAuthenticated()`, if so, we'll log them out with `req.logout`. Finally, we'll send a **200 OK** response regardless. You might want to send a **400** if you weren't able to log the user out correctly, but that's very rare.

‎

### Route Protection

Now that we have a login/logout route, let's protect the **GET** route on `/home`. Specifically, we can take advantage of `req.isUnauthenticated` to tell us whether the user is logged in or not.

```JS
router.get('/home', (req, res) => {
  if(req.isUnauthenticated()) {
    res.render('error', {
      message: 'Unauthorized Access',
      error: { status: 401 },
    });
  }

  // Rest of the Route Logic
  ...
```

If the request is unauthenticated (dictated by the session cookie), we will render the error view instead.

‎

**Extra Credit**

> Using the idea of Express' callback chain, and this authentication checker, can you combine the topics to create a reusable middleware to determine if someone's logged in? Also note, that callbacks in Express can actually take in 3 parameters, `res`, `req`, and `next`. `next` is specifically a way to call the next callback in the callback chain.

If you want to see the answer, check out the code in `lesson-5-completed`.

‎

### Testing it out!

Sorry it took this long to get everything running! We had to write all of the pieces before we could actually test anything out.

Run the app with `npm start` and check it out on `localhost:3000`.

This is a modified version of the Landing Page on the previous app. First, create a user giving any set of credentials, then log them in by filling out those exact credentials on the Login panel. Upon login, you should be redirected to the Home Page again.

<img src="https://i.imgur.com/BzuXuHz.png">

To see if things are working, (if you're on Chrome) open up the Chrome Developer Tools (Shift + Cmd + C) and:

1. Click on the tab that says **Application**
1. Click on Cookies > localhost:3000
1. You should see a cookie that says `connect.sid` which is how `express-session` is storing its cookies.

<img src="https://i.imgur.com/Eg5mVkM.png">

Now you should be able to reload on `localhost:3000/home` without getting authorization errors.

Click on **Logout** and now go to [localhost:3000/home](localhost:3000/home) and suddenly you should see an error saying **Unauthorized Access 401**.

‎

### Now what the fuck is going on? (For the curious)

So you've written all these bits and pieces, but what exactly is going on behind the scenes? Let's go step-by-step on the login process:

1. You pass in your credentials to the login panel and it sends a **POST** request to the server.
1. The server redirects you to the code on `router.post('/login', ...)` which first runs `passport.authenticate('local')`
1. Seeing the key `'local'`, Passport runs the LocalStrategy on the username and password you passed in from the request (Using `request.body`).
1. Once it validates the existence of the user, and a matching password hash, it will call the `done` callback with the user, calling the `serializeUser()` function.
1. `serializeUser()` will return the user's id which will be passed into a Mongo document under the collection `sessions` and stored in the MongoStore.
    1. In addition, this Mongo document's id will be passed to the frontend as a cookie called `connect.sid`
1. Finally, it will run the callback we wrote, sending a **200 OK** request.

Don't worry if that doesn't make sense, assume we have these blackboxes of code for now that will authenticate our code and upon doing more web dev, you should slowly start to realize the cogs in the machine. I honestly finally understood everything after writing this lesson :3
\- Alex

Congratulations on creating a working login & authentication system!

## Glossary and Useful Links

* https://scotch.io/tutorials/easy-node-authentication-setup-and-local
* http://toon.io/understanding-passportjs-authentication-flow/
* http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/

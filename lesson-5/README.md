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

**Creating the Express.js project**
Make sure you are in the same directory with `package.json`. You should have `express-generator` globally installed from the previous projects.
```
express --view=ejs
```
This creates an Express application in your current directory and sets `ejs` to the default view engine. More cli options can be found at https://expressjs.com/en/starter/generator.html. For simplicity's sake, we will be using this relatively barebones configuration.

----------
## Part 2: Initializing the Session middleware and store
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


**Creating the Session Middleware**




## Part 3: Setting up Passport
**Installing our dependencies**

Make sure to install the following before we get started
```
npm install --save passport passport-local bcryptjs
```

**Motivation**

**Serializing and Deserializing our users**

**Writing our Local Strategy**

## Part 4: Writing our Login Routes
**Login**

**Logout**

**Route Protection**

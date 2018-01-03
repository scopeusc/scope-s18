# Databases (MongoDB)

This lesson will introduce you to some of the core concepts of databases such as the `CRUD` (CREATE, READ, UPDATE, DELETE) operations, NoSQL tables, and Object Modeling. We will be creating a dog adoption website!


## Part 1: Setup

**Setting up the project**
Inside the `lesson-4` directory, create a new directory called `lesson-4-<your-name>` and `cd` into it.

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
## Part 2: Introduction to Mongoose
**Benefits of Mongoose**

Although we could technically use MongoDB with its native driver (http://mongodb.github.io/node-mongodb-native/3.0/), it requires a lot of configuration and a lot of code to be written in order to perform basic operations.

Here is an example with the native driver detailing a `CREATE` operation:
```
const { MongoClient } = require('mongodb');

MongoClient.connect(url, (err, client) => {
  const db = client.db(dbName);

  // Insert a single document
  db.collection('dogs').insertOne({
       name: 'Spot',
       breed: 'French Terrier',
       age: 5,
       gender: 'female',
    },
    {
        w: 'majority',
        wtimeout: 10000,
        serializeFunctions: true,
    }, (err, r) => {
    assert.equal(null, err);
    assert.equal(1, r.insertedCount);
    client.close();
  });

// disgusting.
```
With Mongoose, it can be as simple as:
```
const mongoose = require('mongoose');
const Dog = require('../models/Dog');

mongoose.connect(url);

const dogPromise = new Dog({
    name: 'Spot',
    breed: 'French Terrier',
    age: 5,
    gender: 'female',
});

dogPromise.save()
    .then((dog) => {
        assert.equal(dog.name, 'Spot');
    })
    .catch(err => assert.equal(null, err));
```
**Schemas and Models**

In addition to Mongoose allowing us to write more user-friendly code via Promises, it also allows us to define Schemas for our objects. Schemas make our data more structured and have built-in validation for type-checking and missing fields.

An example Schema is as follows:
```
const mongoose = require('mongoose');
const dogSchema = new mongoose.Schema({
    // We can specify type like this:
    name: String,
    // Or we can specify type like this with an options Object.
    // We typically only do this if we need to specify more options
    // such as a field being required or not.
    breed: {
        type: String,
        required: true,
    },
    age: Number,
    gender: Number,
});
```
In addition to creating a `schema`, we have to create a `model` that corresponds to it. A `model` is a one-to-one mapping between a Mongoose schema and an entry in the database.

Defining a model is as simple as follows:
```
const Dog = mongoose.model('Dog', dogSchema);
module.exports = Dog;
```
The first parameter is the name of the model, which we use in performing `CRUD` operations on the database. The second parameter is the schema object which we have defined above. By calling `mongoose.model(...)`, we are explicitly telling MongoDB to create a `collection` in our database called `dogs` (it takes the first parameter, transforms it to lowercase, and pluralizes it). Whenever we perform a `CRUD` operation with `Dog`, we will only be using our `dogs` collection. We also want to export our model so that we can import it from our route code.

**Validation**

If we try to insert an erroneous document:
```
const badDogPromise = new Dog({
    name: 'Daisy',
    age: 9,
    gender: 'female',
});

badDogPromise.save()
    .then((dog) => {
        // Control flow will never hit here
    })
    .catch(err => console.log(err));
// Error: field 'breed' was marked as required!
```
Mongoose's built-in validation allows us to check whether or not our database operations were successful in our routes, and return appropriate HTTP responses.

Let's see this all in action!

----------

## Part 3: Project Setup:
**Nodemon**
Nodemon is a node module that automatically restarts your project whenever you make a change. It's really useful when you're constantly making changes to your code, as we will.

Install nodemon to your devDependencies.
```
npm install --save-dev nodemon
```
Edit your `package.json`'s start script so that it uses nodemon.
```
"scripts": {
    "start": "nodemon ./bin/www"
}
```
**Folder Configuration**

In your top-level project directory, create a folder called `models`. We will be putting all of our schemas and models inside of here and import them from code inside our `routes` folder.

**Mongoose Setup**

Install mongoose.
```
npm install --save mongoose
```
Navigate inside of `app.js` and import mongoose.
```
const mongoose = require('mongoose');
```
Now we have to connect our mongoose client with our MongoDB instance. In order to allow everyone to connect to the same database, we have created a hosted MongoDB on mLab, which is a free hosting service. You can connect to the instance by copying the following into your `app.js`.
```
mongoose.connect('mongodb://scope:scope@ds064799.mlab.com:64799/scope-lesson-4');
```
You can also change all of the `var` to `const` and functions into arrow functions if it bothers you.

## Part 4: Creating the user:
### Defining the schema
Because we are creating a social platform, we will need to store information about a user (in this case, their username and their adopted dogs). Hence, we will need to create a schema and model to correspond with the data we would like to persist in the database.

In the `models` folder, create a file called `user.js` and import Mongoose as a dependency.
```
// user.js
const mongoose = require('mongoose')
```
Let's begin to define our User schema. Mongoose supports a wide variety of different datatypes (you can read more about them at http://mongoosejs.com/docs/schematypes.html). For our username, we will use `String`.
```
const userSchema = new mongoose.Schema({
    username: String
});
```
A user also has list of adopted dogs, which will have the following:

 - name
 - imageUrl (from the dog API)
 - age
 - gender
 - birthday

Since we are working with a NoSQL database, we will not be storing data relationally (such as in SQL, for example). We will be thinking of a the User-Dogs relationship as a 'has-a' relationship, meaning that Dogs will be a property of User. Luckily for us, Mongoose supports nested schemas and arrays! Let's add the following into our User schema:
```
dogs: [{
    name: String,
    imageUrl: String,
    age: Number.
    gender: String,
    birthday: Date,
}],
```

### Handling user creation
**Editing the URL**
We want to create an API endpoint to create a user. Although `express-generate` creates a `users.js` file for you under `routes/`, we want to edit the `app.js` file to prefix its route URL with `/api`. It is good practice to prefix all of your API routes with `/api`.
```
app.use('/api/users', users)
```
**Creating the endpoint**
Since we are dealing with a `CREATE` operation, the appropriate HTTP method to use is `POST`.
```
router.post('/', (req, res) => {

});
```
For now, let's assume that the user will `POST` a body containing just a `username` field. We learned from previous lessons that we can extract this with `req.body.username`;

We can't just naively create a User; we have to check whether or not a User with such username already exists. In order to do so, we will be using the `findOne` static method on our User model. Every model compiled by Mongoose has a bunch of useful static methods, such as:

 - find
 - findOne
 - findOneAndUpdate
 - findById
 - findByIdAndRemove

The `findOne` method accepts a query (a plain JavaScript object) as its first parameter and returns a Promise.

We will also need to import our `User` model from our `models/` folder.
```
const User = require('../models/user');

router.post('/', (req, res) => {
    const user = User.findOne({ username: req.body.username });
});
```

----------

## Recommended Resources

- Mongoose CRUD reference: https://coursework.vschool.io/mongoose-crud/
- Mongoose Docs: http://mongoosejs.com/index.html
- Promise.all: https://developer.mozilla.org/enUS/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
-  ES6 Arrow Functions: https://codeburst.io/javascript-arrow-functions-for-beginners-926947fc0cdc



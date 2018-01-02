# Databases (MongoDB)

This lesson will introduce you to some of the core concepts of databases such as the `CRUD` (CREATE, READ, UPDATE, DELETE) operations, NoSQL tables, and Object Modeling. We will be creating a dog adoption website


## Part 1: Setup
**MongoDB**

MongoDB must be installed. You can verify this by typing `which mongod`.

- MongoDB can be installed with HomeBrew (https://brew.sh/): `brew install mongodb`
-  Afterwards, you will need to create the directory where the MongoDB stores its documents by typing: `mkdir -p /data/db`
- You may also have to give it the right permissions with ``sudo chown -R `id -un` /data/db``
- Open another window in your Terminal and type `mongod`. This will start the MongoDB process. Keep this open – if you close it, MongoDB will quit.
- You can now use the MongoDB shell by typing `mongo`. After typing this command, we should see in our Terminal containing the MongoDB process that we have established a connection with the database! If we think of `mongod` as the server, we can view `mongo` as the client.


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
Now we have to connect our mongoose client with our MongoDB instance. By default, MongoDB serves on `localhost:27017`. You can name your database whatever you want it to, but simplicity's sake, let's just call it "lesson4". If the database doesn't exist, MongoDB will create an empty one for you. Keep in mind that when you run your express app, you will have to have `mongod` running in another terminal.
```
mongoose.connect('mongodb://localhost:27017/lesson4');
```





----------

## Recommended Resources

- Mongoose Docs: http://mongoosejs.com/index.html



# Databases (MongoDB)

This lesson will introduce you to some of the core concepts of databases such as the `CRUD` (CREATE, READ, UPDATE, DELETE) operations, NoSQL tables, and Object Modeling. We will be creating a dog adoption website! This is relatively challenging project with many parts, so definitely don't feel afraid to ask for help.


## Part 1: Setup

**Setting up the project**

Navigate into the `lesson-4` folder. Create a Node.js project by typing the following:
```javascript
npm init
```
You should now see a `package.json` file inside your project directory.

Make sure to install Express as a dependency.
```javascript
npm install --save express
```

**Creating the Express.js project**
Make sure you are in the same directory with `package.json`. You should have `express-generator` globally installed from the previous projects.
```javascript
express --view=ejs
```
This creates an Express application in your current directory and sets `ejs` to the default view engine. More cli options can be found at https://expressjs.com/en/starter/generator.html. For simplicity's sake, we will be using this relatively barebones configuration.

----------
## Part 2: Introduction to Mongoose
**Benefits of Mongoose**

Although we could technically use MongoDB with its native driver (http://mongodb.github.io/node-mongodb-native/3.0/), it requires a lot of configuration and a lot of code to be written in order to perform basic operations.

Here is an example with the native driver detailing a `CREATE` operation:
```javascript
const { MongoClient } = require('mongodb');

MongoClient.connect(url, (err, client) => {
  const db = client.db(dbName);

  // Insert a single document
  db.collection('dogs').insertOne({
       name: 'Spot',
       breed: 'French Terrier',
       gender: 'female',
       birthday: 'Fri Aug 16 1985 00:00:00 GMT-0400 (EDT)',
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
```JS
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
```javascript
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
```javascript
const Dog = mongoose.model('Dog', dogSchema);
module.exports = Dog;
```
The first parameter is the name of the model, which we use in performing `CRUD` operations on the database. The second parameter is the schema object which we have defined above. By calling `mongoose.model(...)`, we are explicitly telling MongoDB to create a `collection` in our database called `dogs` (it takes the first parameter, transforms it to lowercase, and pluralizes it). Whenever we perform a `CRUD` operation with `Dog`, we will only be using our `dogs` collection. We also want to export our model so that we can import it from our route code.

**Validation**

If we try to insert an erroneous document:
```javascript
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
```javascript
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
```javascript
npm install --save mongoose
```
Navigate inside of `app.js` and import mongoose.
```javascript
const mongoose = require('mongoose');
```
Now we have to connect our mongoose client with our MongoDB instance. In order to allow everyone to connect to the same database, we have created a hosted MongoDB on mLab, which is a free hosting service. You can connect to the instance by copying the following into your `app.js`.
```javascript
mongoose.connect('mongodb://scope:scope@ds064799.mlab.com:64799/scope-lesson-4');
```
You can also change all of the `var` to `const` and functions into arrow functions if it bothers you.

## Part 4: Creating the user:
### Defining the schema
Because we are creating a social platform, we will need to store information about a user (in this case, their username and their adopted dogs). Hence, we will need to create a schema and model to correspond with the data we would like to persist in the database.

In the `models` folder, create a file called `user.js` and import Mongoose as a dependency.
```javascript
// user.js
const mongoose = require('mongoose')
```
Let's begin to define our User schema. Mongoose supports a wide variety of different datatypes (you can read more about them at http://mongoosejs.com/docs/schematypes.html). For our username, we will use `String`.
```javascript
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
```javascript
dogs: [{
    name: String,
    imageUrl: String,
    gender: String,
    birthday: Date,
}],
```

### Handling user creation
**Editing the URL**
We want to create an API endpoint to create a user. Although `express-generate` creates a `users.js` file for you under `routes/`, we want to edit the `app.js` file to prefix its route URL with `/api`. It is good practice to prefix all of your API routes with `/api`.
```javascript
app.use('/api/users', users)
```
**Creating the endpoint**
Since we are dealing with a `CREATE` operation, the appropriate HTTP method to use is `POST`.
```javascript
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
```javascript
const User = require('../models/user');

router.post('/', (req, res) => {
    const user = User.findOne({ username: req.body.username })
        .then(...) // find the user & save
        .then(...) // send back the user object as a response
        .catch(...);
});
```
When the promise is resolved in the `.then()`, the parameter passed into the function will be the user that is retrieved from MongoDB. **It will enter the first `.then()` even if no document was found.**

 - If the user is undefined, create a new user and call `.save()` on it and return the Promise.
 ```javascript

 if (user) {
      throw `${username} already exists.`;
}
const newUser = new User(req.body);
/*
req.body = { username: ... }
*/
return newUser.save();
// .save() returns a Promise, which we act upon in the next .then()
 ```
 - Else, throw an error. Remember that the `.catch()` will catch **any** error thrown at any point in the Promise chain.

If the user was successfully created, the user JavaScript object will be passed into the parameter of the second `.then()`, which we can then send back to the client.
```javascript
.then(user => res.status(200).send(user))
```
If you try running the application now, you'll actually be able to create a user – but you will still get errors because we haven't written created the `GET` route for `/home` in `index.js` yet!

## Part 5: Rendering the Homepage
### Dog API
The Homepage will be responsible for displaying a list of dogs which a user can adopt!
To do so, we will be using the Dog API (https://dog.ceo/dog-api/)
Specifically, we be using the `/api/breed/{breed name}/images/random` route to retrieve a random image of a dog.
Because the images retrieved can be pretty large, we'll only be retrieving seven images for right now. Let's define an array of breeds at the top of the function.
```javascript
const breeds = [
  'maltese',
  'terrier',
  'pug',
  'akita',
  'labrador',
  'shihtzu',
  'pomeranian',
];
```
### Promise.all()
*Note: This section is by nature hard to understand. If you're having trouble, don't be afraid to reach out to one of e-board.*

Although we've worked with using Promises to retrieve the results of one `fetch`, what happens if we want to retrieve a bunch of them at the same time, and execute some code when all of them have completed?

Let's think about how we can do this. Take the following code for example:
```javascript
const results = [];
for (let i = 0; i < breeds.length; i++) {
    fetch(...)
        .then(res => results.push(res))
        .catch(...);
}
return results;
```
Because Promises are asynchronous, there is no guarantee that all of the network requests will have finished when we return `results`.

What about a giant Promise chain?
```javascript
const results = [];
fetch(url_1)
    .then(res => {
        results.push(res);
        fetch(url_2).then(res => {
            results.push(res);
            fetch(url_3).then(...)
            // You get the point
        });
    })
    .catch(...);
```
*Technically* this could work, but code is extremely messy and prone to error.

That's where `Promise.all()` comes in handy.
It takes in an **array** of pending Promises and returns a **single** Promise that will be resolved when all of the pending Promises are successfully resolved. When `Promise.all()` resolves, it returns an array of results corresponding to the Promises passed in.
```javascript
const promises = [promise_1, promise_2, promise_3];
Promise.all(promises)
    .then(results => console.log(results))
    .catch(...);
// console: [result #1, result #2, result #3]
```
Let's think about what we need to do.

 1. Create an array of promises from the list of breeds.
 2. Turn the array of promises into one promise with `Promise.all()`
 3. Write the code to handle `resolving` and `rejecting` the Promise.

We can use JavaScript's built-in `.map()` method to create the array of Promises. When called on an Array, `.map()` iterates over each element and returns a brand-new Array, applying the given transformation to each element.

```javascript
// Don't forget to npm install --save node-fetch and require it at the top of your file!
const fetchPromises = breeds.map(breed => fetch(url));
```
Next, we turn this into one Promise.
```JS
Promise.all(fetchPromises)
    .then(bodies => {
        ...
    })
```
If you remember from the previous lessons, resolving a `fetch` returns the Body of the response. We need to then turn each body into JSON format.
**How?**
Create a new array of Promises and use `Promise.all()` again.
```JS
Promise.all(fetchPromises)
    .then(bodies => {
        const jsonPromises = bodies.map(body => body.json());
        return Promise.all(jsonPromises);
    })
```
Since `Promise.all()` returns a Promise itself, we have to write another `.then()`!
```JS
    .then(dogs => {
        console.log(dogs);
    })
    .catch(...);
```
If all goes well, your console should print something like this!
```
[
    {
        "status": "success",
        "message": <some-image-url>
    },
    {
        ...
    }
]
```
### Generating random data
We still need to generate information about the dogs

 - gender
 - name
 - birthday

We will be using chance.js (http://chancejs.com/) to perform our random data generation.
```
npm install --save chance
```
Back in `index.js`, add chance as a dependency, and instantiate it.
```JS
const Chance = require('chance');
const chance = new Chance();
```
The functions we are interested in are:

 - `chance.gender()`
 - `chance.birthday()`
 - `chance.name()`

In the final `.then()` of `/home` route, instead of calling `console.log()`, iterate over the array of dogs and set its `name`, `gender`, and `birthday` attributes to values generated by chance.js.
Once you are done adding these attributes to each dog in the array, call render the "home" view, and pass in the array, `dogs`, as the second parameter.

This code can be pretty tricky, so if there are errors definitely don't be afraid to put `console.log()` statements everywhere and see where errors are occurring. You can also look at the completed code for reference.

Once completed, your homepage should look something like this!
![enter image description here](https://i.imgur.com/NlG25AH.png)
Click on any of the list items to see the randomly generated dog! 🐕

## Part 6: Adoption!
If you look into the `home.ejs` file, you will see the following function attached to the "Adopt" button.
![enter image description here](https://i.imgur.com/7OCmHhN.png)
 It makes a `POST` request to `/api/users/adopt/` with a body containing the `username` and `dog`.

 Let's go ahead and write the route! Extract the data from the request body as usual.
 ```JS
 // users.js
 router.post('/adopt/', (req, res) => {
     const { username, dog } = req.body;

 });
 ```
 Since the user has already been created, we are going to be updating an existing resource.
Wait a minute – I thought update operations were supposed to handled by `PUT` requests?

**Yes and no.** If we were to write this as a `PUT`, then we would logically have to name our route URL `/api/users/` instead of `/api/users/adopt/`. However, this sacrifices clarity – how do we know exactly what the `PUT` will do? What fields should and shouldn't be modified?

  Oftentimes when we want to update specific information, we use `POST` and a more specific URL.

Anyways, let's handle the DB operations now using Mongoose's `findOneAndUpdate` method.
The first parameter is a query – the same as any `.find()`.
```JS
const query = { username };
```
The second parameter is a JavaScript object description our update request. Each key in the object represents a MongoDB Update operator (https://docs.mongodb.com/manual/reference/operator/update/) and each corresponding value is another JavaScript object describing which fields to update. Since we are adding a new dog to our user's "dogs" array, our update will look like this:
```JS
// $push appends an element to an existing array
// "dogs" is the attribute we are modifying
// "dog" is the element we are pushing to the "dogs" array
const update = { $push, { dogs: dog } };
```
The third and final parameter is the "options" object.
```JS
// this just tells Mongoose to return the new object instead of the old object upon success
const options = { new: true };
```
 Pass in these three parameters to `User.findOneAndUpdate(...)` and write a corresponding `.then()` and `.catch()`! If the parameter passed to `.then()` is undefined, return `HTTP 404`. Else if it exists, wend `HTTP 204` (Success, but no content). Send `HTTP 400` in the `.catch()`. If all is good, you should see the following when you click "Adopt":
 ![enter image description here](https://puu.sh/yYCvC/03ea0391c6.png)
 ## Part 7 Profile Page and Social Page (Challenge goal)
 ### Rendering the Profile Page
 We can now adopt dogs, but we can't see them!
 In order to do so, we will be hooking up the "Profile" link on the Navbar to the `user.ejs` template... which only means one thing – another route! Clicking on the button navigates your browser to `localhost:3000/users/<your-username>/`, hence making a `GET` request.

Inside `index.js`, write a handler for `/users/:username` and extract the username from the request parameters. We want to retrieve the user object from the DB and pass it into the render function. Use the `.findOne()` method to retrieve the user! If it exists, render the template - else throw an error! Remember that `.catch()` will handle any error thrown in the Promise chain.

![enter image description here](https://i.imgur.com/CPbV0eD.png)
### Rendering the Social Page
Since we're all using the same MongoDB instance, we can actually see **everyone's** dogs! The "Social" link on the Navbar navigates your browser to `localhost:3000/social/`, so write a route to handle the URL in `index.js`!
Don't worry, this route is *MUCH* simpler.

Since we need to retrieve all of the users, we will be using `.find()` instead of `.findOne()`, and we don't need to pass in a query either. Your code should look like this:
```JS
router.get('/social', (req, res) => {
  User.find().then(users => res.render('social', { users }));
});
```
 ![enter image description here](https://i.imgur.com/gpwUhGd.png)

Clicking on one of the list items should redirect you to their profile!

----------

## Recommended Resources

- Mongoose CRUD reference: https://coursework.vschool.io/mongoose-crud/
- Mongoose Docs: http://mongoosejs.com/index.html
- Promise.all: https://developer.mozilla.org/enUS/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
-  ES6 Arrow Functions: https://codeburst.io/javascript-arrow-functions-for-beginners-926947fc0cdc



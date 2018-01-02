# Databases (MongoDB)

This lesson will introduce you to some of the core concepts of databases such as the CRUD operations, NoSQL tables, and Object Modeling. We will be creating a dog adoption website


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
npm install
```
You should now see a `package.json` file inside your project directory.

**Creating the Express.js project**
Make sure you are in the same directory with `package.json`. You should have `express-generator` globally installed from the previous projects.
```
express --view=ejs
```
This creates an Express application in your current directory and sets `ejs` to the default view engine. More cli options can be found at https://expressjs.com/en/starter/generator.html. For simplicity's sake, we will be using this relatively barebones configuration.

**Installing Mongoose**
Although we could technically use MongoDB with its native driver (http://mongodb.github.io/node-mongodb-native/3.0/), it requires a lot of configuration and a lot of code to be written in order to perform basic operations.

Here is an example with the native driver detailing a `CREATE` operation:
```
MongoClient.connect(url, (err, client) => {
  const db = client.db(dbName);

  // Insert a single document
  db.collection('inserts').insertOne({
       name: 'Spot',
       breed: 'French Terrier',
       age: '5',
       gender: 'female',
    }, {
        w: 'majority'
      , wtimeout: 10000
      , serializeFunctions: true
    }, (err, r) => {
    assert.equal(null, err);
    assert.equal(1, r.insertedCount);
    client.close();
  });
});
// disgusting.
```
With Mongoose, it can be as simple as:
```
const dogPromise = new Dog({
    name: 'Spot',
    breed: 'French Terrier',
    age: '5',
    gender: 'female',
});

dogPromise.save()
    .then((dog) => {
        assert.equal(dog.name, 'Spot');
    })
    .catch(err => assert.equal(null, err));
```


----------


## Recommended Resources




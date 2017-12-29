# HTTP and Routes

To get a good grasp of the basic concepts of HTTP and routing, we will be creating a simplified version of a Reddit-like forum where users can get view pictures of and discuss cute puppies! The completed and skeleton code is hosted online on the Scope Github.

![enter image description here](data:image/jpeg;base64,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)

## Part 1: Setup
### Prerequisites

**MongoDB**

MongoDB must be installed. You can verify this by typing `which mongod`.

- MongoDB can be installed with HomeBrew (https://brew.sh/): `brew install mongodb`
-  Afterwards, you will need to create the directory where the MongoDB stores its documents by typing: `mkdir -p /data/db`
- You may also have to give it the right permissions with ``sudo chown -R `id -un` /data/db``
- Open another window in your Terminal and type `mongod`. This will start the MongoDB process. Keep this open – if you close it, Mongo will quit.
- You can now use the MongoDB shell by typing `mongo`

**express-generator**

Quickly bootstrap Express.js apps
```
npm install -g express-generator
```
**yarn**

The best Node.js package manager
```
npm install -g yarn
```
### Installing
**Clone the repo**
```
git clone https://github.com/scopeusc/scope_s18.git
```
**Install dependencies**
```
yarn
```
I'm not kidding this is all you have to type.

### Running the project
Make sure you are in the same directory with `package.json`.
```
yarn start
```

## Part 2: Understanding the project structure

 - bin: Holds the `www` file, whose sole purpose is to actually run your application. Don't worry about this one.
 - node_modules: Contains the source code of everything you `yarn add` or `npm install`
 - public: All of your static resources to be served are contained here
 - routes: All of your routing logic goes here (handling `POST`, `GET`, etc...)
 - views: Where your frontend views live.
 - app.js: The actual express app itself.

## Part 3: The frontpage and post views

In this project, we have already completed the frontend functionality for you and all you will be doing is writing the HTTP routes to connect the dog API to the frontend. The three files you will be modifying are:

 - `app.js`
 - `routes/index.js`
 - `routes/dogs.js`

### Making the frontpage load the dogs
Right now if you try to run the app and load the frontpage (`localhost:3001`), you will see that there are no dogs currently displayed. **Sad!** Let's fix that. Open up `routes/index.js` and you should see the following:
```
router.get('/', (req, res) => {
  return res.render('index');
});
```
When you navigate to the homepage, you are making a GET request for `localhost:3001/`, which is handled by the above function. The first parameter passed into all routing functions in express is the **path**. The second is the **callback** to be executed once this path has been resolved. We're using the arrow function syntax here – it's equivalent to `function(req, res) { ... }` .

Let's take a look at the "index" view that is rendered. Open up `views/index.pug` (pug is a templating engine that express uses to render HTML server-side. Notice this section:
```
if dogs
    each dog in dogs
        ...
else
    div
        h2 No Content :(
```
This template expects an array called "dogs" to be injected inside the template. There is second optional parameter that we can pass into `res.render`, which is a JavaScript object containing all of the local variables.

We can get this array by making a call to the api with the `fetch` module, which takes in a url as its first parameter and an optional second parameter specifying the options. Calling `fetch` without any options specified default to a `GET` request, which is perfect for us in this case!

Add this line above the render statement and reload.
```
const apiResponse = fetch(`${host}/dogs/`);
```
If you reload, you can see that nothing happened even though we launched our `GET` request. This is because of the asynchronous nature of all HTTP requests. Although we sent off a request, we rendered our template before our request completed. Instead of our desired array of dogs, `apiResponse` is actually a `Promise` – a built-in JavaScript object that can *resolve* into data.

Luckily, we can fix this by declaring our function to be `async`, and `await`-ing our fetch response. We also have to `await` the `.json()` function of the response because it takes time for the body to load. If this is confusing at first, don't worry - it'll start to make more sense as you write more and more server-side code!
```
async (req, res) => {
    const apiResponse = await fetch(...);
    const dogs = await apiResponse.json();
}
```
Now, inject this object into the render function!
```
return res.render('index', { dogs });
// shorthand: { dogs } === { 'dogs': dogs }
```

### Catching Errors

Making network requests may result in errors, so we have to surround our API request in a `try-catch`. Note that the "error" template also requires an object to be passed in.
```
try {
    ...
} catch (e) {
    return res.render('error', { error: 'Unable to retrieve dogs!' });
}
```

### Upvoting and Downvoting
Instead of a `GET` request , the Upvote will be a `POST` request and the downvote will be a `DELETE` request. Although we could technically use `POST` for both an up and a downvote, `DELETE` is more explicit in the fact that we want to "delete" a vote. If we used `POST` to handle both a down and upvote, we would also have to specify inside our request body whether or not we are upvoting or downvoting.

Navigate to `/routes/dog.js/`. In the both the `POST` and `DELETE` routes, you'll see `/:name/vote`. The colon in front of "name" specifies that name is a request parameter. We need to extract it in order to know which dog to upvote.
```
const name = req.params.name;
// OR, if you're Chad full-stack:
const { name } = req.params;
```
Using this name, we make another request to the API with the `fetch` module. This time, we have to specify the method in the options. Don't forget to declare your callback as `async` and surround your API request with a `try-catch`!
```
// POST request example
const apiResponse = await fetch(`${host}/dogs/${name}/vote`, { method: 'POST' });
```
We also want to check the status of the API request before sending a response back to the front-end (since the front-end code relies on checking the status of **our** response before changing the post score). It's also good practice to do so.
```
if (apiResponse.status === 200) {
  res.status(200).send('Succesful Upvote');
} else {
  res.status(400).send('Error');
}
```
Since the upvote and downvote share the same endpoint, rinse and repeat, but with a different HTTP method. Upvoting and downvoting should now work!
## Part 4: Comments!
### Viewing the comments page
Now that the frontpage is complete, let's work on the commenting functionality. Because we are navigating to another page, we are performing another `GET` request.If you try to click on a post, you'll see that there is no content, because the template requires a variable called "dog". We can get this by making a `GET` request to the api.

The endpoint is: `/dogs/<insert-dog-name-here>`. Don't forget to prefix the endpoint with the hostname as the other routes do. Don't forget to declare your callback as `async`, and not only `await` the `fetch` request, but also the `.json()` too. Refer back to the index route or solution code if you are having trouble.
### Posting a comment
When you "save", the front-end performs a `POST` request to our route (`router.post('/:name/comment', ...)`) and sends in a **request body** holding the contents of the comment that we must parse and send to the API. Instead of using `req.params` , we use `req.body` to parse the body. Put the following at the top of the function:
```
const { name } = req.params;
const { comment } = req.body;
```
The endpoint we will be posting to is `/dogs/<name>/comment`. Unlike downvoting and upvoting, we are posting a body, so we have to specify more options in our call to `fetch`.
```
const apiResponse =  await fetch(`${host}/dogs/${name}/comment`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ comment }),
});
```
Not only do we have to specify the HTTP method, but we also have to specify the headers and the body. `Content-Type` specifies the format of our request body, and body contains a stringified JSON of our comment.

We also want to check whether or not our `POST` to the API was successful or not.
```
if (apiResponse.status === 200) {
  res.status(200).send('Successful Post');
} else {
  res.status(400).send('Error');
}
```
Don't forget to surround everything in a `try-catch` also!

If everything is correct, you should now be able to submit comments to the server!

## Recommended Resources

 - Promises: https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-promise-27fc71e77261
 - Express Routing docs: http://expressjs.com/en/guide/routing.html



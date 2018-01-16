# HTTP and Routes

To get a good grasp of the basic concepts of HTTP and routing, we will be creating a simplified version of a Reddit-like forum where users can get view pictures of and discuss cute puppies! The completed and skeleton code is hosted online on the Scope Github.
![enter image description here](https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/20507398_493223817679381_4732876059136539753_o.jpg?oh=28f6f745e6df63cd34d401fd4dc6f098&oe=5AF9A831)
## Part 1: Setup
### Prerequisites
**node.js**
Make sure to you have the right version of Node.js
```
node -v
// -> should print 8.x
npm -v
// -> should print 5.x
```
### Installing
**Clone the repo**
```
git clone https://github.com/scopeusc/scope_s18.git
```
**Install dependencies**
```
npm install
```

### Running the project
Make sure you are in the same directory with `package.json`.
```
npm start
```


----------


## Part 2: Understanding the project structure

 - **bin**: Holds the `www` file, whose sole purpose is to actually run your application. Don't worry about this one.
 - **node_modules**: Contains the source code of everything you  `npm install`
 - **public**: All of your static resources to be served are contained here
 - **routes**: All of your routing logic goes here (handling `POST`, `GET`, etc...)
 - **views**: Where your frontend views live.
 - **app.js**: The actual express app itself.


----------


## Part 3: The frontpage and post views

In this project, we have already completed the frontend functionality for you and all you will be doing is writing the HTTP routes to connect the dog API to the frontend. The three files you will be modifying are:

 - `app.js`
 - `routes/index.js`
 - `routes/dogs.js`

### Making the frontpage load the dogs
Right now if you try to run the app and load the frontpage (`localhost:3001`), you will see that the homepage loads, but there are no posts with pictures of dogs. **Sad!** Let's fix that. Open up `routes/index.js` and you should see the following:

```JS
router.get('/', (req, res) => {
  return res.render('index');
});
```

When you navigate to the homepage, you are making a GET request for `localhost:3001/`, which is handled by the above function. The first parameter passed into all routing functions in express is the **path**. The second is the **callback** to be executed once this path has been resolved. We're using the arrow function syntax here – it's equivalent to `function(req, res) { ... }` .

Let's take a look at the "index" view that is rendered. Open up `views/index.ejs` (ejs is a templating engine that express uses to render HTML server-side). Notice the section lines 28-47.

This template expects an array called "dogs" to be injected inside the template. There is second optional parameter that we can pass into `res.render`, which is a JavaScript object containing all of the local variables. In this case, our render function expects an object like this:

```JS
{
  'dogs': [...]
}
```

We can get this array by making a call to the api with the `fetch` module, which takes in a url as its first parameter and an optional second parameter specifying the options. Calling `fetch` without any options specified default to a `GET` request, which is perfect for us in this case!

**NOTE:** Unlike JavaScript in the browser, Node.js does not natively support the `fetch` API. Thus, we require the `node-fetch` polyfill module.

Add this line above the render statement and reload.

```JS
const apiResponse = fetch(`${host}/dogs/`);
```

If you reload, you can see that nothing happened even though we launched our `GET` request. In fact, if we `console.log(apiResponse)`, we will see the following:

```JS
Promise { <pending> }
```

This is because of the asynchronous nature of all HTTP requests. Although we sent off a request, we rendered our template before our request completed. Instead of our desired array of dogs, `apiResponse` is actually a pending `Promise` – a built-in JavaScript object that can *resolve* into data.

Promises can be resolved one of two ways – they are either *resolved* or *rejected*. We always want to handle both cases. The general structure of a Promise looks like:

```JS
functionThatReturnsAPromise(...)
  .then(/* callback to be executed if resolved */)
  .then(/* another callback should we choose to do so */)
  .catch(/* error handling function which is called on rejection */);
```

Let's first handle a successful API response! Let's see what happens when we print the result.

```JS
const apiResponse = fetch(`${host}/dogs/`)
  .then(result => console.log(result));
```

Your terminal probably blew up. That makes sense because the value returned by resolving a Promise from an HTTP request is the actual body of the response itself. Instead of using `console.log`, Let's use the `.json` function to turn the result into the format we want.

```JS
...
  .then(result => result.json());
console.log(apiResponse);
// Promise { <pending> } ???????
```

But I thought using `.then()` resolves the Promise?!
It does – however, the `.json()` function is asynchronous as well, meaning that we need to chain the promise with another `.then()` function.

We don't need the entire body, we just need the JSON response, which we can get by chaining another Promise! The parameter passed into the second `.then()` should be the `dogs` variable we are looking for. Now, we have all of the data we need to render our front page!

The code should now look like this:

```JS
router.get('/', (req, res) => {
  const response = fetch(`${host}/dogs`)
    .then(result => result.json())
    .then(dogs => res.render('index', { dogs }));
});
// shorthand: { dogs } === { 'dogs': dogs }
```

### Catching Errors

Just because the page loads right now doesn't mean that it's not prone to error. If the API fails (in the case that their server goes down), the Promise will reject and the control will be redirected to whatever is in the `.catch()` block. Let's write the code to handle this case.

```JS
.then(...)
.catch(error => res.render('error', { error }));
```

We are passing in the optional second parameter because the error view expects to be passed an 'error' variable.
At this point, all of the UI should display properly on the front page!

![enter image description here](https://i.imgur.com/FCsH66v.png)
### Upvoting and Downvoting
Instead of a `GET` request , the Upvote will be a `POST` request and the downvote will be a `DELETE` request. Although we could technically use `POST` for both an up and a downvote, `DELETE` is more explicit in the fact that we want to "delete" a vote. If we used `POST` to handle both a down and upvote, we would also have to specify inside our request body whether or not we are upvoting or downvoting.

Navigate to `/routes/dog.js/`. In the both the `POST` and `DELETE` routes, you'll see `/:name/vote`. The colon in front of "name" specifies that name is a request parameter. We need to extract it in order to know which dog to upvote.

```JS
const name = req.params.name;
// OR, if you're full-stack Chad:
const { name } = req.params;
```

Using this name, we make another request to the API with the `fetch` module. This time, we have to specify the method in the options.

```JS
// POST request example
const apiResponse = fetch(`${host}/dogs/${name}/vote`, { method: 'POST' });

```
We want to check the status of the API request before sending a response back to the front-end (since the front-end code relies on checking the status of **our** response before changing the post score). We will put this login in a `.then()`

```JS
.then(result => {
  if (result.status === 200) {
    res.status(200).send('Succesful Upvote');
  } else {
    res.status(400).send('Error');
  }
});
```

Don't forget to write a `.catch()` after this block of code! Let's make it render the error page again. The full code should look something like this:

```JS
router.post(`/:name/vote`, (req, res) => {
  const { name } = req.params;
  const apiResponse = fetch(`${host}/dogs/${name}/vote`, { method: 'POST' })
    .then(result => {
      if (result.status === 200) {
        res.status(200).send('Succesful Upvote');
      } else {
        res.status(400).send('Error');
      }
    })
    .catch(error => res.render('error', { error: 'Unable to retrieve dogs! '}));
});
```

Notice that we only had one `.then()` because we weren't interested in the content of the body and didn't have to turn the API response into a JSON format.

Since the upvote and downvote share the same endpoint (public URL that exposes a part of an API), rinse and repeat, but with a different HTTP method.
Upvoting and downvoting should now work! You can reload the page to double-check.

## Part 4: Comments!

### Viewing the comments page
Now that the frontpage is complete, let's work on the commenting functionality. Because we are navigating to another page, we are performing another `GET` request.If you try to click on a post, you'll see that there is no content, because the template requires a variable called "dog". We can get this by making a `GET` request to the api.

The endpoint is: `/dogs/<insert-dog-name-here>`. Don't forget to prefix the endpoint with the hostname as the other routes do! Since we care about the JSON response, we will have to chain the `.then()` twice and use the `.json()` method. Refer back to the index route or solution code if you are having trouble.

### Posting a comment
When you "save", the front-end performs a `POST` request to our route (`router.post('/:name/comment', ...)`) and sends in a **request body** holding the contents of the comment that we must parse and send to the API. Instead of using `req.params` , we use `req.body` to parse the body. Put the following at the top of the function:

```JS
const { name } = req.params;
const { comment } = req.body;
```

The endpoint we will be posting to is `/dogs/<name>/comment`. Unlike downvoting and upvoting, we are posting a body, so we have to specify more options in our call to `fetch`.

```JS
const apiResponse =  fetch(`${host}/dogs/${name}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
})
```

Not only do we have to specify the HTTP method, but we also have to specify the headers and the body. `Content-Type` specifies the format of our request body, and body contains a stringified JSON of our comment.

We also want to check whether or not our `POST` to the API was successful or not.

```JS
if (apiResponse.status === 200) {
  res.status(200).send('Successful Post');
} else {
  res.status(400).send('Error');
}
```

Don't forget to handle errors with a `.catch()` also!

If everything is correct, you should now be able to submit comments to the server!
![](https://puu.sh/yR4G7/0a9ce40a1d.png)

## Recommended Resources

 - Promises: https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-promise-27fc71e77261
 - Express Routing: http://expressjs.com/en/guide/routing.html

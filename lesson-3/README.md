
# Lesson 3: Node Modules and APIs
## Introduction
Each file can be thought of as a module in Node.js. This can be used to separate the functionality of your program. For example, load the module **tree.js** by using this syntax you might recognize from last lesson. 
```JS
const tree = require('./tree.js');
```
You can then perform actions on the `tree` module. 
Similarly, you can include 3rd party modules and APIs using the same syntax. Using these will definitely extend the functionality of your programs.

Node has a few built-in modules that you can use without needing to require. If you want to read more about them
https://www.w3schools.com/nodejs/ref_modules.asp


## APIs and Project Setup
More specially talking about APIs now, they can be thought of as a protocol for getting information between a source and someone who wants to use it. For example in a weather API, the developer will make a request for information. 

The four common types of HTTP requests are as follows:
* **GET** - Retrieves data from the database
* **POST** - Creates information to your database
* **PUT** - Updates information to your database
* **DELETE** - Removes data from your database

### Clarifai API
Clarifai is an image and video recognition API that we are going to integrate into our project. We are going to build the backend for an program where you input a URL of an image and the webpage will display with the image and a guess for what the image is.

**Project Setup**
```
git pull
```
Copy lesson-3-skeleton and open it up in WebStorm or your text editor of choice.  

We also want to enable auto-starting for our Express application using the `nodemon` package. Nodemon watches over your files for changes and restarts the process once it detects a change. This will be incredibly useful as we begin to make more and more changes to our files.
```
# We install nodemon as a "dev-dependency" because it's not necessary for the app to run in production.

npm install --save-dev nodemon
```

We also will want to edit the "start" script in our   `package.json` to use `nodemon` instead of `node`.
```
"scripts": {
  "start": "nodemon ./bin/www"
},
```
This way, we can have hot-reloading by just typing `npm start`!

**Sign-up for Clarifai**  

 To get an API Key, sign-up for a free account.  
https://clarifai.com/developer/account/signup/

**Install Clarifai**  (cd into the lesson-3-skeleton)
  
```
npm install clarifai --save
```

Add this to the top of `index.js`
```JS
const Clarifai = require('clarifai');
```
Then add this below all the require statements. This will get your API key out of the `clarifai.json` file. We need an API key in order to make any calls to the API.
```JS
// API key
const apiKey = require('../config/clarifai.json').key;

// Initialize the API key (Fill out your API key in config/clarifai.json)
const app = new Clarifai.App({
    apiKey: apiKey
});
```
Then open the `clarifai.json` file within the `config` directory and replace with your API key which can be found at
https://clarifai.com/developer/account/keys 
When we're dealing with API keys or sensitive data, it's usually good to decouple it from your JavaScript code and keep it in a configuration file.


### Using Clarifai
If you run `npm start` and go to localhost:3000 you can see the simple front-end of **Dog or Not Dog**.  

Go to `views/index.ejs` to see the HTML for it. Here you can see that our form action redirects to `predict.ejs`.
In `predict.ejs` you can see it displays the `image` and takes in a parameter `concepts` and creates a list out of it. We will refer back to these later.

Back in `index.js` below the code your just inserted should be the `GET` request for the home page:
```JS
/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});
```
All APIs require sending a request. For this we will be making a `POST` request to the Clarifai API. Below that code insert this basic shell 
```JS
/* POST Clarifai. */
router.post('/predict', (req, res, next) => {  
 
});
```
Like most APIs, Clarifai requires input information before it can return you anything. 
Clairfai requires the url of the image that was input by the user. Insert this into the body of the request.
````JS
 const image = req.body.image;
 ````
Next we need to have the Clarifai API actually predict something. We can do this by using the `app` variable we already created. Insert this under your last line of code.
```JS
app.models.predict(Clarifai.GENERAL_MODEL, image)
  .then();
```
We pass the *GENERAL MODEL*, which is the name for their most basic model, into the request. There are other pre-trained models that are more specific or you can train your own. Learn more here:
https://www.clarifai.com/models

We must also pass the url of the `image` to the API.


Now we need get the response out of Promise returned by the  `.then()` so we can do something with it. But first lets see what the response contains.

```JS
.then(
  function(response) {
    console.log(response);
  }
);
```
Now run `npm start` and try to input an image URL into the form and see what comes out of your console.

You probably saw bunch of JSON. If you look under data and concepts you can see all the things the Clarifai model thinks are in your picture. 

Now let's do something with that JSON so we can display it on our webpage.

Replace your `console.log()` statement with 
```JS
const concepts = response.outputs[0].data.concepts;
```    
`concepts` is now an array of all the concepts the Clarifai API thinks are in your picture. 

Now that we have a list of all the concepts in our image, we need to determine if our image is a dog or not. Before looking at the code below, try to come up with your own way to determine true or false.
```JS
// If any of the tagged concepts is 'dog' then we determine that the image is a dog (Simple logic for now)
let verdict = false;
// for ... of ... is handy way to iterate over arrays in JavaScript
for (const c of concepts) {
  if (c.name === 'dog') {
    verdict = true;
    break;
  }
}
```
Now we have everything we need to render the `predict` page. The three things we need to pass are the list of concepts in our image, the image url itself so we can display it, and the verdict on whether the image is a dog.

Add this to the bottom of the `response` function.
```JS
// Render our predict page and send it the concepts array, the original image URL, and the final dog or not dog verdict
res.render('predict', { concepts, image, verdict });
```
You have now finished dealing with the response. 
Make sure to catch any potential errors by adding an error catching function after your response function.
```JS
function(err) {
// If we get an error, we render the error page with the following message
res.render('error', { message: 'Error trying to process that image. Likely a bad URL'});
}
```
The whole thing should look like this:
```JS
/* POST handle form input */
router.post('/predict', (req, res, next) => {
  const image = req.body.image;

  // Connect to the Clarifai API using the prediction feature then feed it the URL passed in through our form
  app.models.predict(Clarifai.GENERAL_MODEL, image)
      .then(
        function(response) {
          // If we get a successful response, we render the predict page 

          // Get the concepts array from the response we're given (see Clarifai API reference)
          const concepts = response.outputs[0].data.concepts;

          // If any of the tagged concepts is 'dog' then we determine that the image is a dog (Simple logic for now)
          let verdict = false;

          for (const c of concepts) {
            if (c.name === 'dog') {
              verdict = true;
              break;
            }
          }

          // Render our predict page and send it the concepts array, the original image URL, and the final dog or not dog verdict
          res.render('predict', { concepts, image, verdict });
        },
        function(err) {
          // If we get an error, we render the error page with the following message
          res.render('error', { message: 'Error trying to process that image. Likely a bad URL'});
        }
      );
});
```
**Expand on this!**

Make sure you run `npm start` and check out localhost:3000 in your browser and make sure this all works. You can try out another model and see how it changes the API's responses if you have extra time. If you do anything cool with the API tag us on Github @scopeusc.

A list of cool free public API's are listed below:
- https://github.com/toddmotto/public-apis
- https://github.com/abhishekbanthia/Public-APIs
- https://www.programmableweb.com/apis/directory

A cool one to think about: https://cloud.google.com/natural-language/



##### To learn more about Clarifai go to their docs
https://www.clarifai.com/developer/docs/



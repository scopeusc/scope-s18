# Node Modules and APIs

Each file can be thought of as a module in Node.js. This can be used to separate the functionality of your program. For example, load the module **tree.js** by using this syntax you might recognize from last lesson. 
```` 
const tree = require('./tree.js');
````
You can then perform actions on the `tree` module. 
Similarly, you can include 3rd party modules and APIs using the same syntax. Using these will definitely extend the functionality of your programs.

Node has a few built-in modules that you can use without needing to require. If you want to read more about them
[https://www.w3schools.com/nodejs/ref_modules.asp]


## APIs
More specially talking about APIs now, they can be thought of as a protocol for getting information between a source and someone who wants to use it. For example in a weather API, the developer will make a request for information. There are most commonly 2 types of HTTP requests, `GET` and `POST`. But 2 other popular ones are `PUT`, and `DELETE`, which was used in the last lesson.
// Not sure if I should explain GET AND POST here... - AP

### Clarifai API
Clarifai is an image and video recognition API that we are going to integrate into our project. We are going to build the backend for an program where you input a URL of an image and the webpage will display with the image and a guess for what the image is.

**Update Repo**
````
git pull
````
Copy lesson-3-skeleton and open it up in WebStorm or your editor of choice.  

**Sign-up for Clarifai**  

 To get an API Key, sign-up for a free account.  
[https://clarifai.com/developer/account/signup/]

**Install Clarifai**  (cd into the lesson-3-skeleton)
  
````
npm install clarifai --save
````

Add this to the top of `index.js`
````
const Clarifai = require('clarifai');
````
Then add this below all the require statements.
Replace with your API key which can be found at [https://clarifai.com/developer/account/keys]
````
// Initialize the API key
const app = new Clarifai.App({
    apiKey: 'YOUR_API_KEY_HERE' 
});
````

### Using Clarifai
If you run the webpage using `node bin/www` you can see the simple front-end of **Dog Haus**.  

Go to `views/index.ejs` to see the HTML for it. Here you can see that our form action redirects to `predict.ejs`.
In `predict.ejs` you can see it displays the `image` and takes in a parameter `concepts` and creates a list out of it. We will refer back to these later.

Back in `index.js` below the code your just inserted should be the `GET` request for the home page:
````
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
````
All APIs require sending a request. For this we will be making a `POST` request to the Clarifai API. Below that code insert this basic shell 
````
/* POST Clarifai. */
router.post('/predict', function(req, res, next) {  
 
});
````
Like most APIs, Clarifai requires input information before it can return you anything. 
Clairfai requires the url of the image that was input by the user. Insert this into the body of the request.
````
 const image = req.body.image;
 ````
Next we need to have the Clarifai API actually predict something. We can do this by using the `app` variable we already created. Insert this under your last line of code.
````
app.models.predict(Clarifai.GENERAL_MODEL, image)
  .then();
````
We pass the *GENERAL MODEL*, which is the name for their most basic model into the request. There are other pre-trained models that are more specific or you can train your own. Learn more here:
[https://www.clarifai.com/models] 

We also pass the url of the `image` to the API.


Now we need get the response out of .then() so we can do something with it.

````
.then(
  function(response) {
    console.log(response);
  }
);
````
Now run `node bin/www` and try to input an image URL into the form and see what comes out of your console.

You probably saw bunch of JSON. If you look under data and concepts you can see all the things the Clarifai model thinks are in your picture. 

Now we need to do something with that JSON so we can display it on our webpage.

Replace your `console.log()` statement with 
````
 const concepts = response.outputs[0].data.concepts;
````    
`concepts` is now an array of all the concepts the Clarifai API thinks are in your picture. Now to render the predict page, we must pass it the concepts array and the image url so we can dispaly it.

````
res.render('predict', { concepts, image });
````
Make sure to catch any potential errors by adding this after your response function.
````
     function(err) {
        console.log(err);
        res.redirect('/');
      }
````
The whole thing should look like this:
````
/* POST handle form input */
router.post('/predict', function(req, res, next) {
  const image = req.body.image;

  app.models.predict(Clarifai.GENERAL_MODEL, image)
      .then(
        function(response) {
          const concepts = response.outputs[0].data.concepts;
  
          res.render('predict', { concepts, image });
        },
        function(err) {
          console.log(err);
  
          res.redirect('/');
        }
      );
});
````
**Done with all the coding!**

So when you submit a URL to the page you should now see the image and a list of the things predicted to be in your image with a likelihood that the model is correct.


#####To learn more about Clarifai go to their docs
[https://www.clarifai.com/developer/docs/]



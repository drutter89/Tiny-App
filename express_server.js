var express = require("express");
var morgan = require('morgan')
var app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// set morgan
app.use(morgan('dev'));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {

    let newString= Math.random().toString(32).replace('0.', '');

    return newString.slice(0,6);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

  app.post("/urls", (req, res) => {
    
    let longUrl = req.body.longUrl;
    // console.log("this is testing longurl", longUrl);
    let shortUrl = generateRandomString();

    urlDatabase[shortUrl] = longUrl;
    console.log(urlDatabase);

    console.log(req.body, req.body.longUrl);  // debug statement to see POST parameters
    console.log(longUrl, shortUrl);
    // res.send("Ok");         // Respond with 'Ok' (we will replace this)
    res.redirect("/urls/" + shortUrl);

    
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
    let shortUrl = req.params.id;
    let templateVars = { shortUrl: shortUrl, longUrl: urlDatabase[shortUrl] };
    res.render("urls_show", templateVars);
  });

  // DELETE
app.post('/urls/:id/delete', function (req, res) {
  let urlToDeleteId = req.params.id;

  console.log("Testing IF WORKING", urlToDeleteId);

  delete urlDatabase[urlToDeleteId]

  res.redirect("/urls")
})

// GET THE EDIT FORM

app.get("/u/:shortURL", (req, res) => { 
  let longUrl = urlDatabase[req.params.shortURL];
  console.log("testing here",longUrl);
  res.redirect(longUrl);
});

app.get('/urls/:id/edit', function (req, res) {
  let urlToEditId = req.params.id
  let url = urlDatabase[urlToEditId]

  console.log("TESTING RIGHT HERE", urlToEditId, url);

  let templateVars = {
    shortUrl: urlToEditId,
    url: url
  }

  res.render('urls_edit', templateVars)
})

  app.post('/urls/:id', function (req, res) {
    let urlToEditId = req.params.id
    let url = urlDatabase[urlToEditId]

    
    // urlDatabase[urlToEditId] = req.body.shortUrl
    console.log(urlToEditId);

    res.redirect('/urls/' + urlToEditId)
  })

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});


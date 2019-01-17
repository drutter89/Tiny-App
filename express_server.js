var express = require("express");
var morgan = require('morgan')
var app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())
// set morgan
app.use(morgan('dev'));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function generateRandomString() {

    let newString= Math.random().toString(32).replace('0.', '');

    return newString.slice(0,6);
}

app.get('/cookies', (req, res) => {
  console.log('COOKIES', req.cookies)

  res.json(req.cookies)
})

app.get("/", (req, res) => {
 let username = req.cookies.username
 if (username) {
   let templateVars = {
     username: username
   }
   res.render("urls_index", templateVars)
 } else {
   res.render("/login")
 }
  
});

app.get("/login", (req, res) => {
  res.render("login")
})

  //remember to use req.body.username to access the username from the
  //form we are passing in _header.ejs
  app.post("/login", (req, res) => {
    console.log(req.cookies);
    res.cookie('username', req.body.username)
    res.redirect("/urls")
  });

  app.get("/urls", (req, res) => {
    let templateVars = { 
      username: req.cookies["username"],
      urls: urlDatabase 
    
    };
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
    let templateVars = {
      username: req.cookies["username"]
    }
    res.render("urls_new", templateVars);
  });

  app.get("/register", (req, res) =>{
    let templateVars = {
      email: req.cookies["email"]
    }
    res.render("urls_register", templateVars)

  });

  app.post("/register", (req, res) => {

    let email = req.body.email;
    let password = req.body.password;
    let id = generateRandomString();
    users[id] = {
      id: id, 
      email: email,
      password: password
    };
 

    res.cookie("email", req.body.email);
    res.cookie("password", req.body.password);
    console.log(users);

    res.redirect("/urls");

  });

  

  // app.get("/urls/:id", (req, res) => {
  //   let shortUrl = req.params.id;
  //   let templateVars = { shortUrl: shortUrl, longUrl: urlDatabase[shortUrl] };
  //   res.render("urls_show", templateVars);
  // });

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

app.get('/urls/:id/', function (req, res) {
  let urlToEditId = req.params.id;
  let url = urlDatabase[urlToEditId];


  console.log("TESTING RIGHT HERE", urlToEditId, url);

  let templateVars = {
    shortUrl: urlToEditId,
    url: url, 
    username: req.cookies["username"]
  }
  console.log("URL", url);
  res.render('urls_show', templateVars)
})

  app.post('/urls/:id', function (req, res) {
    let urlToEditId = req.params.id
    urlDatabase[urlToEditId] = req.body.newUrl
    let templateVars = {
      username: req.cookies["username"]
    }

    
    console.log("CHECKING IF THIS IS THE URL I WANT TO REPLACE", urlToEditId);

    res.redirect(`/urls/${urlToEditId}`, templateVars)
  })

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('username', req.body.username)
    res.redirect('/urls')
  });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});


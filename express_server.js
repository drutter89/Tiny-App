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
    "b2xVn2": {
      userID: "userRandomID",
      url: "http://www.lighthouselabs.ca"
    },
    "9sm5xK": {
      userID: "user2RandomID",
      url: "http://www.google.com"
    },
    "8ul5hU": {
      userID: "User3RandomID",
      url: "http://www.facebook.com"
    }
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
   res.redirect("/urls")
 }
  
});

app.get("/login", (req, res) => {
  res.render("urls_login")
})

  //remember to use req.body.username to access the username from the
  //form we are passing in _header.ejs
  app.post("/login", (req, res) => {
    // loop through the object to find the match for the email fist 
    let userExists = false;
    let email = req.body.email;
    let password = req.body.password;
    let userfromDb= {};

    if (!email || !password){
      res.status(403).send('EMAIL OR PASSWORD IS EMPTY');
    } else {
      // userExists = true;

      for (userKey in users){
        let user = users[userKey];

        if (user.email == email && user.password == password){
          console.log("Found Email");
          console.log("Found Password");
          res.cookie("user_id", user.id);
          res.redirect("/")

        }
  
      }
      res.redirect("/urls");
    }



    // //


    // console.log(req.cookies);
    // res.cookie('username', req.body.username)
    // res.redirect("/urls")
  
  });
  
  app.get("/urls", (req, res) => {  //change how we get cookie here
    let userID = req.cookies.user_id

    let username = undefined;
    if (userID){
      username = users[userID].email;
    }

    let templateVars = { 
      username: username, //here we are grabbing the key id of the user to pass through the object to access their email
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
    let username = req.cookies.user_id;

    let templateVars = {
      username: req.cookies["username"]
    }
    if(!username){
      res.redirect("/login");
    }
    res.render("urls_new", templateVars);
  });

  app.get("/register", (req, res) =>{
    let templateVars = users;
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
 

    res.cookie("user_id", id);
    console.log(users);

    if (!(password || !semail)){
      res.send(404);
    } else{

    res.redirect("/urls");
    }

  });

  

  // app.get("/urls/:id", (req, res) => {
  //   let shortUrl = req.params.id;
  //   let templateVars = { shortUrl: shortUrl, longUrl: urlDatabase[shortUrl] };
  //   res.render("urls_show", templateVars);
  // });

  // DELETE
app.post('/urls/:id/delete', function (req, res) {
  let urlToDeleteId = req.params.id;
  let user = req.cookies.user_id;
  let urlObj = urlDatabase[urlToDeleteId];
  let ownerID = urlObj["userID"];

  if (user == ownerID){
  
  console.log("Testing IF WORKING", urlToDeleteId);

  delete urlDatabase[urlToDeleteId]

  res.redirect("/urls")
  }else{
    res.redirect("/login")
  }
})

app.post('/urls/:id', function (req, res) {
  let urlToEditId = req.params.id;
  let user = req.cookies.user_id;
  let urlObj = urlDatabase[urlToEditId];
  urlDatabase[urlToEditId] = req.body.newUrl
  let templateVars = {
    username: req.cookies["username"]
  }


app.get("/u/:shortURL", (req, res) => { 
  let longUrl = urlDatabase[req.params.shortURL];
  console.log("testing here",longUrl);
  res.redirect(longUrl);
});

// GET THE EDIT FORM

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



    
    console.log("CHECKING IF THIS IS THE URL I WANT TO REPLACE", urlToEditId);

    res.redirect(`/urls/${urlToEditId}`, templateVars)
  })

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
  });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});


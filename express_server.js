var express = require("express");
var morgan = require('morgan')
var app = express();
const PORT = 8080;



const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())
// set morgan
app.use(morgan('dev'));

app.use(cookieSession({
  name: 'session',
  keys: ['Tiny App'],
 
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
  // console.log('COOKIES', req.cookies)

  res.json(req.cookies)
})

app.get("/", (req, res) => {
 let username = req.session.username
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

      for (let userKey in users){
        let user = users[userKey];
  
        // console.log("user", users[userKey]);
        // console.log("email: THIS SHOULD BE THE LOG IN EMAIL", users[userKey].email);
        // console.log("THIS IS THE USER ID", user);
        // console.log(email); //console log the values of the emails 

        if (user.email == email && bcrypt.compareSync(password, user.password)){
          console.log("Found Email");
          console.log("Found Password");
          req.session.user_id = user.id;

          res.redirect("/")

        }
  
      }
      res.redirect("/urls");
    }



    


 
  
  });
  
  app.get("/urls", (req, res) => {  //change how we get cookie here
    let userID = req.session.user_id;
    let email = req.session.email;

    let username = undefined;
    if (userID){
      username = users[userID].email;
    }

    let templateVars = { 
      username: username, //here we are grabbing the key id of the user to pass through the object to access their email
      urls: urlsForUser(userID) 
    
    };
    res.render("urls_index", templateVars);
  });

  function urlsForUser(userID) {
    //returns the subset of the URL database that belongs to the user with ID id

    let urlsForThatUser = {};

    // over the loop, push to urlsforthatuser
    for (urlID in urlDatabase){
  
      let userIdForUrl = urlDatabase[urlID].userID;

      if(userIdForUrl == userID){
        // urlsForThatUser.push(url.user_id);
        urlsForThatUser[urlID] = {
          userID: urlDatabase[urlID].userID,
          url: urlDatabase[urlID].url
    
        };
      }

    }

    return urlsForThatUser

  }

  app.post("/urls", (req, res) => {
    let userID = req.sessions.user_id;
    
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
    let username = req.session.user_id;

    let templateVars = {
      username: req.session["username"]
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
    let hashedPassword = bcrypt.hashSync(password, saltRounds);
    let id = generateRandomString();
    users[id] = {
      id: id, 
      email: email,
      password: hashedPassword
    };
 

    req.session.user_id = id;
    
    // console.log(users);

    if (!(password || !semail)){
      res.send(404);
    } else{

    res.redirect("/urls");
    }

  });


  // DELETE
app.post('/urls/:id/delete', function (req, res) {
  let urlToDeleteId = req.params.id;
  let user = req.session.user_id;
  let urlObj = urlDatabase[urlToDeleteId];
  let ownerID = urlObj["userID"];

  if (user == ownerID){
  
  // console.log("Testing IF WORKING", urlToDeleteId);

  delete urlDatabase[urlToDeleteId]

  res.redirect("/urls")
  }else{
    res.redirect("/login")
  }
})





app.get("/u/:shortURL", (req, res) => { 
  let longUrl = urlDatabase[req.params.shortURL];
  console.log("testing here",longUrl);
  res.redirect(longUrl);
});

// GET THE EDIT FORM

app.get('/urls/:id/', function (req, res) {
  let urlToEditId = req.params.id;
  let url = urlDatabase[urlToEditId].url;


  console.log("TESTING RIGHT HERE", urlToEditId, url);

  let templateVars = {
    shortUrl: urlToEditId,
    url: url, 
    username: req.session["username"]
  }
  console.log("URL", url);
  res.render('urls_show', templateVars)
})

app.post('/urls/:id', function (req, res) {
  let urlToEditId = req.params.id;
  let user = req.session.user_id;
  let urlObj = urlDatabase[urlToEditId];
  let ownerID = urlObj["userID"];

  if( user == ownerID){

    console.log("CHECKING IF THIS IS THE URL I WANT TO REPLACE", urlToEditId);
    urlDatabase[urlToEditId].url = req.body.newUrl;

    res.redirect(`/urls/${urlToEditId}`);

  }else{
    res.status(404).send("You think you can just edit links around here? ONLY KANYE EDITS LINKS AROUND HERE.....please just log in first.");
  }
    
    
  })




  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/urls');
  });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});


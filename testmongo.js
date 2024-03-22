const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");
// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://testUser12345:acoolpassword@cluster0.o8040xd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// routes will go here
// Default route:
app.post('/login', async function(req,res){
  console.log("login: "+req.body);
  const {userID, userPass} = req.body;
  const mongoC = new MongoClient(uri);
  try{
    await mongoC.connect();
    const conn = mongoC.db("DbexpoAssignment");
    const connectCollection = conn.collection('hearty');

    const loginUser = await connectCollection.findOne({userID,userPass});

    if(loginUser){
      res.cookie(userID, Date.now(), {maxAge: 60000});
      console.log("User successfully logged in and cookie has been created: ", userID);
      res.sendFile(__dirname + '/Homepage.html')

    }
    else{
      res.send('Login attempt failed. <br><br> <a href="/">Click to go back to default</a>');
    }
  }catch(error){
    console.error("Failed to Login", error);
    res.status(500).send("Failed to Login");
  }finally{
    await mongoC.close();
  }
});

app.post('/register',async function(req,res){
  const {userID, userPass} = req.body;
  const mongoC = new MongoClient(uri);
  try{
    await mongoC.connect();
    const conn = mongoC.db("DbexpoAssignment");
    const connectCollection = conn.collection('hearty');

    await connectCollection.insertOne({userID, userPass});
    console.log("Registration successful", userID);

    res.redirect('/login.html');
  }catch(error){
    console.error("Registration Failed", error);
    res.status(500).send("Failed to Register");
  }finally{
    await mongoC.close;
  }
});

//route for registration
app.get('/register.html', function(req,res){
  res.sendFile(__dirname + '/register.html');
});

//route for default
app.get('/', function(req,res){
  res.sendFile(__dirname + "/register.html")
})

//route for login screen
app.get('/login.html', function(req,res){
  res.sendFile(__dirname + "/login.html")
});

app.get('/show-me-my-cookies', function(req,res) {
  const everyCookie = req.cookie;
  let cookiesLeave = "";

  for (const cookie in everyCookie) {
    if (everyCookie.hasOwnProperty(cookie)) {
      cookiesLeave += `${cookie}: ${everyCookie[cookie]} <br>`;
    }
  }
  cookiesLeave = '<br> <a href="/Homepage.html">Go back to home page</a> <br><br> <a href="/eat-all-cookies">Eat Cookies</a>';
  res.send(cookiesLeave);
});

app.get('/eat-all-cookies', function(req,res){
  const everyCookie = req.cookie;

  if(Object.keys(everyCookie).length>0){
    for (const cookie in everyCookie){
      res.clearCookie(cookie);
    }
    res.send('Successfully ate all cookies num num. <a href="/">Back to Default Page</a><br><br><a href="/show-me-my-cookies">Show me the cookies</a>');
  }
  else{
    res.send('Could not eat all cookies :( . <a href="/"> Back to Default Page </a><br><br><a href="/show-me-my-cookies">Show me the cookies</a>')
  }
});

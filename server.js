const Sequelize = require('sequelize')
const express = require('express')
const app = express()
const port = 3000


//JWT AUTH
const jwt = require('jsonwebtoken')



var db = require('./models')
const petModel = require('./models/pet')
const userModel = require('./models/user')


const Pet = petModel(db.sequelize,Sequelize)
const User = userModel(db.sequelize,Sequelize)



//connection
db.sequelize.sync({alter:true}).then(function(){
    app.listen(port, function () {
        console.log('listening to port ' + port)
    })
})





var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


//ajouter pet
app.get('/addpet', verifyToken, function (req, res) {
    //verify then do all that
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
          res.sendStatus(403);
        } else {
        //   res.json({
        //     message: 'Post created...',
        //     authData
        //   });


        var pet = Pet.build({
            name: req.query.name,
            age: req.query.age,
            sexe: req.query.sexe,
            description: req.query.description,
            breed: req.query.breed,
            type: req.query.type,
            size: req.query.size,
            sexe: req.query.sexe,
            photo: req.query.photo
        })
        pet.save()
        res.send('insertion avec succee')


        }
      });
})






//show all
app.get('/showallpets', verifyToken, function(req, res){

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
          res.sendStatus(403);
        } else {
            Pet.findAll().then(pets => res.json(pets))
        }
      });
    
})


app.get('/showpetbyid', verifyToken, function(req, res){
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
          res.sendStatus(403);
        } else {
            //here goes the protected code
            var id = req.query.id
            Pet.findById(id).then(pet => res.json(pet),console.log(id))
        }
      });
    
})

//LOGIN
app.post('/login', function(req, res){
    console.log(req.body.email)
    User.find({
        where: {
          email: req.body.email,
          password: req.body.password
        }
      }).then(user => 
        jwt.sign({user}, 'secretkey', (err, token) => {
        res.json({
          token
        });
      }))


      
})


//Verify the JWT before any protected route
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;
      // Next middleware
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
  }



app.get('/', function (req, res) {
    res.json({ 'title': 'my route test branch sahbi' })
})



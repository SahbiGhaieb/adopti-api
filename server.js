const Sequelize = require('sequelize')
const express = require('express')
const app = express()
const port = 3000




//multer for files/images
const multer = require('multer')
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

//with cloudinary
cloudinary.config({
  cloud_name: 'adopti',
  api_key: '941153729347347',
  api_secret: 'nKJ-fXnqXB5yzfuWdrHzZe7J36k'
  })
  const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
  });
  const upload = multer({ storage: storage });

// const storage = multer.diskStorage({
//   destination: function(req, file, cb){
//     cb(null, './uploads/')
//   },
//   filename: function(req, file, cb){
//     cb(null, file.originalname)
//   }
// })
// const fileFilter= (req, file, cb) => {
//   if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
//     cb(null, true)
//   }else{
//     cb(null, false)
//   }
// }
// const upload = multer({storage: storage, fileFilter:fileFilter})



//JWT AUTH
const jwt = require('jsonwebtoken')


//MODELS
var db = require('./models')
const petModel = require('./models/pet')
const userModel = require('./models/user')




const Pet = petModel(db.sequelize,Sequelize)
const User = userModel(db.sequelize,Sequelize)



Pet.belongsTo(User);




//connection
db.sequelize.sync({alter:true}).then(function(){
    app.listen(port, function () {
        console.log('listening to port ' + port)
    })
})





var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


//signUp
app.post('/signUp', upload.single('photo'), (req, res)=>{
  var user = User.build ({
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      email : req.body.email,
      photo : req.file.url,
      num_tel : req.body.num_tel,
      password : req.body.password
  })
  user.save()
    jwt.sign({user}, 'secretkey', (err, token) => {
    res.json({
      user:user,
      token
    });
    console.log(token)
  console.log('user creé avec succée')
})

})
//ajouter pet
app.post('/addpet', upload.single('petImage'),verifyToken, function (req, res) {
    //verify then do all that
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
          res.sendStatus(403);
        } else {
        var user = jwt.decode(req.token,'secretkey').user
        //console.log(user.id)

        var pet = Pet.create({
            name: req.body.name,
            age: req.body.age,
            description: req.body.description,
            breed: req.body.breed,
            type: req.body.type,
            size: req.body.size,
            sexe: req.body.sexe,
            photo: req.file.url,
            UserId: user.id
        })
        //console.log(pet)
        //pet.save()
        res.send('insertion avec succee')


        }
      })
})





//show all
app.get('/showallpets', verifyToken, function(req, res){

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
          res.sendStatus(403);
        } else {
          var user = jwt.decode(req.token,'secretkey').user
            Pet.findAll({
              include: [{ model: User}]
           }).then(pets => res.json(pets))
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
          user:user,
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



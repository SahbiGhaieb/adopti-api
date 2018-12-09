const Sequelize = require('sequelize')
const express = require('express')
const app = express()
const port = 3000
const path = require('path')



//multer for files/images
const multer = require('multer')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))



const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/')
  },
  filename: function(req, file, cb){
    cb(null, file.originalname)
  }
})
const fileFilter= (req, file, cb) => {
  if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
    cb(null, true)
  }else{
    cb(null, false)
  }
}
const upload = multer({storage: storage})



//JWT AUTH
const jwt = require('jsonwebtoken')


//MODELS
var db = require('./models')
const petModel = require('./models/pet')
const userModel = require('./models/user')




const Pet = petModel(db.sequelize, Sequelize)
const User = userModel(db.sequelize, Sequelize)
User.belongsToMany(User, { as: "Follower", foreignKey: "FollowerId", through: "Follower_Followeds" })
User.belongsToMany(User, { as: "Followed", foreignKey: "FollowedId", through: "Follower_Followeds" })


Pet.belongsTo(User);




//connection
db.sequelize.sync({ alter: true }).then(function () {
  app.listen(port, function () {
    console.log('listening to port ' + port)
  })
})





var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies




//follower_Following
app.post('/follow', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var userOnline = jwt.decode(req.token, 'secretkey').user
      User.findByPk(req.body.id).then(user =>
        //res.send(user)
        user.addFollowed(userOnline.id).then(res.send('followed'))
      )
      //res.send(user.firstName)

      // .then(user => 
      //   user.addFollower(userOnline),
      //   res.send('followed user'+ user.firstName)
      //   )


    }
  })
})
//showFollowers
app.post('/showFollowing', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var userOnline = jwt.decode(req.token, 'secretkey').user
      User.findByPk(req.body.id).then(user =>
        user.getFollowed().then(followers =>
          res.send(followers)
        )
      )
    }
  })
})
//showFollowing
app.post('/showFollowers', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var userOnline = jwt.decode(req.token, 'secretkey').user
      User.findByPk(req.body.id).then(user =>
        user.getFollower().then(followings =>
          res.send(followings)
        )
      )
    }
  })
})


//signUp
app.post('/signUp', upload.single('photo'), (req, res) => {
  var user = User.build({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    photo: 'http://192.168.1.2:3000/uploads/'+req.file.originalname,
    num_tel: req.body.num_tel,
    password: req.body.password
  })
  user.save()
  jwt.sign({ user }, 'secretkey', (err, token) => {
    res.json({
      user: user,
      token
    });
    console.log(token)
    console.log('user creé avec succée')
  })

})
//ajouter pet
app.post('/addpet', upload.single('petImage'), verifyToken, function (req, res) {
  //verify then do all that
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var user = jwt.decode(req.token, 'secretkey').user
      //console.log(user.id)

      var pet = Pet.create({
        name: req.body.name,
        age: req.body.age,
        description: req.body.description,
        breed: req.body.breed,
        type: req.body.type,
        size: req.body.size,
        sexe: req.body.sexe,
        photo: 'http://192.168.1.2:3000/uploads/'+req.file.filename,
        UserId: user.id
      })
      //console.log(pet)
      //pet.save()
      res.send('insertion avec succee')


    }
  })
})





//show all
app.get('/showallpets', verifyToken, function (req, res) {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var user = jwt.decode(req.token, 'secretkey').user
      Pet.findAll({
        include: [{ model: User }]
      }).then(pets => res.json(pets))
    }
  });

})
//show my pets
app.get('/showMyPets', verifyToken, function (req, res) {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //here goes the protected code
      //var id = req.query.id
      var id = jwt.decode(req.token, 'secretkey').user.id
      //console.log(user.id)
      Pet.findAll({ where: { userId: id }, include: [{ model: User }] }).then(pet => res.json(pet))
    }
  });

})
//show specific pet
app.get('/showpetbyid', verifyToken, function (req, res) {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //here goes the protected code
      var id = req.query.id
      Pet.findById(id).then(pet => res.json(pet), console.log(id))
    }
  });

})


//update Profile
app.post('/update', verifyToken, upload.single('photo'), function (req, res) {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //console.log(req.headers.authorization)
      //here goes the protected code
      var id = jwt.decode(req.token, 'secretkey').user.id
      User.update(
        // Values to update
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          photo: 'http://192.168.1.2:3000/uploads/'+req.file.originalname,
          num_tel: req.body.num_tel,
          password: req.body.password
        },
        { // Clause
          where:
          {
            id: id
          }
        }
      ).then(count => {
        //res.json(user)
        res.send('Rows updated ' + count);
      });
    }
  })
})


//LOGIN
app.post('/login', function (req, res) {
  console.log(req.body.email)
  User.findOne({
    where: {
      email: req.body.email,
      password: req.body.password
    }
  }).then(user =>
    jwt.sign({ user }, 'secretkey', (err, token) => {
      res.json({
        user: user,
        token
      });
    }))


})


//Verify the JWT before any protected route
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
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



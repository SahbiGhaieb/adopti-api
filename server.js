const Sequelize = require("sequelize");
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

//multer for files/images
const multer = require("multer");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage });

//JWT AUTH
const jwt = require("jsonwebtoken");

//MODELS
var db = require("./models");
const petModel = require("./models/pet");
const userModel = require("./models/user");

const Pet = petModel(db.sequelize, Sequelize);
const User = userModel(db.sequelize, Sequelize);
User.belongsToMany(User, {
  as: "Follower",
  foreignKey: "FollowerId",
  through: "Follower_Followeds"
});
User.belongsToMany(User, {
  as: "Followed",
  foreignKey: "FollowedId",
  through: "Follower_Followeds"
});

Pet.belongsTo(User);

//connection
db.sequelize.sync({ alter: true }).then(function() {
  app.listen(port, function() {
    console.log("listening to port " + port);
  });
});

var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//follow
app.post("/follow/:id", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
var id = req.params.id;
  User.findByPk(req.body.id).then(user =>
    //res.send(user)
    user.addFollowed(id).then(res.send("followed"))
  );

}
});
});
//Unfollow
app.post("/unfollow/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
var id = req.params.id;

  User.findByPk(req.body.id).then(user =>
    //res.send(user)
    user.removeFollowed(id).then(res.send("unfollowed"))
  );
}
});
});

//showFollower
app.post("/showFollowers", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
  User.findByPk(req.body.id).then(user =>
    user.getFollowed().then(followers => res.send(followers))
  );
}

});
});

//showFollowing
app.post("/showFollowing", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
  User.findByPk(req.body.id).then(user =>
    user.getFollower().then(followings => res.send(followings))
  );
  }
});
});
//signUp
app.post("/signUp", upload.single("photo"), (req, res) => {
  var user = User.build({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    photo: req.file.originalname,
    num_tel: req.body.num_tel,
    password: req.body.password
  });
  user.save();
  jwt.sign({ user }, "secretkey", (err, token) => {
    res.json({
      user: user,
      token
    });
    //console.log(token)
    console.log("user creé avec succée");
  });
});
//ajouter pet
app.post("/addpet", upload.single("petImage"), verifyToken, function(req, res) {
  //verify then do all that
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var user = jwt.decode(req.token, "secretkey").user;
      //console.log(user.id)

      var long = parseFloat(req.body.longitude);
      var lat = parseFloat(req.body.altitude);

      var pet = Pet.create({
        name: req.body.name,
        age: req.body.age,
        longitude: long,
        altitude: lat,
        description: req.body.description,
        breed: req.body.breed,
        type: req.body.type,
        size: req.body.size,
        sexe: req.body.sexe,
        photo: req.file.filename,
        UserId: user.id
      });
      //console.log(pet)
      //pet.save()
      res.send("insertion avec succee");
    }
  });
});

//get pets by type

app.get("/getpets/:type", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    var type = req.params.type;

    Pet.findAll({
      where: { type: type },
      include: [{ model: User }]
    }).then(pet => res.json(pet));
  });
});

//Update pet
app.post("/updatepet", upload.single("petImage"), verifyToken, function(
  req,
  res
) {
  //verify then do all that
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var user = jwt.decode(req.token, "secretkey").user;
      //console.log(user.id)

      Pet.update(
        // Values to update
        {
          name: req.body.name,
          age: req.body.age,
          description: req.body.description,
          breed: req.body.breed,
          type: req.body.type,
          size: req.body.size,
          sexe: req.body.sexe,
          photo: req.file.filename,
          UserId: user.id
        },
        {
          // Clause
          where: {
            id: id
          }
        }
      ).then(count => {
        //res.json(user)
        res.send("Rows updated " + count);
      });
    }
  });
});
//Delete pet
app.post("/deletepet", verifyToken, function(req, res) {
  //verify then do all that
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var user = jwt.decode(req.token, "secretkey").user;
      Pet.destroy({
        where: {
          id: req.body.id
        }
      });
      res.send("PET deleted");
    }
  });
});

//uploadIlmage
app.get("/uploads/:upload", function(req, res) {
  file = req.params.upload;
  console.log(req.params.upload);
  var img = fs.readFileSync(__dirname + "/uploads/" + file);
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(img, "binary");
});

//show all
app.get("/showallpets", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var user = jwt.decode(req.token, "secretkey").user;
      Pet.findAll({
        include: [{ model: User }]
      }).then(pets => res.json(pets));
    }
  });
});
//show my pets
app.get("/showMyPets", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //here goes the protected code
      //var id = req.query.id
      var id = jwt.decode(req.token, "secretkey").user.id;
      //console.log(user.id)
      Pet.findAll({ where: { userId: id }, include: [{ model: User }] }).then(
        pet => res.json(pet)
      );
    }
  });
});
//show specific pet
app.get("/showpetbyid", verifyToken, function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //here goes the protected code
      var id = req.query.id;
      Pet.findById(id).then(pet => res.json(pet), console.log(id));
    }
  });
});

//update Profile
app.post("/update", verifyToken, upload.single("photo"), function(req, res) {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //console.log(req.headers.authorization)
      //here goes the protected code
      var id = jwt.decode(req.token, "secretkey").user.id;
      User.update(
        // Values to update
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          photo: req.file.originalname,
          num_tel: req.body.num_tel,
          password: req.body.password
        },
        {
          // Clause
          where: {
            id: id
          }
        }
      ).then(count => {
        //res.json(user)
        res.send("Rows updated " + count);
      });
    }
  });
});

//LOGIN
app.post("/login", function(req, res) {
  console.log(req.body.email);
  User.findOne({
    where: {
      email: req.body.email,
      password: req.body.password
    }
  }).then(user =>
    jwt.sign({ user }, "secretkey", (err, token) => {
      res.json({
        user: user,
        token
      });
      console.log({
        user: user,
        token
      });
    })
  );
});

//Verify the JWT before any protected route
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
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

//PETS FILTERS
app.get("/getpet/:id", function(req, res) {
  // let sql = `SELECT * FROM pets WHERE id = ${req.params.id}`;
  // let query = dbi.query(sql, (err, result) => {
  //     if(err) throw err;
  //
  //     res.json(result);
  // });

  var id = req.params.id;

  Pet.findOne({
    where: { id: id },
    include: [{ model: User }]
  }).then(pet => res.json(pet));
});

app.get("/getpets/:type", function(req, res) {
  // let sql = `SELECT * FROM pets WHERE id = ${req.params.id}`;
  // let query = dbi.query(sql, (err, result) => {
  //     if(err) throw err;
  //
  //     res.json(result);
  // });

  var type = req.params.type;

  Pet.findAll({
    where: { type: type },
    include: [{ model: User }]
  }).then(pet => res.json(pet));
});

// app.get('/getpets/:type', function (req, res) {
//   // let sql = `SELECT * FROM pets WHERE id = ${req.params.id}`;
//   // let query = dbi.query(sql, (err, result) => {
//   //     if(err) throw err;
//   //
//   //     res.json(result);
//   // });

//   var type = req.params.type;

//   Pet.findAll({
//     where: { type: type },
//     include: [{ model: User }]
//   }).then(pet => res.json(pet))
// });

app.get("/getPetsByUser/:UserId", function(req, res) {
  var UserId = req.params.UserId;

  Pet.findAll({
    where: { UserId: UserId },
    include: [{ model: User }]
  }).then(pet => res.json(pet));
});

//END PETS FILTERS
app.get("/", function(req, res) {
  res.json({ title: "my route test branch sahbi" });
});

/////show all users
app.get("/showallusers", function(req, res) {
	
  User.findAll().then(users => res.json(users));
});

app.get('/getuser/:id', function(req, res) {
   

    var id = req.params.id ;

    User.findById(id).then(pet => res.json(pet))
});


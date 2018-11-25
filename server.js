const Sequelize = require('sequelize')
const express = require('express')
const app = express()
const port = 3000

var db = require('./models')
const petModel = require('./models/pet')
const userModel = require('./models/user')
const Pet = petModel(db.sequelize,Sequelize)
const User = userModel(db.sequelize,Sequelize)



//connection
db.sequelize.sync().then(function(){
    app.listen(port, function () {
        console.log('listening to port ' + port)
    })
})





var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies



app.get('/addpet', function (req, res) {
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
})



app.get('/showallpets', function(req, res){
    Pet.findAll().then(pets => res.json(pets))
})


app.get('/showpetbyid',function(req, res){
    var id = req.query.id
    Pet.findById(id).then(pet => res.json(pet),console.log(id))
    
})



app.get('/', function (req, res) {
    res.json({ 'title': 'my route' })
})



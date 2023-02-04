const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt')
const app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const multer = require('multer');
const { resourceLimits } = require("worker_threads");
const port = 9002;

mongoose.connect('mongodb://localhost/AttendanceDatabase', { useNewUrlParser: true, useUnifiedTopology: true })




const contactUsSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
});
const Contact = mongoose.model('Contact', contactUsSchema);

const addTripSchema = new mongoose.Schema({
    name: String,
    city: String,
    email: String,
    phone: String,
    image: String,
});
const Trip = mongoose.model('Trip', addTripSchema)

//Express Specific Stuff 
app.use('/static', express.static('static'));
app.use(express.urlencoded());

//PUG SPECIFIC STUFF
app.set('view engine', 'pug') //set the View/templet directory
app.set('views', path.join(__dirname, 'views')) //set the View/templet directory

//END POINTS
app.get('/', (req, res) => {
    res.status(200).render('index.pug');
});

app.get('/adminLoginPage', (req, res) => {
    res.status(200).render('adminloginpage.pug');
});

app.get('/addTrip', (req, res) => {
    res.status(200).render('addTrip.pug');
});

const Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './static/upload');
    },

    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});

const upload = multer({
    storage: Storage
});

app.post('/contact', (req, res) => {
    var myData = new Contact({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    });

    myData.save(function(err, doc) {
        if (err) {
            res.json(err);
        } else if (doc) {
            res.send("Successfully");
        }
    });
});

app.post('/storeNewTrip', upload.single('file'), (req, res) => {
    var myTrip = new Trip({
        name: req.body.name,
        city: req.body.city,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    myTrip.save(function(err, doc) {
        if (err) {
            res.json(err);
        } else if (doc) {
            res.send("Successfully");
        }
    });
});



app.post('/adminLogin', (req, res) => {
    var em = req.body.email;
    var pass = req.body.password;
    if (em == 'devanshu156@gmail.com' && pass == "admin") {
        res.render('adminPage.pug');
    }
});

app.get("/show", (req, res) => {
    Contact.find((err, docs) => {
        if (!err) {
            ErrorMsg = '';
            res.render('show_all_contact_us.pug', {
                list: docs,
            });
        } else {
            console.log('Error in Retrieving Customers list: ' + err);
        }
    });
});

app.get("/allTrip", (req, res) => {
    Trip.find((err, docs) => {
        if (!err) {
            ErrorMsg = '';
            res.render('show_all_trip.pug', {
                list: docs,
            });
        } else {
            console.log('Error in Retrieving Customers list: ' + err);
        }
    });
});
app.get("/viewmore", (req, res) => {
    var id = req.body.id;
    Trip.findById(id, (err, doc) => {
        if (!err) {
            var params = { viewMore: doc };
            res.status(200).render('viewmore.pug', params);
        } else {
            res.send(err);
        }
    });
});

app.post("/deleteEdit", (req, res) => {
    var id = req.body.id;
    Trip.findByIdAndRemove(id, (err, doc) => {
        if (!err) {
            res.send('Deleted successfully');
        } else {
            res.send("Error During deleting data");
        }
    });
});

app.post("/updateEdit", (req, res) => {
    var id = req.body.id;
    Trip.findById(id, (err, doc) => {
        if (!err) {
            var params = { customer: doc };
            res.status(200).render('update.pug', params);
        } else {
            res.send(err);
        }
    })

});

app.post("/updateNew", upload.single('file'), (req, res) => {

    if (req.file) {
        var dataRecords = {
            name: req.body.name,
            city: req.body.city,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        }
    } else {
        var dataRecords = {
            name: req.body.name,
            city: req.body.city,
            email: req.body.email,
            phone: req.body.phone,
        }
    }

    var updateNew = Trip.findByIdAndUpdate(req.body.id, dataRecords);
    // Employee.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true }, (err, doc) => {
    //     if (!err) {
    //         res.render('index.pug', {
    //             list: doc,
    //         });
    //     }
    // });
    updateNew.exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Error")
            res.render('index.pug')
        }
    })
});


app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json())
    //STARTING THE SERVER    
app.listen(port, () => {
    console.log(`This application is running successfully on port ${port}`)
});
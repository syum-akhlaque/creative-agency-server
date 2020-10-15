const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orderPic'));
app.use(fileUpload());

const port = 5000;
require('dotenv').config();
const dbName =  process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;
// collectionName = orders
const uri = `mongodb+srv://${username}:${password}@cluster0.plwup.mongodb.net/${dbName}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db(dbName).collection("orders");
  const reviewsCollection = client.db(dbName).collection("reviews");
  const serviceCollection = client.db(dbName).collection("services");
  const adminCollection = client.db(dbName).collection("makeAdmin");


  app.post('/addOrders', (req, res) => { //-----------to add order by customer----------------------------
    const file = req.files.file;
    const name = req.body.name;
    const serviceName = req.body.serviceName;
    const projectDetails = req.body.projectDetails;
    const email = req.body.email;
    const status = req.body.status;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    ordersCollection.insertOne({ name,serviceName, email,projectDetails, image ,status })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
 })


  app.post('/addReviews', (req, res)=>{ //-----------to add reviews feedback by customer----------------------------
    const reviews = req.body;
    reviewsCollection.insertOne(reviews)
    .then(result =>{
        console.log(result)
    })
  })

  app.post('/addServices', (req, res) => { //-----------to add order by customer----------------------------
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({ title, description, image  })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })


 app.post('/addAdmin', (req, res)=>{  //-----------to add new service by admin----------------------------
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result =>{
        console.log(result)
    })
})


app.get('/services', (req, res)=>{    //-----------to get admin services , display them in home page servie section  ----------------------------
    serviceCollection.find({})
    .toArray( (err, documents) => {
      res.send(documents)
    } )
  })

 app.get('/allCustomerServices', (req, res)=>{    //-----------to get all customer order/service by admin----------------------------
    ordersCollection.find()
    .toArray( (err, documents) => {
      res.send(documents)
    } )
  })

  app.get('/orders', (req, res)=>{    //-----------to get customer order. shown as service list of a customer----------------------------
    const queryEmail = req.query.email;
    ordersCollection.find({email: queryEmail})
    .toArray( (err, documents) => {
      res.send(documents)
    } )
  })

  app.get('/reviews', (req, res)=>{    //-----------to get customer reviews----------------------------
    reviewsCollection.find()
    .toArray( (err, documents) => {
      res.send(documents)
    } )
  })
  
    app.get('/isAdmin', (req, res)=>{    //-----------to Check is  Admin ?----------------------------
    const queryEmail = req.query.email;
    adminCollection.find({adminEmail:queryEmail})
    .toArray( (err, documents) => {
      res.send(documents.length>0)
    } )
  })


});

app.listen(process.env.PORT || port) 

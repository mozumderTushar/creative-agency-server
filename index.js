const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jos17.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());


const port = 5000




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("creativeAgency").collection("services");
    const feedbackCollection = client.db("creativeAgency").collection("feedback");
    const orderCollection = client.db("creativeAgency").collection("order");
    const adminCollection = client.db("creativeAgency").collection("admin");
    console.log('db connected');

    // post order to server
    app.post('/singleOrder', (req, res) => {
        const event = req.body;
        orderCollection.insertOne(event)
            .then(result => {
                console.log(result)
                res.send(result)
            })
    })

    // client review order to server
    app.post('/clientFeedback', (req, res) => {
        const event = req.body;
        feedbackCollection.insertOne(event)
            .then(result => {
                console.log(result)
                res.send(result)
            })
    })

    //add new services
    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data
        const encImg = newImg.toString('base64')

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        servicesCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // add admin to server
    app.post('/addAdmin', (req, res) => {
        const event = req.body;
        adminCollection.insertOne(event)
            .then(result => {
                console.log(result)
                res.send(result)
            })
    })

    //services
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //client feedback
    app.get('/feedback', (req, res) => {
        feedbackCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //order
    app.get('/order', (req, res) => {
        orderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //all admin
    app.get('/allAdmin', (req, res) => {
        adminCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //orderList
    app.get('/orderList', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    //update Status
    app.patch('/updateStatus', (req, res) => {
        orderCollection.updateOne(
            { _id: ObjectId(req.body.id) },
            {
                $set: { status: req.body.newStatus },
                $currentDate: { "lastModified": true }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)
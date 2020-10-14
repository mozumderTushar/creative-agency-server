const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jos17.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());


const port = 5000




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("creativeAgency").collection("services");
    const feedbackCollection = client.db("creativeAgency").collection("feedback");
    const orderCollection = client.db("creativeAgency").collection("order");
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
        orderCollection.find({email: req.query.email})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })



});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)
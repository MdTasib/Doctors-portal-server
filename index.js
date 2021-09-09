const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

// database connected uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.do24a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("Appointments").collection("bookings");

  // appointments post/create
  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentsCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedId)
      })
      .catch(error => {
        console.log(error.message);
      })
  });

  // appointments read
  app.get('/appointments', (req, res) => {
    appointmentsCollection.find({})
      .toArray((error, document) => {
        res.send(document)
      });
  });

});



app.listen(process.env.PORT || 5000);
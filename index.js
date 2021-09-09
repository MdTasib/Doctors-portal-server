const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});


const uri = `mongodb+srv://doctorsPortal:doctorsPortal@cluster0.do24a.mongodb.net/Appointments?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("Appointments").collection("bookings");
  
});



app.listen(5000);
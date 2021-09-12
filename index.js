const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World');
});

// database connected uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.do24a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("Appointments").collection("bookings");
  const doctorCollection = client.db('Appointments').collection('doctors');

  // appointments post/create
  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentsCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedId)
      })
      .catch(error => {
        console.log(error.message);
      })
  });

  // specific date to load appointment
  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;

    doctorCollection.find({ email: email })
      // check this doctor ?
      .toArray((error, doctors) => {
        const filter = { date: date.date };
        if (doctors.length === 0) {
          filter.email = email;
        }

        // filter - he is doctor - return all appointment
        appointmentsCollection.find(filter)
          .toArray((error, document) => {
            res.send(document);
          })
      })

  });

  // add doctors
  // app.post('/addDoctor', (req, res) => {
  //   const file = req.files.file;
  //   const name = req.body.name;
  //   const email = req.body.email;
  //   file.mv(`${__dirname}/doctors/${file.name}`, error => {
  //     if (error) {
  //       console.log(error);
  //       return res.status(500).send({ message: 'Failed to upload image' });
  //     }
  //     return res.status(200).send({ name: file.name, path: `/${file.name}` });
  //   })
  // });

  app.post('/addDoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    doctorCollection.insertOne({ name, email, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // all doctors get
  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
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
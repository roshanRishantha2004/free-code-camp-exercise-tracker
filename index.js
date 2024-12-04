const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('/public'));

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  }
});

const User = mongoose.model('User', userSchema);

const exercisesSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    duration: {
      type: Number
    },
    date: {
      type: Date
    }
});

const Exercise = mongoose.model('Exercise', exercisesSchema);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Database connection error:", err));

  
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.post('/api/users', async (req, res) => {
  try {
    console.log(req.body.username)
    const user = await User.create({
      name: req.body.username
    });

    if (!user) {
      return res.json({
        message: 'Invalid user!'
      });
    }
    console.log(user)
    return res.json({
      user: user
    })
  } catch (err) {
    res.json({
      message: err.message
    })
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
      const { description, duration, date } = req.body;
      const id = req.params._id;
      console.log(id)

      const user = await User.findById(id);
      console.log(user.name)
      // if (!mongoose.isValidObjectId(id)) {
      //   res.json({
      //     message: 'Invalid user'
      //   });
      // }

      let validDate;

      // if (!isNaN(date)) {
      //   res.json({
      //     message: 'Invalid date'
      //   });
      // }

      validDate = new Date(date);
      const utcDate = validDate.toUTCString();
      console.log(utcDate)

      // if (!(duration === Number)){
      //   res.json({
      //     message: 'Invalid duration'
      //   })
      // }

      const exercises = await Exercise.create({
        username: user.name,
        description: description,
        duration: duration,
        date: utcDate
      });

      res.json({
        exercises
      })
  } catch (err) {
    res.json({
      message: err.message
    })
  }
})


app.listen(3000, () => console.log('Server is listening on port 3000!'));
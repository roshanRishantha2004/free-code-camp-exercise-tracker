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
  username: {
    type: String,
  }
});

const User = mongoose.model('User', userSchema);

const exercisesSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
    const user = await User.create({
      username: req.body.username
    });

    if (!user) {
      return res.json({
        message: 'Invalid user!'
      });
    }

    return res.json({
      _id: user._id,
      username: user.username
    });

    
  } catch (err) {
    res.json({
      message: err.message
    })
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const user = await User.find();
    const result = user.map(user => ({
      _id: user._id,
      username: user.username
    }));

    res.json(result);
  } catch (err) {
    res.json({
      message: 'Invalid!'
    })
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
      const { description, duration, date } = req.body;
      const id = req.params._id;

      const user = await User.findById(id);
      const validDate = date ? new Date(date): new Date();
      const utcDate = validDate.toUTCString();

      const exercises = await Exercise.create({
        userId: id,
        description: description,
        duration: duration,
        date: utcDate
      });

      const newUser = {
        _id: user._id,
        username: user.username
      }

      res.json({
        username: user.username,
        description: exercises.description,
        duration: exercises.duration,
        date: exercises.date.toDateString(),
        _id: user._id
      })
  } catch (err) {
    res.json({
      message: err.message
    })
  }
});


app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const id = req.params._id;
    const { from, to, limit } = req.query;
    const user = await User.findById(id);
    console.log(user)
    // const exercise = await Exercise.find({ userId: id });
    // console.log(exercise)
    // const count = await Exercise.countDocuments({ userId: id });
    // console.log(count);

    const query = { userId: id };
    if (from) {
      query.date = { ...query.date, $gte: new Date(from) };
    }
    if (to) {
      query.date = { ...query.date, $lte: new Date(to) };
    }

    // Fetch exercises with optional limit
    let exercises = Exercise.find(query).sort({ date: 1 });
    if (limit) {
      exercises = exercises.limit(parseInt(limit));
    }
    exercises = await exercises;
    const count = await Exercise.countDocuments({ userId: id });


    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));
    console.log(log)

    res.json({
      _id: user._id,
      username: user.username,
      count,
      log
    })
  } catch (err) {
    res.json({
      message: 'Invalid user!'
    })
  }
})


app.listen(3000, () => console.log('Server is listening on port 3000!'));
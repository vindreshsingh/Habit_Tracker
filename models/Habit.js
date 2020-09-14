const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
  
    dates: [{
        date: String,
        complete: String
    }],
    favorite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Habit = mongoose.model('Habit', HabitSchema);

module.exports = Habit;
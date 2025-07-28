const mongoose = require('mongoose');
const schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
    url: {
    type: String,
    default: '/images/default-profile.jpg'
    },
    filename: String
    },
    role: {
    type: [String],
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

const User = mongoose.model('User', userSchema);

module.exports = User;
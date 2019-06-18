const mongoose = require('mongoose');

const groupNames = mongoose.Schema({
    name: {type: String, default: ''},
    community: {type: String, default: ''},
    image: {type: String, default: 'default.png'},
    followers: [{
        username: {type: String, default: ''},
        email: {type: String, default: ''}
    }]
});

module.exports = mongoose.model('Groups', groupNames);
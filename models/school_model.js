const mongoose = require('mongoose')


const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    late: { type: Number, required: true },
    long: { type: Number, required: true },

}, { versionKey: false, timestamps: true, })

module.exports = mongoose.model("schools", schoolSchema);
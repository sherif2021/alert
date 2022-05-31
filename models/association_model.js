const mongoose = require('mongoose')


const associationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone_1: { type: String, default: '' },
    phone_2: { type: String, default: '' },
    website: { type: String, default: '' },
    desc: { type: String, default: '' },
}, { versionKey: false, timestamps: true, })

module.exports = mongoose.model("associations", associationSchema);
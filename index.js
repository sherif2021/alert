
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app);
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')
const school_model = require('./models/school_model')

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database Connected')

    }).catch((e) => {
        console.error(e)
    });



const email = 'levbklick@outlook.com'
const emailPassword = 'lick2022'


const transporter = nodemailer.createTransport({
    service: 'outlook',
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
        user: email,
        pass: emailPassword
    }
});


const serverUrl = 'http://141.136.36.60:3333/'
//const serverUrl = 'http://localhost:3333/'

app.use(express.static(__dirname + '/public'))


app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/associations', require('./routes/associations'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/');
    },

    filename: function (req, file, cb) {


        const filePath = file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        cb(null, filePath);
        if (!req.paths) req.paths = []
        req.paths.push({ url: serverUrl + filePath, ex: path.extname(file.originalname) })
    }
});

var upload = multer({ storage: storage })



app.get('/schools', async (req, res) => {

    try {

        const schools = await school_model.find({})

        res.json(schools)


    } catch (e) {

        res.json({
            'status': false,
            'message': e
        })
    }
})

app.post('/school', async (req, res) => {

    try {

        const schoolObject = new school_model(req.body)
        const result = await schoolObject.save()

        res.json(result)

    } catch (e) {

        res.json({
            'status': false,
            'message': e
        })
    }
})

app.put('/school', async (req, res) => {

    try {

        const result = await school_model.findOneAndUpdate({ _id: req.body.id }, req.body, { returnOriginal: false })


        res.json({
            'status': true,
            'result': result
        })

    } catch (e) {

        res.json({
            'status': false,
            'message': e
        })
    }
})
app.delete('/school/:id', async (req, res) => {

    try {

        const result = await school_model.findOneAndDelete({ _id: req.params.id })

        res.json({
            'status': true,
            'result': result ? 'success' : 'failed'
        })

    } catch (e) {

        res.json({
            'status': false,
            'message': e
        })
    }
})
app.post('/', upload.array('files'), async (req, res) => {

    try {
        const paths = req.paths
        const { type, message, late, long, how_dangerous } = req.body

        var selectedSchool = null

        const schools = await school_model.find({})

        for (var school of schools) {

            const distance = caclDistance(school.late, late, school.long, long)

            if (selectedSchool == null || distance < selectedSchool.distance) {
                school._doc.distance = distance
                selectedSchool = school._doc
            }
        }

        if (selectedSchool != null) {
            var mailOptions = {
                from: email,
                to: selectedSchool.email,
                subject: '?????????? ?????? ????"?? ??????????',
                text: `
                    ???????? ????,
                    ?????????? ?????????? ?????????? ?????????? ???????? ${type}.
                    ???????? ?????????? ???????????? ?????????? ????????????:
                    
                    ?????? ??????????
                    ${how_dangerous}


                    ${message}

                    ?????????? ???????? ???????????? ???????????? ???????????? ??????????????.
                    ???? ???????????? ??????????.
                    ???????? ??????,
                    ?????????? ??"?? ??????????.
                    `,
                attachments: []

            };
            if (paths)
                for (var i = 0; i < paths.length; i++) {
                    mailOptions.attachments.push({
                        filename: i + paths[i].ex,
                        path: paths[i].url
                    })
                }
            transporter.sendMail(mailOptions)
        }

        res.json({
            'message': selectedSchool != null ? '???????????? ???????? ???????????? ???????????? ???? ?????? ?????????????? ?????????????????? ??????????' : '?????? ???? ???????? ???????????? ?????????? ???????????? ?????????????? ????????????'
        })
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

});


server.listen(process.env.PORT || 3333, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});

function caclDistance(lat1,
    lat2, lon1, lon2) {

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return (c * r);
}


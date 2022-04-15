
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app);
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const schools = require('./schools.json')


const email = 'maharat.lb.click@gmail.com'
const emailPassword = 'Maharat1020'


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
        user: email,
        pass: emailPassword
    }
});


const serverUrl = 'http://ajory.online:3333/'


app.use(express.static(__dirname + '/public'))


app.use(express.json())
app.use(express.urlencoded({ extended: false }))


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/');
    },

    filename: function (req, file, cb) {
        const filePath = file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        cb(null, filePath);
        if (!req.paths) req.paths = []
        req.paths.push(serverUrl + filePath)
    }
});

var upload = multer({ storage: storage })


app.post('/', upload.array('files'), async (req, res) => {

    try {
        const paths = req.paths
        const { type, message, late, long } = req.body

        var findSchool = false
        for (const school of schools) {

            const distance = caclDistance(school.late, late, school.long, long)
            console.log(`${school.name} => ${distance}`)

            const result = distance <= .5

            if (result) {
                findSchool = true
                var mailOptions = {
                    from: email,
                    to: school.email,
                    subject: 'דיווח חדש מל"ב בקליק',
                    text: `
                    שלום רב,
                    התקבל דיווח אירוע חירום מסוג ${type}.
                    להלן פרטים נוספים אודות הדיווח:
                    
                    ${message}

                    מצורף בזאת תמונות מאיזור הדיווח לשימושך.
                    נא טיפולך בהקדם.
                    תודה רבה,
                    מערכת ל"ב בקליק.
                    `,
                    attachments: []

                };
                for (var i = 0; i < path.length; i++) {
                    mailOptions.attachments.push({
                        filename: i,
                        path: paths[i]
                    })
                }
                console.log(mailOptions)
                transporter.sendMail(mailOptions)
                break;
            }
        }

        res.json({
            'message': findSchool ? 'האירוע דווח בהצלחה ויטופל על ידי הגורמים הרלוונטים במוסד' : 'אתה לא נמצא באיזור המותר לדיווח אירועים במערכת'
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


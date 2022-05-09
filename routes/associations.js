const router = require('express').Router()
const association_model = require('../models/association_model')

router.get('/', async (req, res) => {

    try {

        const associations = await association_model.find({})

        res.json({
            'status': true,
            'data': associations
        })

    } catch (e) {

        res.json({
            'status': false,
            'message': e
        })
    }
})

router.post('/', async (req, res) => {

    try {

        const object = new association_model(req.body)
        const result = await object.save()

        res.json({
            'status': true,
            'data': result
        })

    } catch (e) {
        res.json({
            'status': false,
            'data': e
        })
    }
})


router.put('/', async (req, res) => {

    try {

        if (req.body.id) {

            const result = await association_model.findOneAndUpdate({ _id: req.body.id }, req.body, { returnOriginal: false })

            res.json({
                'status': result ? true : false,
                'data': result ? result : 'Not Found'
            })

        } else {
            res.json({
                'status': false,
                'data': 'Bad Request'
            })
        }

    } catch (e) {
        res.json({
            'status': false,
            'data': e
        })
    }
})

router.delete('/:id', async (req, res) => {

    try {

        const result = await association_model.findOneAndDelete({ _id: req.params.id })

        res.json({
            'status': result ? true : false,
            'data': result ? result : 'Not Found'
        })

    } catch (e) {
        res.json({
            'status': false,
            'data': e
        })
    }
})

module.exports = router
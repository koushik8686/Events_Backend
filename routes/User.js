const express = require('express');
const router = express.Router();
const user = require('../models/User')

router.get('/profile/:id',async function (req, res) {
        try {
            const { id } = req.params;
            const profile = await user.findById(id);
            if (!profile) {
                return res.status(404).send({ error: 'Profile not found' });
            }
            res.status(200).send(profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
})

router.put('/profile/:id', function (req, res) {
    user.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(  (err, user)=> {
        if (err) return res.status(500).send(err);
        res.json(user);
    })
})

module.exports = router
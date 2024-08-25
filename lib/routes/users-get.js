const router = require('express').Router();
const { User } = require('../models');

router.get('/users', (req, res) => {
    const {enabled, sort} = req.query;


    const query = {};
    if(enabled !== undefined) {
        query.enabled = enabled === 'true';
    }

    let sortOption = {};
    if(sort) {
        sortOption[sort] = 1
    }

    User.find(query)
        .sort(sortOption)
        .then(users => res.status(200).json(users))
        .catch(error => res.status(500).json({
            code: 'internal_error',
            message: error.message
        }));
});

module.exports = router;



//GET /api/users?enabled=true

//GET /api/users?enabled=false

//GET /api/users?sort=email

//GET /api/users?enabled=true&sort=email
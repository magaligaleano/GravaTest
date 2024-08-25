'use strict';
const router = require('express').Router();
const { User, Address } = require('../models');
const logger = require('../logger');

function getUserWithAddress(req, res) {
    const userId = req.params.id;

    User.findById(userId)
        .populate('userInformation')
        .populate('address') 
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    code: 'user_not_found',
                    message: 'User not found'
                });
            }
            return res.status(200).json(user);
        })
        .catch(error => {
            logger.error(`GET /api/users/:id - error: ${error.message}`);
            return res.status(500).json({
                code: 'internal_error',
                message: 'Internal error'
            });
        });
}

router.get('/users/:id', getUserWithAddress);

module.exports = router;

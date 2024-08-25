'use strict';
const router = require('express').Router();
const { Address } = require('../models');
const logger = require('../logger');

function updateAddress(req, res) {
    const addressId = req.params.id;

    Address.findByIdAndUpdate(addressId, req.body, { new: true, runValidators: true })
        .then(updatedAddress => {
            if (!updatedAddress) {
                return res.status(404).json({
                    code: 'address_not_found',
                    message: 'Address not found'
                });
            }
            return res.status(200).json(updatedAddress);
        })
        .catch(error => {
            logger.error(`PUT /api/addresses/:id - error: ${error.message}`);
            return res.status(500).json({
                code: 'internal_error',
                message: 'Internal error'
            });
        });
}

router.put('/addresses/:id', updateAddress);

module.exports = router;

'use strict';
const router = require('express').Router();
const logger = require('../logger');
const Joi = require('joi');
const {User, UserInformation, Address} = require('../models');
const user = require('../models/user');
const userInformation = require('../models/user-information');



function validateFields(req, res, next) {
    console.log(req.body)
    const userInfoSchema = Joi.object({
        name: Joi.string().min(3).required(),
        lastName: Joi.string().min(1).required(),
        dni: Joi.string().required(),
        age: Joi.number().integer().min(0).max(200).optional()
    });

    const userSchema = Joi.object({
        email: Joi.string().email().required(),
        color: Joi.string().valid('green','red','blue').required(),
        userInformation: userInfoSchema.required(),
        enabled: Joi.boolean().optional()
    });
   
    const {error} = userSchema.validate(req.body);
    
    console.log(error);
    if(error){
        return res.status(400).json({
            code: 'invalid_fields',
            message: error.details[0].message
        });
    }
    console.log("validacion");
    return next();
}

function createUserInformation(req, res, next) {
    // Crear modelo UserInformation relacionado a User
    console.log('User Information Data:', req.body.userInformation);
    return UserInformation.create({
        name : req.body.userInformation.name,
        lastName : req.body.userInformation.lastName,
        dni : req.body.userInformation.dni,
        age : req.body.userInformation.age

    })
    .then((userInfo) =>{
        console.log(userInfo)
        req.userInfo = userInfo;
        next();
    })
    .catch((error) =>{
        logger.error(`POST / users createUserInformation error ${error.message}`);
        return res.status(500).json({
            code: 'internal_error',
            message: 'Internal error'
        });
    });
    // ...
    
}

function saveUser(req, res) {
    // TODO: crear user con todos los campos correctos
    console.log(req.body);

    const user = new User({
        email: req.body.email,
        color: req.body.color,
        enabled: req.body.enabled,
        userInformation : req.userInfo._id
    
    })
    console.log(user);

    user.save();

    return res.status(201).json(user.toJSON());

}
async function userToDelete(req, res) {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                code: 'user_not_found',
                message: 'User not found'
            });
        }

        if (!user.enabled) {
            return res.status(400).json({
                code: 'user_already_disabled',
                message: 'User is already disabled'
            });
        }

        user.enabled = false;
        const updatedUser = await user.save();  

        return res.status(200).json({
            code: 'user_disabled',
            message: 'User has been disabled',
            user: updatedUser.toJSON()
        });

    } catch (error) {
        logger.error(`POST /users/:id/disable - error: ${error.message}`);
        return res.status(500).json({
            code: 'internal_error',
            message: 'Internal error'
        });
    }
}

function saveAddress(req, res) {
    const address = new Address({
        street: req.body.street,
        city: req.body.city,
        postalCode: req.body.postalCode,
        user: req.body.user
    });

    address.save()
    .then((savedAddress) => {
        return User.findByIdAndUpdate(
            req.body.user, 
            { address: savedAddress._id }, 
            { new: true }
        ).populate('address'); 
    })
    .then((updatedUser) => {
        return res.status(201).json(updatedUser.toJSON());
    })
    .catch((error) => {
        logger.error(`POST /users/:id/address - error: ${error.message}`);
        return res.status(500).json({
            code: 'internal_error',
            message: 'Internal error'
        });
    });
}

router.post(
    '/users',
    validateFields,
    createUserInformation,
    saveUser
);
router.post('/users/:id/disable', userToDelete);

router.post('/users/address', saveAddress);

module.exports = router;

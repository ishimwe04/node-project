const config=require('config');
const jwt=require('jsonwebtoken');
const Joi= require('joi');
const bcrypt= require('bcrypt');
const lodash= require('lodash');
const {User}= require('../models/user');
const express=require('express');
var router=express.Router();

router.post('/', async(req, res)=> {
    const { error }=validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
     
    let user= await User.findOne({ email:req.body.email });
    if(!user) return res.status(400).send('invalid email or password.');

   const isPasswordValid= await bcrypt.compare(req.body.password, user.password)
   if(!isPasswordValid) return res.status(400).send('invalid email or password.');

   const token=user.generateAuthToken();

   res.send(token);
});

function validate(user){
    const schema={
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(5).max(255).required()
}
return Joi.validate(user, schema);
}

module.exports=router;
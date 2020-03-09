const auth= require('../middleware/auth');
const config=require('config');
const jwt=require('jsonwebtoken');
const bcrypt= require('bcrypt');
const lodash= require('lodash');
const {User,validate}= require('../models/user');
const express=require('express');
var router=express.Router();

router.get('/current', auth, async (req,res)=>{
      const user= await User.findById(req.user._id).select('-password');
      res.send(user);
});

router.post('/', async(req, res)=> {
    const { error }=validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
     
    let user= await User.findOne({ email:req.body.email });
    if(user) return res.status(400).send('user already registered');

    user= new User(lodash.pick(req.body, ['name', 'email', 'password']));
    const salt= await bcrypt.genSalt(10);
    user.password= await bcrypt.hash(user.password, salt);

    await user.save();

    const token=user.generateAuthToken();
    
    res.header('x-auth-token', token).send(lodash.pick(user, ['_id','name', 'email']));
});

module.exports=router;
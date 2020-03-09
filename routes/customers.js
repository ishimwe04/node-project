const {Customer,validate} = require('../models/customer');
const express=require('express');
const router=express.Router();

router.get('/', async(req, res)=> {
    const customers= await Customer.find().sort('name');
    res.send(customers);
});

router.get('/:id' , async (req, res)=>{
    const customer= await Customer.findById(req.params.id);

    if(!customer) res.status(404).send('the cstomer with the given ID not found');

    res.send(customer);
});

router.post('/', async (req, res) =>{
    
    const { error }=validate(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    let customer= new Customer(
        { name: req.body.name,
          phone:req.body.phone,
          isGold:req.body.isGold
        });
    customer= await customer.save();

    res.send(customer);
});

router.put('/:id', async(req, res) =>{

 const { error }=validate(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }  
    
    const customer= await Customer.findByIdAndUpdate(req.params.id, {
        name:req.body.name,
        phone:req.body.phone,
        isGold:req.body.isGold
    },{
         new:true
    });
    if(!customer) res.status(404).send('the customer with the given ID not found');
    
    res.send(customer);

});

router.delete('/:id', async (req, res) =>{ 
    const customer= await Customer.findByIdAndRemove(req.params.id);

    if(!customer) return res.status(404).send('the customer with the given ID not found');

    res.send(customer);
});

module.exports=router;
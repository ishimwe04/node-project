const {Rental,validate} = require('../models/rental');
const {Movie} = require('../models/movie');
const {Customer}= require('../models/customer');
const mongoose=require('mongoose');
const Fawn= require('fawn');
const express=require('express');
const router=express.Router();

Fawn.init(mongoose);

router.get('/', async(req, res)=> {
    const rentals= await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.post('/', async (req, res) =>{
    
    const { error }=validate(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    const customer= await Customer.findById(req.body.customerId);
    if(!customer) res.status(404).send('invalid customer');

    const movie= await Movie.findById(req.body.movieId);
    if(!movie) res.status(404).send('invalid movie');

    if(movie.numberInStock===0) res.status(404).send('movie is not exist in stock');

    let rental= new Rental({
        customer:{
            _id: customer._id,
            name:customer.name,
            phone: customer.phone
        }, 

        movie:{
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
        });

        try{
            new Fawn.Task()
               .save('rentals', rental)
               .update('movies', { _id:movie._id}, {
                  $inc: {numberInStock:-1}
                     })
               .run();
               res.send(rental);
        }
        catch(ex){
            res.status(500).send('internal error');
        }
    
});

module.exports=router;
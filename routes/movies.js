const {Movie,validate} = require('../models/movie');
const {Genre}= require('../models/genre');
const express=require('express');
const router=express.Router();

router.get('/', async(req, res)=> {
    const movies= await Movie.find().sort('name');
    res.send(movies);
});

router.get('/:id' , async (req, res)=>{
    const movie= await Movie.findById(req.params.id);

    if(!movie) res.status(404).send('Movie with the given ID not found');

    res.send(movie);
});

router.post('/', async (req, res) =>{
    
    const { error }=validate(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    const genre= await Genre.findById(req.body.genreId);
    if(!genre) res.status(404).send('invalid genre');

    let movie= new Movie({ 
        title: req.body.title,
        genre:{
           _id:genre._id,
           name:genre.name
        },
        numberInStock:req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
        });
    movie= await movie.save();

    res.send(movie);
});

router.put('/:id', async(req, res) =>{

 const { error }=validate(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }  
    
    const movie= await Genre.findByIdAndUpdate(req.params.id, {
        title:req.body.title,
        genre:req.body.genre,
        numberInStock:req.body.numberInStock,
        dailyRentalRate:req.body.dailyRentalRate
    },{
         new:true
    });
    if(!movie) res.status(404).send('the Movie with the given ID not found');
    
    res.send(movie);

});

router.delete('/:id', async (req, res) =>{ 
    const movie= await Movie.findByIdAndRemove(req.params.id);

    if(!movie) return res.status(404).send('the Movie with the given ID not found');

    res.send(movie);
});

module.exports=router;
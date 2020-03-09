const moment=require('moment');
const request=require('supertest');
const {Rental}= require('../../models/rental');
const {Movie}= require('../../models/movie');
const {User}= require('../../models/user');
const mongoose= require('mongoose');

describe('Returns rental', ()=>{
    let server;
    let customerId;
    let movieId;
    let rental;
    let movie;
    let token;

    const exec=()=>{
        return request(server)
              .post('/api/returns')
              .set('x-auth-token', token)
              .send({ customerId, movieId });
    };

    beforeEach(async()=>{
        server= require('../../index');

        customerId= mongoose.Types.ObjectId();
        movieId= mongoose.Types.ObjectId();

        token=new User().generateAuthToken();

        movie= new Movie({
            _id:movieId,
            title:'abcde',
            dailyRentalRate: 2,
            genre: { name: 'genre1' },
            numberInStock: 10
        });
        await movie.save();

        rental= new Rental({
            customer:{
                _id:customerId,
                name:'12345',
                phone:'07888'
            },
            movie:{
                _id:movieId,
                title:'abcde',
                dailyRentalRate: 2
            }
        });
        await rental.save();
    });

    afterEach( async()=>{
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    })

    it('should return 401 error if not logged in', async()=>{
        token='';

        const result= await exec();

        expect(result.status).toBe(401);
    });

    it('should return 400 error if customerId did not provided', async()=>{
        customerId='';

        const result=await exec();

        expect(result.status).toBe(400);
    });

    it('should return 400 error if movieId did not provided', async()=>{
        movieId='';

        const result= await exec();

        expect(result.status).toBe(400);
    });

    it('should return 404 error if no rental for the given customer and movie', async()=>{
        await Rental.remove({});

        const result= await exec();

        expect(result.status).toBe(404);
    });

    it('should return 400 error if no return is already processed', async()=>{
        rental.dateReturned= new Date();
        await rental.save();

        const result= await exec();

        expect(result.status).toBe(400);
    });

    it('should return 200 if it is valid', async()=>{

        const result= await exec();

        expect(result.status).toBe(200);
    });

    it('should set the return date if input is valid', async()=>{
        await exec();

        const rentalInDb= await Rental.findById(rental._id);
        const diff= new Date() - rentalInDb.dateReturned;

        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should return the rental fee if input is valid', async()=>{
        rental.dateOut=moment().add(-5, 'days').toDate(); 
        await rental.save();

        await exec();

        const rentalInDb= await Rental.findById(rental._id);

        expect(rentalInDb.rentalFees).toBe(10);
    });

    it('should set update the stock if input is valid', async()=>{

        await exec();

        const movieInDb= await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(11);
    });

    it('should return rental if input is valid', async()=>{

        const result=await exec();

        const rentalInDb= await Movie.findById(rental._id);

        expect(Object.keys(result.body)).toEqual(expect.arrayContaining([
               'customer','movie','dateOut','dateReturned','rentalFees'
        ]));
    });
});
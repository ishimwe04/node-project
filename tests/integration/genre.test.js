const request=require('supertest');
const {Genre}=require('../../models/genre');
const {User}=require('../../models/user');
const mongoose=require('mongoose');

let server;

describe('/api/genres',()=>{
    beforeEach( ()=> { 
        server= require('../../index'); 
    });
    afterEach( async()=> { 
        await server.close();  
        await Genre.remove({});    
    } );

    describe('GET /', ()=>{
        it('should return all genres', async()=>{
            await Genre.collection.insertMany([
                 { name: 'genre1'},
                 { name: 'genre2'}
             ]);
             
              const result= await request(server).get('/api/genres');

              expect(result.status).toBe(200);
              expect(result.body.length).toBe(2);
              expect(result.body.some(g=>g.name==='genre1')).toBeTruthy();
              expect(result.body.some(g=>g.name==='genre2')).toBeTruthy();
        });
     
    });
    describe('GET /:id', ()=>{
        it('should return a specific genre if a valid ID is passed', async()=>{
            const genre= new Genre({ name: 'genre1' });
            await genre.save();

            const result= await request(server).get('/api/genres/'+ genre._id);

            expect(result.status).toBe(200);
            expect(result.body).toHaveProperty('name', genre.name);
        });
        it('should return 404 if ID is invalid', async()=>{
            const genre= new Genre({ name: 'genre1' });
            await genre.save();

            const result= await request(server).get('/api/genres/1');

            expect(result.status).toBe(404);
        })
    });
        describe('POST /', ()=>{

            let token;
            let name;

            const exec= async()=>{
                return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
            }

            beforeEach(()=>{ 
                token= new User().generateAuthToken();
                name= 'genre1';
            })
            it('should return a 401 error if user is not logged in', async()=>{
                token='';

                const result= await exec();

                expect(result.status).toBe(401);
            });
            it('should return a 400 error if name is less than 5 characters', async()=>{ 
                name='1234';

                const result= await exec();

                expect(result.status).toBe(400);
            });
            it('should return a 400 error if name is greater than 50 characters', async()=>{
                
                name= new Array(52).join('a');

                const result= await exec();

                expect(result.status).toBe(400);
            });
            it('should save the genre if it is valid', async()=>{
                
                await exec();

                const genre= await Genre.find({ name: 'genre1'});

                expect(genre).not.toBeNull();
            });
            it('should return the genre if it is valid', async()=>{

                const result= await exec();

                expect(result.body).toHaveProperty('_id');
                expect(result.body).toHaveProperty('name', 'genre1');
            });
        })
});
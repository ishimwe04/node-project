const request=require('supertest');
const {User}=require('../../models/user');
const {Genre}=require('../../models/genre');

let server;

describe(' auth middleware ', ()=>{
    beforeEach( ()=> {
        server= require('../../index'); 
     });
    afterEach( async()=> {
        await server.close();  
        await Genre.remove({});      
    } );
            let token;

            const exec= ()=>{
                return request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name:'genre1' });
            }

            beforeEach(()=>{ 
                token= new User().generateAuthToken();
            })
            it('should return a 401 error if user is not logged in', async()=>{
                token='';

                const result= await exec();

                expect(result.status).toBe(401);
            });
            it('should return a 400 error if token is invalid', async()=>{ 
                token='a';

                const result= await exec();

                expect(result.status).toBe(400);
            });
            it('should return 200 if token is valid', async()=>{
                const result= await exec();

                expect(result.status).toBe(200);
            });
})
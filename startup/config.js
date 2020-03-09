const config=require('config');

module.exports=function (){
   if(!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is not found');
    process.exit(1);
 } 
}

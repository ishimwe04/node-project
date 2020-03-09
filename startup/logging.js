const winston=require('winston');
//require('winston-mongodb');
require('express-async-errors');

module.exports=function (){
   process.on('uncaughtException', (ex)=>{
    console.log('we got an uncaught exception!');
    winston.error(ex.message, ex);
});

process.on('unhandledRejection', (ex)=>{
 console.log('we got an unhandled rejection!');
 winston.error(ex.message, ex);
});

new winston.transports.Console({ colorize:true, prettyPrint: true });
winston.add(winston.transports.File, { filename:'logfile.log'});
//winston.add(winston.transports.MongoDB, { db:'mongodb://localhost/videos'}); 
}

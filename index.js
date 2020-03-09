const winston=require('winston');
const express=require('express');
const app=express();

require('./startup/config')();
require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validation')();
require('./startup/prod')(app);

const port=process.env.PORT || 10000;
const server= app.listen(port, ()=> winston.info(`listening is on port ${port}`));

module.exports=server;
const axios = require('axios');
//const https = require('https');


const getServer = async function(){
 //return true;
 const gass = await axios.get(`https://jsonplaceholder.typicode.com/users`)
 .then(res => {
   return "s";//persons = res.data;
  // this.setState({ persons });
 });
 
return gass;


}

module.exports = {
    getServer
  }
  

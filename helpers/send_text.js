const kirim_pesan = function(nomor,msg){
    return true;
    let Client = require('whatsapp-web.js');
    client.sendMessage(nomor,msg).then(response=>{
            res.status(200).json({
                status:true,
                response:response
            }).catch(err=>{
                res.status(500).json({
                    status:false,
                    response:err
                });
            });
    });
}

module.exports = {
    kirim_pesan
  }
  

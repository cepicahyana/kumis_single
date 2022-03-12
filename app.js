const { Client, MessageMedia,LegacySessionAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const { json } = require('express/lib/response');
const single_number = "6282128258250";
const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: true
}));

const sessions = [];

// const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//   sessionCfg = require(SESSION_FILE_PATH);
// }
// setTimeout(() => {
//   createSession();
// }, 10);

const delSessionsFile = async function(sender_number){ //new
  var sessions = JSON.stringify(sessions);
  const fileUrl = "https://konekwa.com/api/delSessionsFile";  
    const hasil = await axios.post(fileUrl,{apikey:2345678,sender_number:sender_number}).then(response => {  
      console.log("act delete user :"+sender_number);
    }).catch(err=>{
      console.log(err);
    }); 
}

const getSessionsFile = async function(to=null) { //new 
    const fileUrl = "https://konekwa.com/api/getSessionsFile";  
    const hasil = await axios.post(fileUrl,{single_number:single_number,to:to,apikey:2345678}).then(response => {  
      return response.data["data"]; 
    // return JSON.parse(response.data); 
    }).catch(err=>{
      console.log(err);
    }); 
    return hasil;
}

const createSession = async function(sender_number) { //new
  console.log("create sessoin:"+sender_number);
    
       const fileUrl = "https://konekwa.com/api/createSession";  
       const hasil = await axios.get(fileUrl,{params:{apikey:2345678,sender_number:sender_number}}).then(response => {  
          sessionCfg = response.data["data"]; 
          sessionCfg = JSON.parse(sessionCfg); 
          // console.log(sessionCfg);
       }).catch(err=>{
         console.log(err);
       }); 



app.get('/', (req, res) => {
  res.sendFile('app.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
      //  executablePath: '/usr/bin/google-chrome',
      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LegacySessionAuth({
    session: sessionCfg
    })
});



client.on('message_ack', (msg, ack) => { //ketika pesan dibaca
  /*
      == ACK VALUES ==
      ACK_ERROR: -1
      ACK_PENDING: 0
      ACK_SERVER: 1
      ACK_DEVICE: 2
      ACK_READ: 3
      ACK_PLAYED: 4
  */
      console.log("tracking msg: "+ack);
 if(msg.from=="6285221288210@c.us" && msg.body=="Destroy"){
  console.log("destroy");
// init();
    // deleteSession();
    // client.destroy;
    // client.destroy;
    // console.log(client);
    // console.log(sessions);
    //client.initialize();
    sessions=[];
     client.destroy();
     client.initialize();
    console.log(sessions);
 }
})

client.initialize();



function kirimPesan(sender,nomor,msg) {
  const client = sessions.find(sess => sess.id == sender).client;
     var nomor = phoneNumberFormatter(nomor);
    client.sendMessage(nomor,msg);
}

  function batre_info()  
{	return false;
	 client.on('change_battery', (batteryInfo) => {
		// Battery percentage for attached device has changed
		const { battery, plugged } = batteryInfo;
			kirimPesan('DMT','085221288210',`Battery: ${battery}% - Charging? ${plugged}`);
	
	});
}




client.on('message',async msg => {
	var to = msg.to;
	var pesan = msg.body;
	var f	= msg.from;
	console.log("to:"+to+"  From:"+f+"    msg:"+pesan);
	// checkInbox(to,f,pesan);
  var awalan = pesan.substr(0, 6);
  if (awalan == 'Group:' && f=='6285221288210@c.us') {
    var obj=[null]; var indexGroup=1;
    client.getChats().then(chats => {
      const groups = chats.filter(chat => chat.isGroup);

      if (groups.length == 0) {
        msg.reply(to+' : have no group yet.');
      } else {
        // let replyMsg = '';
        groups.forEach((group, i) => {
          // replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
          obj[indexGroup++]= {
            id: group.id._serialized,
            name: group.name
          };
        });
        const data = JSON.stringify(obj);
        var link = pesan.slice(6);
        updateGroup(link,data);
        msg.reply("request update group: "+link);
        console.log("request update group: "+link+" - data:"+data);
      }
    });
  }else if(msg.body=='T'){
    
    let button = new Buttons('Lagi apa nih?',[{body:'Periksa PR murid?'},{body:'Rebahan?'},{body:'Mengketan?'}],'Hai sayang!!!','');
    // let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
    // let list = new List('List body','btnText',sections,'Title','footer');
    // console.log(button);
    msg.reply(button);
  }else if (msg.body == 'Menus') {
       // msg.reply('pong');
	    msg.reply('*menu hari ini*  \n 1. Ayam bakar 5000 \n 2.Ayam serundeng 6000 \n 3.Mie kocok 3000');
	}else if (msg.body === 'info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.me.user}
            Platform: ${info.platform}
            WhatsApp version: ${info.phone.wa_version}
        `);
    }else if (msg.body === 'delete') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true);
            } else {
                msg.reply('I can only delete my own messages');
            }
        }
    } else if (msg.body === 'pin') {
        const chat = await msg.getChat();
        await chat.pin();
	}
     else{
	// batre_info();
	}
	

  

  // Downloading media
  if (msg.hasMedia) {
    msg.downloadMedia().then(media => {
      // To better understanding
      // Please look at the console what data we get
      console.log(media);

      if (media) {
        // The folder to store: change as you want!
        // Create if not exists
        const mediaPath = './downloaded-media/';

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }

        // Get the file extension by mime-type
        const extension = mime.extension(media.mimetype);
        
        // Filename: change as you want! 
        // I will use the time for this example
        // Why not use media.filename? Because the value is not certain exists
        const filename = new Date().getTime();

        const fullFilename = mediaPath + filename + '.' + extension;

        // Save to file
        try {
          fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' }); 
          console.log('File downloaded successfully!', fullFilename);
        } catch (err) {
          console.log('Failed to save the file:', err);
        }
      }
    });
  }
});

 






// Socket IO
// io.on('connection', function(socket) {
//   socket.emit('message', 'Connecting...');

  // client.on('qr', (qr) => {
  //   console.log('QR RECEIVED', qr);
  //   qrcode.toDataURL(qr, (err, url) => {
  //     socket.emit('qr', url);
  //     socket.emit('message', 'QR Code received, scan please!');
  //   });
  // });

  client.on('qr', (qr) => { 
    qrcode.toDataURL(qr, (err, url) => {
		setQR(sender_number,url);
	  setDeviceStatus(sender_number,2);
    console.log("ayo scan:"+sender_number);
    });
  });

  const setDeviceStatus = async function(sender_number,sts,session=null){  
		var linkapi = "https://konekwa.com/api/setDeviceStatus";   
		const hasil = await axios.get(linkapi,{ 
				params :{		apikey		   : "2345678",
                sender_number	   : sender_number,
								sts			         : sts,
                session          : session
						}
		}).then(response => {  
      console.log("update device "+sender_number+" sts : "+sts);
		return response.data; 
	  }).catch(err=>{
		return false;
	  });
}


  const setQR = async function(sender_number,qr){  
		var linkapi = "https://konekwa.com/api/setQr";   
		const hasil = await axios.get(linkapi,{ 
				params :{		apikey : "2345678",
        sender_number	     : sender_number,
								qr	       : qr
						}
		}).then(response => {  
		return response.data; 
	  }).catch(err=>{
		return false;
	  });
  }
			

  // client.on('ready', () => {
  //   socket.emit('ready', 'Whatsapp is ready!');
  //   socket.emit('message', 'Whatsapp is ready!');
  // });

  client.on('ready', () => { 
    console.log("whatsapp is ready :"+sender_number);
    setDeviceStatus(sender_number,1);
  });
  

  // client.on('authenticated', (session) => {
  //   socket.emit('authenticated', 'Whatsapp is authenticated!');
  //   socket.emit('message', 'Whatsapp is authenticated!');
  //   console.log('AUTHENTICATED', session);
  //   sessionCfg = session;
  //   fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
  //     if (err) {
  //       console.error(err);
  //     }
  //   });
  // });

  client.on('authenticated', (session) => {
    console.log("whatsapp is authenticated :"+sender_number);
    sessionCfg = session;
    setDeviceStatus(sender_number,3,JSON.stringify(sessionCfg));  
  });

  client.on('auth_failure', function(session) {
    console.log(sender_number +':Auth failure, restarting...' );
	setDeviceStatus(sender_number,4);
  });

  // client.on('auth_failure', function(session) {
  //   socket.emit('message', 'Auth failure, restarting...');
  // });

  // client.on('disconnected', (reason) => {
  //   socket.emit('message', 'Whatsapp is disconnected!');
  //   fs.unlinkSync(SESSION_FILE_PATH, function(err) {
  //       if(err) return console.log(err);
  //       console.log('Session file deleted!');
  //   });
  //   client.destroy();
  //   client.initialize();
  // });

  client.on('disconnected', (reason) => {
    console.log( sender_number +':   disconnected!' );
	setDeviceStatus(sender_number,0);
        console.log('Session '+sender_number+' file deleted!');
    client.destroy();
    client.initialize();
    delSessionsFile(sender_number);
    console.log('remove-session :'+ sender_number);
  });


  const delSessionsFile = async function(){ //new
		var sessions = JSON.stringify(sessions);
		const fileUrl = "https://konekwa.com/api/delSessionsFile";  
			const hasil = await axios.post(fileUrl,{apikey:2345678,sender_number:sender_number}).then(response => {  
        console.log("act delete user :"+sender_number);
		  }).catch(err=>{
			  console.log(err);
		  }); 
}


// });


const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}
 
 

const kirim_teks = async function(no_tujuan=null,msg=null,sender_number=null,id=null){  
  const client = sessions.find(sess => sess.id == sender_number).client;
  if(no_tujuan==null){ return false;}
    client.sendMessage(no_tujuan,msg).then(response=>{
        try{
			        	return true;
          }catch(e) {
               return false;
              }
          }
          );
}

const kirim_image = async function(no_tujuan=null,msg=null,sender_number=null,url=null,fileName=null,id=null){  
  const client = sessions.find(sess => sess.id == sender_number).client;
  if(no_tujuan==null){ return false;}

 

var nomor = phoneNumberFormatter(no_tujuan);
var caption  = msg;
const fileUrl = url; 
let mimetype;
const attachment = await axios.get(fileUrl, {
responseType: 'arraybuffer'
}).then(response => {
mimetype = response.headers['content-type'];
return response.data.toString('base64');
});
const media = new MessageMedia(mimetype, attachment, fileName);
 
client.sendMessage(nomor,media,{ caption:caption }).then(response=>{
      try{
        return true;
    }catch(e) {
      return false;
      }
});

}


const kirim_file = async function(no_tujuan=null,msg=null,sender_number=null,url=null,fileName=null,id=null){  
  const client = sessions.find(sess => sess.id == sender_number).client;
  if(no_tujuan==null){ return false;}

 kirim_teks(no_tujuan,msg,sender_number,id);
var nomor = phoneNumberFormatter(no_tujuan);
var caption  = msg;
const fileUrl = url; 
let mimetype;
const attachment = await axios.get(fileUrl, {
responseType: 'arraybuffer'
}).then(response => {
mimetype = response.headers['content-type'];
return response.data.toString('base64');
});
const media = new MessageMedia(mimetype, attachment, fileName);
 
client.sendMessage(nomor,media,{ caption:caption }).then(response=>{
      try{
        return true;
    }catch(e) {
      return false;
      }
});

}


const kirim_teks_group  = async function(sender_number,groupName,message){ 
  
    const group = await findGroupByName(groupName,sender_number);
    if (!group) {
      console.log("group : "+group+" tidak ditemukan!");
      return false;
      
    }
    chatId = group.id._serialized;
    console.log(chatId);

  // const no = phoneNumberFormatter("6282113978123");
  const client = sessions.find(sess => sess.id == sender_number).client;
  client.sendMessage(chatId, message).then(response => {
    
    console.log(response);
  }).catch(err => {
     
    console.log(err);
  });
};

const kirim_media_group  = async function(sender_number,groupName,fileUrl,fileName,message){ 
  
    const group = await findGroupByName(groupName,sender_number);
    if (!group) {
      console.log("group : "+group+" tidak ditemukan!");
      return false;
    }
    chatId = group.id._serialized;
    console.log(chatId);
   
  let mimetype;
  const attachment = await axios.get(fileUrl, {
  responseType: 'arraybuffer'
  }).then(response => {
     
  mimetype = response.headers['content-type'];
  return response.data.toString('base64');
  });
  const media = new MessageMedia(mimetype, attachment, fileName);


  const client = sessions.find(sess => sess.id == sender_number).client;
  client.sendMessage(chatId,media,{ caption:message }).then(response=>{
    
    console.log(response);
  }).catch(err => {
    
    console.log(err);
  });
};


const findGroupByName = async function(name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat => 
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = req.body.id;
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Clearing message on spesific chat
app.post('/clear-message', [
  body('number').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  const chat = await client.getChatById(number);
  
  chat.clearMessages().then(status => {
    res.status(200).json({
      status: true,
      response: status
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  })
});





const updateStatusMessage = async function(dataID){  
  var linkapi = "https://konekwa.com/api/updateStatusMessage";   
  const hasil = await axios.get(linkapi,{ 
      params :{		apikey : "2345678",
              dataID : dataID 
          }
  }).then(response => {  
  return response.data; 
  }).catch(err=>{
  return false;
  });
  
}

const intervalSendtext = async function(){
  // return false;
  //jalankanAwal();
const fileUrl = "https://konekwa.com/api/getDataMessage?apikey=2345678";  
  const hasil = await axios.get(fileUrl,{}).then(response => {  
  return response.data; 
  }).catch(err=>{
  return false;
  });

 if(hasil.dataID){
   await updateStatusMessage(hasil.dataID);
 }else{
   return false;
 }


 var i =1;
 var result = hasil.data;
 if(result){
  
  await	result.forEach(element => { 
    if (typeof element.id === 'undefined') {
      console.log("no message!"+element.id);
      console.log(element);
     return false;
    }
    console.log("message ready:",element.type);
    id         			  = element.id;
    no_tujuan 			  = element.no_tujuan;
    senderNumber 	  	= element.sender_number;
    msg 		        	= element.msg;
    type 		        	= element.type;
    urlField          = element.url;
    groupName         = element.group;
    fileName          = element.nama_file;
    no_tujuan        	= phoneNumberFormatter(no_tujuan);  
    if(type==1){
      kirim_teks(no_tujuan,msg,senderNumber,id); 
    }else if(type==2){
      kirim_image(no_tujuan,msg,senderNumber,urlField,fileName,id); 
    }else if(type==3){ // text group
      kirim_teks_group(senderNumber,groupName,msg);
    }else if(type==4){ //// media group
      kirim_media_group(senderNumber,groupName,urlField,fileName,msg);
    }else if(type==5){
      let button = new Buttons('Ini adalah eksperimen ke sekian kalinya, memunculkan tombol kedalam pesan',[{body:'Biasa aja'},{body:'Engga ah'},{body:'lumayan lah!'}],'Test whatsapp','gimana keren ga? ');
      kirim_teks("6285221288210@c.us",button,"6282128258250","9"); 
    }else{
      kirim_file(no_tujuan,msg,senderNumber,urlField,fileName,id); 
    }
    
    i++;
  }); 
 }

}




const checkInbox = async function(to,f,pesan){
		 
  const fileUrl = "https://konekwa.com/api/checkInbox?apikey=2345678";
  var params = {to:to,from:f,pesan:pesan};
  const hasil = await axios.get(fileUrl,{params}).then(response => {  
  
  var sender = response.data['data'].sender;
  var replay = response.data['data'].pesan;
  var nomor = f;
  if(replay){
      const client = sessions.find(sess => sess.id == sender).client;
      client.sendMessage(f,replay).then(response=>{
      try{
          return true;
        }catch(e) {
           return false;
          }
        });
  } return true;
  
  }).catch(err=>{
    //console.log(err);
  return false;
  
  });
  
 
}


const cekInstruksi = async function(){
  //jalankanAwal();
const fileUrl = "https://konekwa.com/api/cekInstruksi?apikey=2345678";  
  const hasil = await axios.get(fileUrl,{}).then(response => {  
  return response.data["data"]; 
  }).catch(err=>{
  return false;
  });
console.log(hasil);

  var result = hasil;
  if(result){
   await	result.forEach(element => { 
     instuksi 			    = element.instruksi;
     to 			      	= element.to;
     msg 		        	= element.pesan;  
    if(instuksi=="create_session"){
      createSession(to);
    }



    const ffilee = "https://konekwa.com/api/hapusInstruksi?apikey=2345678";  
    const hasils =   axios.get(ffilee,{id:element.id}).then(response => {  
    return response.data; 
    }).catch(err=>{
    return false;
    });


   }); 
  }
}

const updateGroup = async function(link,datagroup){ //new
  var sessions = JSON.stringify(sessions);
  const fileUrl = link;
    const hasil = await axios.get(fileUrl,{params:{apikey:234567,data:datagroup}}).then(response => {  
      console.log("success update group : "+link+" - Data:"+datagroup);
    }).catch(err=>{
      console.log(err);
    }); 
}

const updateMessageStatus = async function(from,to,ack){  
  var linkapi = "https://konekwa.com/api/updateMessageStatus";   
  const hasil = await axios.get(linkapi,{ 
      params :{		apikey		   : "2345678",
              from	   : from,
              to       : to,
              ack      : ack
          }
  }).then(response => {  
    console.log("message sts "+ack+" from :"+from+" to:"+to);
  return response.data; 
  }).catch(err=>{
  return false;
  });
}











setTimeout(function(){
	jalankanAwal();
},100);
 
	setInterval(function(){ 
    intervalSendtext();
    console.log("get Message for send");
  }, 5000);

const jalankanAwal = async function(){  
  var linkapi = "https://konekwa.com/api/updateStatusOffDevice";   
  const hasil = await axios.get(linkapi,{ 
      params :{		apikey : "2345678",sender_number:sender_number }
  }).then(response => {  
   console.log(response['data']);
  }).catch(err=>{
    console.log(response);
  return false;
  });
}

sessions.push({
  id: sender_number,
  client: client
});


} //end create session ############### yang butuh client



 
const init =  async  function(socket) {

  // client.initialize();
  // console.log(socket);
const savedSessions =  await  getSessionsFile().then(function(result){
  return result;
});
  // console.log(savedSessions);
  if (savedSessions.length > 0) {
    if (socket) {
      socket.emit('init', savedSessions);
    } else {
      var datasesi=savedSessions;
      datasesi.forEach(sess => {
        createSession(sess.sender_number);
      });
    }
  }else{
    console.log("device tidak tersedia.");
  }
}

init();





server.listen(port, function() {
  console.log('App running on *: ' + port);
});


const net = require('net');
const fs = require("fs");
const path = require('path');
const Crypto = require('crypto');

const qa = require("./qa");
const port = 8124;
let i = 0;
if (!fs.existsSync("./qa.json")) {
	console.log("no json");
	return;
}

const server = net.createServer(client => {
    client.id = Date.now() + i;
    i++;
    console.log(`Client id = ${client.id} connected`);
    client.setEncoding('utf8');

    client.on("data", data => {
      let parseData = JSON.parse(data);
      switch(parseData.type){
        case qa.copy:
        {
          console.log(`COPY client`);
          client.write(qa.ask, "UTF-8");
          break;
        }
        case qa.copyStart:
        {
          let newPath = `${parseData.destPath}//${parseData.fileName}`;
          if (!fs.existsSync(parseData.destPath)) fs.mkdirSync(parseData.destPath);
          let readStream = fs.createReadStream(parseData.inputPath);
          readStream.pipe(fs.createWriteStream(newPath));
          console.log(`Client ${client.id} copy ${parseData.fileName}`);
          client.write("Copy Success");
          break;
        }
        case qa.encodeStart:
        {
          console.log(`ENCODE ${parseData.destPath}, ${parseData.fileName}`);
          let fileExt = path.extname(parseData.fileName);
          let fileWithoutExt = path.basename(parseData.fileName, path.extname(parseData.fileName));
          let newPathWithFileName = `${parseData.destPath}//${fileWithoutExt}_encode${fileExt}`;

          let readStream = fs.createReadStream(parseData.inputPath);
          let writeStream = fs.createWriteStream(newPathWithFileName);
          let cryptStream = Crypto.createCipher("aes192", parseData.key);
          readStream.pipe(cryptStream).pipe(writeStream);
          client.write("Encode Success");
          break;
        }
        case qa.decodeStart:
        {
          let fileExt = path.extname(parseData.fileName);
          let fileWithoutExt = path.basename(parseData.fileName, path.extname(parseData.fileName));
          let newPathWithFileName = `${parseData.destPath}//${fileWithoutExt}_decode${fileExt}`;
      
          let readStream = fs.createReadStream(`${parseData.destPath}/${fileWithoutExt}_encode${fileExt}`);
          let writeStream = fs.createWriteStream(newPathWithFileName);
          let cryptStream = Crypto.createDecipher("aes192", parseData.key);
          readStream.pipe(cryptStream).pipe(writeStream);
          client.write(qa.dec);
          break;
        }
      }
    });
      
      client.on("end", () => {
        //sockets = sockets.filter(socket => socket.id !== client.id);
        console.log(`Client id = ${client.id} disconnected`)
      });
    });
    

    server.listen(port, () => {
      console.log(`Server listening on localhost:${port}`);
    });
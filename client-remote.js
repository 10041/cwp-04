const net = require('net');
const fs = require('fs');
const qa = require("./qa");
const path = require("path");
const port = 8124;

const client = new net.Socket();

client.setEncoding('utf8');


let inputPath = process.argv[2];
let destPath = process.argv[3];
let key = process.argv[4]; 

let stat = fs.statSync(inputPath);
if (inputPath == undefined) {
    console.log("Please, input dir path!");
    return;
} 
else if(!fs.existsSync(inputPath)) {
    console.log("Incorrect dir path!");
    return;
}
else if(stat.isDirectory()){
    console.log("Only files!");
    return;
}

client.connect(port, function() {
    console.log('Connected');
    client.write(qa.copy);
});

client.on('data', data => {
    if(data === qa.ask){
        client.write(JSON.stringify({
            inputPath, 
            destPath, 
            fileName: path.basename(inputPath)
        }));
        console.log('COPY sented');
    }
    else if(data === "Copy Success"){
        console.log("copy Success");
        client.write(JSON.stringify({
            inputPath, 
            destPath, 
            fileName: path.basename(inputPath),
            key
        }));
        console.log('ENCODE sented');
    }
    else if(data === "Encode Success"){
        console.log("copy Success");
        client.write(JSON.stringify({
            inputPath, 
            destPath, 
            fileName: path.basename(inputPath),
            key
        }));
        console.log('DECODE sented');
    }
    else if (data === "File saved") {
        sendFiles();
    }
    else if(data === qa.dec){
        console.log("Server refused");
        client.destroy();
    }
});

client.on('close', () => {
    console.log('Connection closed');
});
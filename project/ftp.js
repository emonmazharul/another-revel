const ftp = require("basic-ftp");
const { v4: uuidv4 } = require('uuid');
const myCsvReadStream = require('./csvReadableStream');

async function uploadFile(csv,host,user,password) {
    const client = new ftp.Client()
    try {
        await client.access({
            host,
            user,
            password,
            secure: false
        })
        const Filestream = myCsvReadStream(csv);
        const readableStream = new Filestream();
        const fileName = uuidv4().slice(5,13)+'.csv';
        await client.uploadFrom(readableStream, fileName);
        return {isUploaded:'uploaded the file successfully to ftp server '+ 'filename is ' + fileName}
    }
    catch(err) {
        console.log(err);
        return {errorMsg:err.message};
    }
    client.close()
}

module.exports = uploadFile;
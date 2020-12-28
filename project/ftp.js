const ftp = require("basic-ftp");
const { uuid } = require('uuidv4');

async function uploadFile(host,user,password) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host,
            user,
            password,
            secure: false
        })
        const fileName = uuid().slice(5,13)+'.csv';
        await client.uploadFrom("latestFile.csv", fileName);
        return {isUploaded:'uploaded the file successfully to ftp server'}
    }
    catch(err) {
        console.log(err);
        return {errorMsg:err.message};
    }
    client.close()
}

module.exports = uploadFile;
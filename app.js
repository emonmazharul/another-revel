const express = require('express');
const fs = require('fs/promises');
const path =  require('path');
const cors = require('cors')
const product_scraper = require('./project/scrap_product.js');
const uploadFile = require('./project/ftp');
const createCSVFile = require('./project/obj');
let global_response;
const app = express();

const publicPath = path.join(__dirname, '/public');
// console.log(path.resolve(__dirname+'/public'),publiPath)

app.use(cors({origin:true}))
app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(express.static(publicPath) );
const indexPath = path.join(__dirname,'/index.html');
const mainJsPath = path.join(__dirname,'/main.js');


app.post('/product_data', async (req,res) => {
  const {url,username,password,mall_code,tenant_code,start_date,end_date,ftp_url,ftp_username,ftp_password} = req.body;
  let errorMsg;
  try {
    const {status,response,errorMsg} = await product_scraper(url,username,password,start_date,end_date);

    if(!status) {
     // errorMsg = {errorMsg.};
     throw new Error(errorMsg);
    }
    const csv = createCSVFile(response,mall_code,tenant_code);
    global_response = csv;
    res.status(201).send('data is fetched.Choose a option below.');
  } catch (e) {
    console.log('error in product_data request', e);
    res.status(404).send(e.message);
  }
})

app.post('/uploadfile', async (req,res) => {
  const {ftp_url,ftp_username,ftp_password} = req.body 
  try {
    const {isUploaded,errorMsg} = await uploadFile(global_response,ftp_url,ftp_username,ftp_password);
    if(!isUploaded) throw new Error(errorMsg);
    res.status(201).send(isUploaded) 
  } catch (e) {
    res.status(404).send(e.message);
  }
});

app.get('/download', async (req,res) => {
  res.send(global_response);
})

app.post('/user', async (req,res) => {
  try {
    const json = await fs.readFile('credential.json');
    const data = JSON.parse(json);
    data.push({...req.body});
    await fs.writeFile('credential.json', JSON.stringify(data));
    res.status(201).send('created');
  } catch (e) {
    console.log(e);
    res.status(404).send({errorMsg:e.message});
  }
})

module.exports = app;
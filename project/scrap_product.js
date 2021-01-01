const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const {Parser} = require('json2csv');

async function product_scraper(url,username,password,start_date,end_date) {
	// const url = window.URL.createObjectURL(new Blob([json]));
	try {
		const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://cavemen.revelup.com', {waitUntil: 'networkidle0', timeout: 0,});
    
	  await page.type('.auth0-lock-input-username > div:nth-child(1) > input:nth-child(2)', username); //gto_paulanerbrauhaussg
	  await page.type('.auth0-lock-input-password > div:nth-child(1) > input:nth-child(2)',password); 
		await page.click('.auth0-label-submit');
		await page.waitForNavigation({waitUntil:'networkidle0', timeout:60000});

		if(!page.url().includes('dashboard')) throw new Error('deverror Please check your username and password')
		
		if(page.url().includes('reset')) {
			throw new Error('deverror Please reset your password first');
		}
		let cook = '';
		const cookies = await page.cookies();
		for(let i=0;i<cookies.length;i++) {
			cook = cook + `${cookies[i].name+'='+cookies[i].value}; `
		}
		const {data:{ objects: response,error:jsonError } } = await axios.get(`https://${url}.revelup.com/resources/OrderAllInOne/?limit=0&created_date__gte=${start_date}T06:00:00&created_date__lte=${end_date}T06:00:00`, {
			headers: {
				Cookie:cook,
			}
		});
		if(jsonError) throw new Error(jsonError);
		if(!Array.isArray(response)) throw new Error("couldn't find data for given data");
		if(!response.length) throw new Error("couldn't find data for given data");
		await browser.close();
		// console.log(response)
		return {status:'ok', response:response};
	} catch (e) {
			console.log(e);
			if(e.message.includes('Navigation timeout') ) return {errorMsg:'Your password or username is  incorrect. please check it and try again.'}; 
	  	if(e.message.includes('deverror')) return {errorMsg: e.message.replace('deverror', '')};
	    return {
	    	errorMsg:e.message,
	  	};
	}
}

module.exports = product_scraper;
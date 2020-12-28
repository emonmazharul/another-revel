const fs = require('fs');
const {Parser} = require('json2csv');

// let MALL_CODE = "AST2";
let Days = 1;
// let TENANT_CODE = "0205A";

// Hour values between 0 - 23
let BUSINESS_HOUR_START = 0;

let sevenDigitString = "8000276";
let twoDigitString = "20";

let lag = 0;
let date = new Date();

let dateYesterday = new Date();
dateYesterday.setDate(dateYesterday.getDate() - lag - Days);
date.setDate(date.getDate() - lag - Days);
//dateYesterday.setDate(30);
//dateYesterday.setMonth(7);

let yesterdayDate = dateYesterday.getDate();
yesterdayDate = yesterdayDate;
let startD = dateYesterday.getDate();

const json2csvParser = new Parser();
function createCSVFile(objects,MALL_CODE,TENANT_CODE) {
      const arr = [];
      for(let i=0;i<objects.length; i++) {
        const obj = objects[i];
        let reportingNum = obj.reporting_id || "N/A";
        let orderNum = obj.resource_uri.split("/")[3]; //"resource_uri": "/resources/Order/209026/"
        let offlineNum = orderNum; // based on example data, it almost always is same 
        let createdBy = "User " + obj.created_by.split("/")[3]; //"created_by": "/enterprise/User/207/"
        let firstOpened = obj.opened || obj.created_date; //2017-06-17T11:11:46
        let lastClosed = (typeof obj.closed === 'string') ?  obj.closed : "N/A";
        let discountAmount = obj.discount_amount ? obj.discount_amount : 0;
        let tax = obj.tax ? obj.tax : 0;
        let serviceFee = obj.service_fee_taxed ? obj.service_fee_taxed : 0;
        let finalTotal = obj.final_total ? obj.final_total : 0;
        let paymentsTotal = finalTotal ;
        let payment_type = obj.payment_type || '0';
        let card_type = obj.card_type || '0';
        // combine finalTotal or payMents total for every hour
        let dayDate = parseInt(firstOpened.split("T")[0].split("-")[2]);
        let hr = firstOpened.split("T")[1].split(":")[0];
        hr = parseInt(hr);
        let dayShift = (dayDate > startD) ? 24 : 0;
        let hrShifted = (hr - BUSINESS_HOUR_START) + dayShift;
        let TILL_NUMBER = "1";
        let SALES_DATE = obj.created_date ? obj.created_date : "";    
        let GST = tax;
        let GROSS_SALES_VALUE = finalTotal + discountAmount + Number(serviceFee);
        let SALES_MISC_VALUE = 0;
        let SERVICE_CHARGE = serviceFee;
        let NET_SALES_VALUE = finalTotal - serviceFee - tax;
        let RECEIPT_NUMBER = offlineNum;
        let RESERVE_COLUMN = 1;
        let TOTAL_SOLD_QTY = Math.ceil(finalTotal / 15);
        let TOTAL_DISCOUNT_QTY = (discountAmount > 0) ? 1 : 0;
        let TOTAL_DISCOUNT_VALUE = obj.discount_total_amount;
        let CASH = finalTotal;
        let NETS = (payment_type == 6 && card_type == 5) ? (finalTotal + GST) : 0;
        let CREDIT_CARD = (payment_type == 6 && card_type != 5) ? (finalTotal + GST) : 0;
        let DEBIT_CARD = 0;
        let ASIA_SQUARE_VOUCHER = 0;
        let VOUCHER = 0;
        let CHEQUE = 0;
        let OTHERS = 0;
        let TOTAL_ITEMISED_VOID_VALUE = 0;
        let TOTAL_ITEMISED_VOID_QTY = 0;
        let TOTAL_TRANSCACTION_VOID_QTY = 0;
        let TOTAL_TRANSACTION_VOID_VALUE = 0;
        let TOTAL_VALUE_FOR_CATERING_AND_TAKEAWAY = 0;
        arr.push({
            'MALL CODE': MALL_CODE,
            'TENANT CODE' : TENANT_CODE,
            'TILL NUMBER':TILL_NUMBER,
            'SALES DATE':SALES_DATE,
            'GROSS SALES VALUE':GROSS_SALES_VALUE.toFixed(2),
            'GST':GST.toFixed(2),
            'SALES MISC VALUE':SALES_MISC_VALUE.toFixed(2),
            'SERVICE CHARGE':Number(SERVICE_CHARGE).toFixed(2),
            'NET SALES VALUE':NET_SALES_VALUE.toFixed(2),
            'RECEIPT NUMBER':RECEIPT_NUMBER,
            'RESERVE COLUMN':RESERVE_COLUMN,
            'TOTAL SOLD QTY':1,
            'TOTAL DISCOUNT QTY':1,
            'TOTAL DISCOUNT VALUE':Number(TOTAL_DISCOUNT_VALUE).toFixed(2), //> 0 ? TOTAL_DISCOUNT_VALUE : (0).toFixed(2),
            'CASH':CASH.toFixed(2),
            'NETS':NETS.toFixed(2),
            'CREDIT CARD':CREDIT_CARD.toFixed(2),
            'DEBIT CARD':DEBIT_CARD.toFixed(2),
            'ASIA SQUARE VOUCHER':ASIA_SQUARE_VOUCHER.toFixed(2),
            'CHEQUE':CHEQUE.toFixed(2),
            'OTHER VOUCHERS':VOUCHER.toFixed(2),
            'OTHERS':OTHERS.toFixed(2),
            'TOTAL ITEMISED VOID QTY':TOTAL_ITEMISED_VOID_QTY,
            'TOTAL ITEMISED VOID VALUE':TOTAL_ITEMISED_VOID_VALUE.toFixed(2),
            'TOTAL TRANSCACTION VOID QTY':TOTAL_TRANSCACTION_VOID_QTY,
            'TOTAL TRANSACTION VOID VALUE':TOTAL_TRANSACTION_VOID_VALUE.toFixed(2),
            'TOTAL VALUE FOR CATERING':TOTAL_VALUE_FOR_CATERING_AND_TAKEAWAY.toFixed(2),
        }) 
      }
    let csv = json2csvParser.parse(arr);
    const lastIndex = csv.indexOf('TOTAL VALUE FOR CATERING');
    csv = csv.slice(lastIndex+25,).replace(/\"/g, '').slice(2,);
    fs.writeFile('latestFile.csv', csv, (err) => {
        if(err) console.log('file save error',err);
        console.log('file saved')
    })
}

module.exports = createCSVFile;


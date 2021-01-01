const { Readable } = require('stream');

function myCsvReadStream(data) {
  class Counter extends Readable {
    constructor(opt) {
      super(opt);
    }

    _read(n) {
      // console.log(n);
      this.push(data);
      this.push(null);
    }
  }
  return Counter;
}

// let One =  MyCsvReadStream('hello world')
// console.log(One);
// let two = new One() 
module.exports = myCsvReadStream;


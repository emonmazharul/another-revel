const server = require('./app');

const port = process.env.PORT || 5000;

server.listen(port, (err) => {
	if(err) console.log(err);
	console.log('server listening on port '+ port);
});
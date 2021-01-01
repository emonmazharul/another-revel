const form = document.querySelector('form');
const start_date_info = document.querySelector('#start_date_info');
const error_text = document.querySelector('#error_text');
const btn = document.querySelector('button');
const download_button = document.querySelector('#download_button');
const upload_button = document.querySelector('#upload_button');
// const saveTask_button = document.querySelector('#saveTask_button');
const server_info = document.querySelector('#server_info');
const srever_error = document.querySelector('#server_error');
let global_response;
let global_user_data = {};


function dateChcker(start_date){
	const currentDateArr = new Date().toLocaleDateString().split('/');
	const currentDate = currentDateArr[2] +'-' + currentDateArr[1] + '-'+ currentDateArr[0]
	if(start_date === currentDate ){
		console.log('error')
		start_date_info.textContent = "You can't get data of this date";
		return false;
	}
	start_date_info.textContent = "";
	return true;
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const url = e.target.elements.url.value;
	const username = e.target.elements.username.value;
	const password = e.target.elements.password.value;
	const start_date = e.target.elements.start_date.value;
	const mall_code = e.target.elements.mall_code.value;
	const tenant_code = e.target.elements.tenant_code.value;
	const ftp_url = e.target.elements.ftp_url.value;
	const ftp_username = e.target.elements.ftp_username.value;
	const ftp_password = e.target.elements.ftp_password.value;
	// console.log(url,ftp_url,ftp_username,ftp_password,mall_code,tenant_code)
	if( !dateChcker(start_date)) {
		return;
	}
	let end_date = Number(start_date.slice(8,)) + 1;
	end_date < 10 ? (end_date = '0'+end_date) : (end_date = end_date+'')
	const created_date_lte = start_date.slice(0,8)+end_date;
	global_user_data = {...global_user_data,url,username,password,start_date,end_date,mall_code,tenant_code,ftp_url,ftp_username,ftp_password};

	btn.disabled = true;
	upload_button.disabled = true;
	download_button.disabled = true;
	error_text.className = '';
	error_text.classList.add('text-primary')
	error_text.textContent = 'Loading...';
	server_info.textContent = '';
	server_error.textContent = '';
	axios.post('/product_data', {
		url,
		username,
		password,
		start_date,
		end_date:created_date_lte,
		mall_code,
		tenant_code,
		ftp_url,
		ftp_username,
		ftp_password,
	})
	.then(res => {
		const json  = res.data;
		error_text.className = '';
		error_text.classList.add('text-primary')
		error_text.textContent = json;
    btn.disabled = false;
		global_response = json;
		download_button.disabled = false;
		upload_button.disabled = false;
	})
	.catch(e => {
		console.log(e.response)
		btn.disabled = false;
		error_text.textContent = '';
		error_text.className = '';
		error_text.classList.add('text-danger');
		// download_button.disabled = false;
		// upload_button.disabled = false;
		error_text.textContent = e.response.data ||  `Failed to get your desire data.Check your username,password and network connection. Finally check weather you have to reset your password or your ip address is blocked by them.`;
	})
})


download_button.addEventListener('click', (e) => {
	axios.get('/download')
		.then(res => {
			const url = URL.createObjectURL(new Blob([res.data]));
			const downloadLink = document.createElement('a');
			downloadLink.href = url;
			const fileName = Math.random() + 'date'+ new Date().toLocaleDateString().replace('/','_')+
			'.csv'; 
			downloadLink.setAttribute('download', fileName);
			downloadLink.click();
			download_button.disabled = true;
		})
		.catch(e => {
			server_error.textContent = e.response.data || 'please try again.server failed to perform';
		})
})

upload_button.addEventListener('click', (e) => {
	server_info.textContent = 'uploading...';
	server_error.textContent = '' 
	axios.post('/uploadfile',{
		ftp_url:global_user_data.ftp_url,
		ftp_username:global_user_data.ftp_username,
		ftp_password:global_user_data.ftp_password,
	})
		.then(res => {
			server_info.textContent = res.data;
			upload_button.disabled = true;
		})
		.catch(e => {
			console.log(e);
			upload_button.disabled = true;
			server_error.textContent = e.response.data || 'please try again.server failed to perform';
			server_info.textContent = 'reenter the input again then submit it another time';
		})
})


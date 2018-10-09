function postX(datax){
	$.ajax({
		type:'POST',
		data: JSON.stringify(datax),
		contentType: 'application/json',
		url: '/logs',
	});
}
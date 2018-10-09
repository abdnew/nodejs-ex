var socket=io.connect('127.0.0.1:3000');
socket.on('logs',function(data){
console.log(data[0]);
  for (var i=0;i<data[0].length;i++){
    var tr=`<tr><td>${data[0][i].time}</td><td>${data[0][i].display_name}</td><td>${data[0][i].type}</td><td>${data[0][i].ammount}</td><td>${data[0][i].message}</td></tr>`;
    $("#tbllogs").append(tr);
  }
});
socket.on('update',function(data){
  console.log(data);
  var tr= `<tr><td>${data.time}</td><td>${data.display_name}</td><td>${data.type}</td><td>${data.ammount}</td><td>${data.message}</td></tr>`;
  $(tr).insertAfter('#tbltitle');
}); 

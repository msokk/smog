$(document).ready(function() {
  $('#txtBox').focus();
  
  var socket = new io.Socket();
  socket.connect();
  socket.on('message', function(data){
    //var d = new Date();
    receiveMsg(data);
  });
  
  $("#sendBtn").click(function() { sendMsg(); });
  $('#txtBox').keypress(function(event) {
    if (event.which == '13') {
       sendMsg();
       $('#txtBox').focus();
    }
  });
  
  var receiveMsg = function(data) {
    $('<li class="message">'+
    '<span id="timestamp"></span>'+
    '<span id="name">'+data.name+'</span>:'+
    '<span id="content">'+data.msg+'</span>'+
    '</li>')
      .prependTo('#container ul')
      .fadeIn(); 
  };
  
  var sendMsg = function() {
    var obj = { name: $("#nameBox").val(), msg : $("#txtBox").val() };
    socket.send(obj);
    receiveMsg(obj);
    $("#txtBox").val("");
  };
});
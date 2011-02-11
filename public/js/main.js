$(document).ready(function() {
  $('#txtBox').focus();
  
  var socket = new io.Socket();
  socket.connect();
  socket.on('message', function(data){
    console.log(data);
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
      .appendTo('#container ul')
      .fadeIn();
      $('#content').scrollTop($('ul').height());
  };
  
  var sendMsg = function() {
    var obj = { name: $("#nameBox").val(), msg : $("#txtBox").val() };
    if($("#txtBox").val() == "test") {
      socket.send({ 
        type: "login-request", 
        data : {
          username : $("#nameBox").val()
        }
      })
    } else {
      socket.send(obj);
    }
    $("#txtBox").val("");
  };
});

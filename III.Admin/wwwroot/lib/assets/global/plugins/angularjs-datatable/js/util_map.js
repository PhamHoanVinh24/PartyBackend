/**
 * Created by Anubis on 27-Jun-17.
 */
function Queue(){
    this.queue = [];
}

Queue.prototype.enqueue = function(item){
    this.queue.push(item);
}

Queue.prototype.dequeue = function(){
    return this.queue.shift();
}

Queue.prototype.size = function(){
    return this.queue.length;
}

Queue.prototype.peak = function(){
    return (this.queue[0] !== null) ? this.queue[0] : null;
}

fm.util.addOnLoad(function () {
receiveQueue= new Queue();
senderQueue= new Queue();
allClient={};
viewAllClient= function(allClient){
    for (var item in allClient){
        console.log("object: "+Object.getOwnPropertyNames(item));
        console.log("client id: "+item.clientId);
        console.log("client name: "+item.name);
    }

}

var webSyncUrl = 'http://117.6.131.222:8089/websync.ashx';
fm.websync.client.enableMultiple=true;
 createClient= function(clientName){
    var clientObject={};
    var clt= new fm.websync.client(webSyncUrl);
    clientObject.client=clt;
    clientObject.name=clientName;


    clientObject.connect = function(){
        clientObject.client.connect({
            onSuccess: function (args) {
                console.log("connect success :"+args._client._clientId._guid);
                clientObject.clientId= args._client._clientId._guid;
                allClient[clientName]=clientObject;
           

            },
            onFailure: function (args) {

            }
        });
    }


     clientObject.notify = function(clientId){
        clientObject.client.notify({
            clientId: clientId,
            data: 'Hello, this is WebSync.',
            onSuccess: function(args) {
                fm.util.log('Sent data to client.');
            },
            onFailure: function(args) {
                fm.util.log('Could not send data to client.');
                fm.util.log(args.getException().message);
            }
        });
    }




     clientObject.subcribe = function(channel){
        clientObject.client.subscribe({
            channel: '/'+channel ,
            onSuccess: function (args) {
                console.log("subcribe success: ");
            },
            onFailure: function (args) {
                console.log("subcribe failed: "+args.channel);
            },
            onReceive: function (args) {

            }
        });
    }

    clientObject.unsubcribe= function (channel) {
        clientObject.client.unsubscribe({
            channel: '/' + channel,
            onSuccess: function (args) {
                console.log("unsubcribe success: "+args.channel);
                //	util.log('subcribe success to WebSync.')
            },
            onFailure: function (args) {
                console.log("unsubcribe failed: "+args.channel);
            }

        });
    }

    clientObject.sendMessage= function(message, channel){
        clientObject.client.publish({
            channel: '/' + channel,
            data: message,
            onSuccess: function (args) {
                console.log("send success");
             ///   util.clear(dom.text);
            }
        });
    }

     clientObject.connect();
     // clientObject.addOnNotify(function(args) {
     //    console.log("get data notify");
     //            });
      

   return clientObject;

}



//Tạo class client cho tài xế
 createClientDriver= function(clientName){
    var clientObject={};
    var clt= new fm.websync.client(webSyncUrl);
    clientObject.client=clt;
    clientObject.name=clientName;



    clientObject.connect = function(){
        clientObject.client.connect({
            onSuccess: function (args) {
                console.log("Driver connect success :"+args._client._clientId._guid);
                clientObject.clientId= args._client._clientId._guid;
                allClient[clientName]=clientObject;
           

            },
            onFailure: function (args) {

            }
        });
    }


     clientObject.notify = function(clientId){
        clientObject.client.notify({
            clientId: clientId,
            data: 'Hello, this is WebSync.',
            onSuccess: function(args) {
                fm.util.log('Sent data to client.');
            },
            onFailure: function(args) {
                fm.util.log('Could not send data to client.');
                fm.util.log(args.getException().message);
            }
        });
    }




     clientObject.subcribe = function(channel){
        clientObject.client.subscribe({
            channel: '/'+channel ,
            onSuccess: function (args) {
                console.log("subcribe success: ");
            },
            onFailure: function (args) {
                console.log("subcribe failed: "+args.channel);
            },
            onReceive: function (args) {
                if(args.getData().type ==3 && clientObject.status == args.getData().code){
                            var id=clientObject.id;
                            var user_id=args.getData().type.user_id;
                            document.getElementById("getOrder"+id).style.display='none';
                            document.getElementById("accept"+id).style.display='none';
                            document.getElementById("deny"+id).style.display='none';
                            document.getElementById("received"+id).style.display='none';
                            document.getElementById("cancel"+id).style.display='none';

                            var statuslog = "(Available)Deny order from user: "+user_id ;
                            var orderCode = +user_id ;
                            var onelog= addLog(id,statuslog,orderCode);
                            $('#logtable').append(onelog);
                            changeStatusById(id);
                }
               if(args.getData().type ==1 && clientObject.status == 0){
                        // userReceiveQueue.enqueue(args.getData());
                        // console.log("size data:" +userReceiveQueue.size());
                        orderBooking = args.getData();
                        code =orderBooking.code;
                        id = clientObject.id;
                        var statuslog = "(Busy) Get order from user: "+orderBooking.user_id ;
                        var orderCode = orderBooking.code;
                        var onelog= addLog(id,statuslog,orderCode);
                        $('#logtable').append(onelog);                      
                        changeStatusById(id,code);
                        console.log("dataDriver.id:" +id);
                        document.getElementById("getOrder"+id).style.display='block';
                        document.getElementById("accept"+id).style.display='block';
                        document.getElementById("deny"+id).style.display='block';

                        // console.log("(Busy) Get order from user: "+orderBooking.user_id);
                        // document.getElementById("accept"+id).setAttribute("user_id", orderCode);
                        // document.getElementById("deny"+id).setAttribute("user_id", orderCode);
                        // document.getElementById("deny"+id).setAttribute("class", "btn btn-warning got");
                        // document.getElementById("received"+id).setAttribute("user_id", orderCode);
                        // document.getElementById("cancel"+id).setAttribute("user_id", orderCode);
                        // document.getElementById("complete"+id).setAttribute("user_id", orderCode);                        
                    }
            }
        });
    }

    clientObject.unsubcribe= function (channel) {
        clientObject.client.unsubscribe({
            channel: '/' + channel,
            onSuccess: function (args) {
                console.log("unsubcribe success: "+args.channel);
                //  util.log('subcribe success to WebSync.')
            },
            onFailure: function (args) {
                console.log("unsubcribe failed: "+args.channel);
            }

        });
    }

    clientObject.sendMessage= function(message, channel){
        clientObject.client.publish({
            channel: '/' + channel,
            data: message,
            onSuccess: function (args) {
                console.log("send success");
             ///   util.clear(dom.text);
            }
        });
    }

     clientObject.connect();
     // clientObject.addOnNotify(function(args) {
     //    console.log("get data notify");
     //            });
      

   return clientObject;

}

//Kết thúc tạo class clinet cho tài xế










});


var pushOneLonLat= function(id,lonlat,bear){
    message.id=id;
    message.lonlat=lonlat;
    message.username="killer "+id;
    util.send(message);

}

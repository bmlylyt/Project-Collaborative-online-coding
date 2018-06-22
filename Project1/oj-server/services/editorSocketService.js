const redisClient = require('../module/redisClient');
const TIME_IN_SECONDS = 3600;

module.exports = function(io){
    var collaboration = {};
    var socketIdToSessionId = {};
    var sessionPath = '/editorSocket/';

    io.on("connection", (socket)=>{

        let sessionId = socket.handshake.query['message'];

        socketIdToSessionId[socket.id] = sessionId;

        console.log("session " + sessionId + " is activated");

        if(sessionId in collaboration){
            collaboration[sessionId]['participants'].push(socket.id);
        }else{
            redisClient.get(sessionPath + sessionId, function(data){
                if(data){
                    console.log("retrieve data from Redis to: " + socket.id);
                    collaboration[sessionId] = {
                        'cachedData': JSON.parse(data),
                        'participants': []
                    }
                }else{
                    console.log("creating a new session");
                    collaboration[sessionId] = {
                        'cachedData': [],
                        'participants': []
                    }
                }
                collaboration[sessionId]['participants'].push(socket.id);
            });
        }

        socket.on('change', (delta)=>{
            
            var sessionId = socketIdToSessionId[socket.id];
            if(sessionId in collaboration){
                var participants = collaboration[sessionId]['participants'];
                collaboration[sessionId]['cachedData'].push(['change', delta, Date.now()]);
                for(var i = 0; i < participants.length; i++){
                    if(participants[i] != socket.id){
                        io.to(participants[i]).emit('change', delta);
                    }
                }
                console.log("Change data to " + socketIdToSessionId[socket.id]);
            }else{
                console.log("cannot tie socket id to collaboration");
            }
        });

        socket.on('restoreBuffer', ()=>{
            var sessionId = socketIdToSessionId[socket.id];
            if(sessionId in collaboration){
                var cachedData = collaboration[sessionId]['cachedData'];
                for(var i = 0; i < cachedData.length; i++){
                    socket.emit(cachedData[i][0], cachedData[i][1]);
                }
                console.log("retrieve data from redis");
            }else{
                console.log("cannot find any sessionId in collaboration");
            }
        });

        socket.on('disconnect',()=>{
            let sessionId = socketIdToSessionId[socket.id];
            console.log(socket.id + " disconnect from session " + sessionId);
            let foundAndRemove = false;

            if(sessionId in collaboration){
                let participants = collaboration[sessionId]['participants'];
                let index = participants.indexOf(socket.id);
                if(index >= 0){
                    participants.splice(index, 1);
                    console.log("remove member from participants");
                    foundAndRemove = true;
                    if(participants.length === 0){

                        var key = sessionPath + sessionId;
                        var value = JSON.stringify(collaboration[sessionId]['cachedData']);
                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIME_IN_SECONDS);
                        console.log("Last participant has been remove, committing to Redis");
                        delete collaboration[sessionId];
                    }
                }
                
            }

            if(!foundAndRemove){
                console.log("warning: cannot find the socket.id in collaboration");
            }
        });

    });
}
const redis = require("redis");
const client = redis.createClient();

function set(key, value, callback){
    client.set(key, value, function(err, res){
        if(err){
            console.log(err);
            return;
        }else{
            callback(res);
        }
    });
}

function get(key, callback){
    client.get(key, function(err, res){
        if(err){
            console.log(err);
            return;
        }else{
            callback(res);
        }
    });
}

function expire(time, secondInTime){
    client.expire(time, secondInTime);
}

function quit(){
    client.quit();
}

module.exports = {
    get: get,
    set: set,
    expire: expire,
    quit: quit,
    redisPrint: redis.print
}

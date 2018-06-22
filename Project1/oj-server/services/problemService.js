const ProblemDB = require("../model");

const getProblems = function(){
    return new Promise(function(resolve, reject){
        ProblemDB.find({}, function(err, problems){
            if(err){
                reject(err);
            }else{
                resolve(problems);
            }
        });
    });
}

const getProblem = function(id){
    return new Promise(function(resolve, reject){
        ProblemDB.findOne({id: id}, function(err, problem){
            if(err){
                reject(err);
            }else{
                resolve(problem);
            }
        });
    });
}

const addProblem = function(newProblem){
    return new Promise(function(resolve, reject){
        ProblemDB.findOne({name:newProblem.name}, function(err, data){
            if(data){
                reject("Problem already exists");
            }else{
                ProblemDB.count({}, function(err, count){
                    newProblem.id = count + 1;
                    let mongoProblem = new ProblemDB(newProblem);
                    mongoProblem.save();
                    resolve(mongoProblem);
                });
            }
        });
    });
}

module.exports = {
    getProblem,
    getProblems,
    addProblem
}



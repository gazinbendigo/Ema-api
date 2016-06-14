/**
 * Created by adm9360 on 17/11/2015.
 */
'use strict';

var util = require('util');
var dsConfig = require.main.require('./config/config.js');
var usHelper = require("underscore");
var datasource = require.main.require('./api/helpers/mssql-datasource.js');
var mysqlds = require.main.require('./api/helpers/mysql-datasource.js');
var EMA_DB = "EMA";

var isSQLServer = false;

module.exports = {
    getHublogs: getHublogs,
    getEnvironments: getEnvironments,
    getApplications: getApplications,
    getServicePerformanceStats: getServicePerformanceStats
};


/*
 Functions in a127 controllers used for operations should take two parameters:

 Param 1: a handle to the request object
 Param 2: a handle to the response object
 */
function getHublogs(req, res, next) {
    //variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    console.log("1.");
    var env = req.swagger.params.env.value;
    if(!env)
    {
        env = "hubld";
    }
    var dbConfig = undefined;
    if(isSQLServer) {
        //MSSQL Server
        dbConfig = dsConfig.HUBDatabase;
        var config = usHelper.findWhere(dbConfig, {name: env.toUpperCase()});
        datasource.searchHubLogs(config, req, function(err, result)
        {
            if(!err)
            {
                res.json(result);
            }
            else
            {
                //console.log(JSON.stringify(err));
                return next(err);
            }
        });
    }
    else {
        //MY SQL - Development environment
        console.log("2.");
        dbConfig = dsConfig.MYSQL;
        console.log(dbConfig);
        if(!usHelper.contains(dbConfig, env)) {
            env = "EMA_DEV";
        }
        var config = usHelper.findWhere(dbConfig, {name: env});
        mysqlds.searchHubLogs(config, req, function(err, result){
            if (!err)
            {
                console.log("3.");
                res.json(result);
            }
            else
            {
                //console.log(JSON.stringify(err));
                console.log(err);
                res.json(err);
            }
        });
    }
}

function getEnvironments(req, res)
{
    var dbConfig = undefined;
    if(isSQLServer) {
        //SQL Server
        dbConfig = dsConfig.EMADatabase;
        var config = usHelper.findWhere(dbConfig, {name: "EMA"});

        datasource.getEnvironments(config, function(err, result){
            if(!err)
            {
                res.json(result);
            }
            else
            {
                //console.log(JSON.stringify(err));
                //console.log(err.code);
                res.json(err);
            }
        });
    }
    else {
        //MY SQL
        dbConfig = dsConfig.MYSQL;
        if(!usHelper.contains(dbConfig, env)) {
            env = "EMA_DEV";
        }
        console.log("a");
        var config = usHelper.findWhere(dbConfig, {name: env});
        mysqlds.getEnvironments(config, function(err, result){
            if (!err) {
                res.json(result);
            }
            else
            {
                //console.log(JSON.stringify(err));
                res.json(err);
            }
        });
    }
}


function getApplications(req, res)
{
    var env = req.swagger.params.env.value;
    if(!env)
    {
        env = "hubld";
    }
    var dbConfig = undefined;
    if(isSQLServer) {
        //MSSQL Server
        dbConfig = dsConfig.HUBDatabase;
        var config = usHelper.findWhere(dbConfig, {name: env.toUpperCase()});
        datasource.getHubConsumers(config, function(err, result)
        {
            if(!err)
            {
                res.json(result);
            }
            else
            {
                //console.log(JSON.stringify(err));
                res.json(err);
            }
        });
    }
    else {
        //MY SQL
        dbConfig = dsConfig.MYSQL;
        if(!usHelper.contains(dbConfig, env)) {
            env = "EMA_DEV";
        }
        var config = usHelper.findWhere(dbConfig, {name: env});
        mysqlds.getHubConsumers(config, function(err, result){
            if (!err) {
                res.json(result);
            }
            else
            {
                //console.log(JSON.stringify(err));
                res.json(err);
            }
        });
    }

}

function getServicePerformanceStats(req, res){
    var env = req.swagger.params.env.value;
    if(!env)
    {
        env = "hubld";
    }
    var dbConfig = undefined;
    var reqId = req.swagger.params.requestId.value;
    //MSSQL Server
    dbConfig = dsConfig.HUBDatabase;
    var config = usHelper.findWhere(dbConfig, {name: env.toUpperCase()});
    datasource.getServicePerformanceStats(config, reqId, function(err, result)
    {
        if(!err)
        {
            res.json(result);
        }
        else
        {
            //console.log(JSON.stringify(err));
            res.json(err);
        }
    });
}

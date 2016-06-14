/**
 * Created by adm9360 on 1/12/2015.
 */
'use strict';
var sql = require("mssql");
const DATA_ERROR = "Database error occurred";

module.exports = {
    searchHubLogs: searchHubLogs,
    getEnvironments: getEnvironments,
    getHubConsumers: getHubConsumers,
    getServicePerformanceStats: getServicePerformanceStats
};

/*
 * There seems to be an issue where javascript may assign an undefined value to an unpopulated parameter in the
 * request which breaks the stored procedure. Setting any undefined values to null ensures acceptable values are
 * parsed.
 */
function extractLogsParamsFromRequest(req, callback)
{
    var startPos = (req.swagger.params.start.value) ? req.swagger.params.start.value:0;
    var resultSetSize = (req.swagger.params.noRecords.value) ? req.swagger.params.noRecords.value:200;
    var reqID = (req.swagger.params.requestId.value) ? req.swagger.params.requestId.value:null;
    var srvID = (req.swagger.params.serviceId.value) ? req.swagger.params.serviceId.value:null;
    var srcName = (req.swagger.params.sourceName.value) ? req.swagger.params.sourceName.value:null;
    var user = (req.swagger.params.userId.value) ? req.swagger.params.userId.value:null;
    var sev = (req.swagger.params.severity.value) ? req.swagger.params.severity.value:null;
    var logCode = (req.swagger.params.logCode.value) ? req.swagger.params.logCode.value:null;
    var date = (req.swagger.params.latestDate.value) ? req.swagger.params.latestDate.value:null;
    var appss = (req.swagger.params.apps.value) ? req.swagger.params.apps.value:null;
    var reqMess = (req.swagger.params.requestMessage.value) ? req.swagger.params.requestMessage.value:null;
    var logMsg = (req.swagger.params.logMessage.value) ? req.swagger.params.logMessage.value:null;
    var errs = (req.swagger.params.errorsOnly.value) ? req.swagger.params.errorsOnly.value:null;
    var ping = (req.swagger.params.includeOlbPing.value) ? req.swagger.params.includeOlbPing.value:null;

    var logsRequest = {
        startIndex: startPos,
        rss: resultSetSize,
        reqeustId: reqID,
        serviceId: srvID,
        sourceName: srcName,
        userId: user,
        severityCode: sev,
        logCode: logCode,
        requestDate: date,
        applications: appss,
        requestMessage: reqMess,
        logMessage: logMsg,
        errorsOnly: errs,
        includeOlbPing: ping
    }
    //console.log(JSON.stringify(logsRequest));
    callback(null, logsRequest);
}

//The mssql npm package expects all parameters to a stored procedure even if the parameter values are null.
function searchHubLogs(datasource, params, cb)
{
    extractLogsParamsFromRequest(params, function(err, result){
        var conn = new sql.Connection(datasource);
        conn.connect().then(function() {
            var request = new sql.Request(conn);
            request.input('startIndex', sql.Int, result.startIndex);
            request.input('resultSizeLimit', sql.Int, result.rss);
            request.input('requestId', sql.Int, result.reqeustId);
            request.input('serviceId', sql.Int, result.serviceId);
            request.input('sourceName', sql.VarChar(50), result.sourceName);
            request.input('userId', sql.VarChar, result.userId);
            request.input('severityCode', sql.VarChar, result.severityCode);
            request.input('logCode', sql.VarChar, result.logCode);
            request.input('requestDate', result.requestDate);
            request.input('applications', sql.VarChar, result.applications);
            request.input('requestMessage', sql.VarChar(100), result.requestMessage);
            request.input('logMessage', sql.VarChar(100), result.logMessage);
            request.input('errorsOnly', sql.Bit, result.errorsOnly);
            request.input('includeOlbPing', sql.Bit, result.includeOlbPing);
            request.execute('pGetHubLogs').then(function (recordSet) {
                conn.close();
                cb(null, recordSet[0]);
            }).catch(function(err){
                var no = (err.number !== null) ? err.number:0;
                var name = (err.name !== null) ? err.name:"";
                var code = (err.code !== null) ? err.code:"";
                var message = (err.message != null) ? err.message:"";
                var errorMessage = "Fatal Error occured. Number: " + no + " Name: " + name + " Code: " + code + " Message: " + message;
                //TODO: create a callback with the error?
                conn.close();
                cb(err, DATA_ERROR);
            });
        }).catch(function(err){
            cb(err, null);
        });
    });
}

function getEnvironments(datasource, callback)
{
    var conn = new sql.Connection(datasource);
    conn.connect().then(function(){
        var request = new sql.Request(conn);
        request.execute("pGetAllEnvironments").then(function(recordSet){
            conn.close();
            callback(null, recordSet[0]);
        }).catch(function(err){
            var no = (err.number !== null) ? err.number:0;
            var name = (err.name !== null) ? err.name:"";
            var code = (err.code !== null) ? err.code:"";
            var message = (err.message != null) ? err.message:"";
            var errorMessage = "Fatal Error occured. Number: " + no + " Name: " + name + " Code: " + code + " Message: " + message;
            conn.close();
            callback(err, DATA_ERROR);
        });
    }).catch(function(err){
        callback(err, null);
    });
}

function getHubConsumers(datasource, callback)
{
    var conn = new sql.Connection(datasource);
    conn.connect().then(function(){
        var request = new sql.Request(conn);
        request.execute("pGetApplicationConsumers").then(function(recordSet){
            conn.close();
            callback(null, recordSet[0]);
        }).catch(function(err){
            conn.close();
            var no = (err.number !== null) ? err.number:0;
            var name = (err.name !== null) ? err.name:"";
            var code = (err.code !== null) ? err.code:"";
            var message = (err.message !== null) ? err.message:"";
            var errorMessage = "Fatal Error occured. Number: " + no + " Name: " + name + " Code: " + code + " Message: " + message;
            callback(err.message);
        });
    }).catch(function(err){
        callback(err);
    });
}

function getServicePerformanceStats(dataSource, requestId, callback){

    var conn = new sql.Connection(dataSource);
    conn.connect().then(function(){
        var request = new sql.Request(conn);
        request.input('requestId', sql.Int, requestId);
        request.execute("pGetServicePerformanceStats").then(function(recordSet){
            conn.close();
            callback(null, recordSet[0]);
        }).catch(function(err){
            conn.close();
            var no = (err.number !== null) ? err.number:0;
            var name = (err.name !== null) ? err.name:"";
            var code = (err.code !== null) ? err.code:"";
            var message = (err.message !== null) ? err.message:"";
            var errorMessage = "Fatal Error occured. Number: " + no + " Name: " + name + " Code: " + code + " Message: " + message;
            callback(errorMessage);
        });
    }).catch(function(err){
        callback(err);
    });
}

var errorMessage = function buildErrorMessage(err){
    message({
        no: err.number,
        name: err.name,
        code: err.code,
        msg: err.message,
        errorMessage: "Fatal Error occured. Number: " + no + " Name: " + name + " Code: " + code + " Message: " + msg
    });
    return message;
}





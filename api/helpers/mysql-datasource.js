/**
 * Created by adm9360 on 27/11/2015.
 */

var mysql = require('mysql');

module.exports = {
    searchHubLogs: searchHubLogs,
    getEnvironments: getEnvironments,
    getHubConsumers: getHubConsumers
};

function isNotNullOrUndefined(value)
{
    return value !== null && value !== undefined;
}

function searchHubLogs(config, req, callback)
{
    console.log(JSON.stringify(config));
    //Replace this with a map?
    //env, start, noRecords, requestId, serviceId, sourceName, severity, logCode, userId, latestDate, requestMessage, logMessage, errorsOnly, includeOlbPing, apps
    var startPos = (req.swagger.params.start.value) ? req.swagger.params.start.value:0;
    var resultSetSize = (req.swagger.params.noRecords.value) ? req.swagger.params.noRecords.value:200;
    var reqID = (req.swagger.params.requestId.value) ? req.swagger.params.requestId.value:null;
    var srvID = (req.swagger.params.serviceId.value) ? req.swagger.params.serviceId.value:null;
    var srcName = isNotNullOrUndefined(req.swagger.params.sourceName.value) ? "'" + req.swagger.params.sourceName.value + "'":null;
    var user = isNotNullOrUndefined(req.swagger.params.userId.value) ? "'" + req.swagger.params.userId.value + "'":null;
    var sev = isNotNullOrUndefined(req.swagger.params.severity.value) ? "'" +  req.swagger.params.severity.value + "'":null;
    var cde = isNotNullOrUndefined(req.swagger.params.logCode.value) ? "'" + req.swagger.params.logCode.value + "'":null;
    var date = isNotNullOrUndefined(req.swagger.params.latestDate.value) ? "'" + req.swagger.params.latestDate.value + "'":null;
    var appss = isNotNullOrUndefined(req.swagger.params.apps.value) ? "'" + req.swagger.params.apps.value + "'":null;
    //console.log(appss.length);
    if((appss !== null && appss !== undefined) && appss.length > 5) {
        var app = appss.split(",");
        appss = app[0] + "'";
    }
    var reqMess = isNotNullOrUndefined(req.swagger.params.requestMessage.value) ? "'" + req.swagger.params.requestMessage.value + "'":null;
    var log = isNotNullOrUndefined(req.swagger.params.logMessage.value) ? "'" + req.swagger.params.logMessage.value + "'":null;
    var errs = (req.swagger.params.errorsOnly.value) ? req.swagger.params.errorsOnly.value:0;
    var ping = (req.swagger.params.includeOlbPing.value) ? req.swagger.params.includeOlbPing.value:0;
    var connection = mysql.createConnection(config);
    connection.connect(function(err){
        if(err){
            console.error('Error Connecting to database: ' + err.stack);
            return;
        }
        var request = "CALL pGetHubLogs(" + startPos + ", " + resultSetSize + ", " + reqID + ", " +
            srvID + ", " + srcName + ", " + user + ", " + sev + ", " + cde + ", " +
            date + ", " + appss + ", " + reqMess + ", " + log +", " + errs + ", " +
            ping + ")";
        connection.query(request, function(err, rows, fields)

        {
            if(err)
            {
                callback(err, null);
            }
            else
            {
                return callback(null, rows[0]);
            }
        });
        connection.end();
    });
}

function getHubConsumers(config, callback)
{
    console.log("b");
    var connection = mysql.createConnection(config);
    connection.connect(function(err){
        if(err){
            console.error('Error Connecting to database: ' + err.stack);
            return;
        }
        connection.query("CALL pGetApplicationConsumers()", function(err, rows, fields)
        {
            if(err)
            {
                callback(err, null);
            }
            else
            {
                console.log(rows[0]);
                return callback(null, rows[0]);
            }
        });
        connection.end();
    });
}

function getEnvironments(config, callback)
{
    console.log("a2");
    var connection = mysql.createConnection(config);
    connection.connect(function(err){
        if(err){
            console.error('Error Connecting to database: ' + err.stack);
            return;
        }
        connection.query("CALL pGetAllEnvironments()", function(err, rows, fields)
        {
            if(err)
            {
                callback(err, null);
            }
            else
            {
                console.log(rows[0]);
                return callback(null, rows[0]);
            }
        });
        connection.end();
    });
}

function createPooledConnection()
{
    var config = getConfig(true);
    config.getConnection(function(error, co){
        if(!error)
        {
            return co;
        }
        else
        {
            console.log("Code: " + error.code + "\nErrorno: " + error.errno + "\nSQLState: " + error.sqlState);
        }
    });
}

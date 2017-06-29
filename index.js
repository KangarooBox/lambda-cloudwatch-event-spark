var AWS = require('aws-sdk');
var url = require('url');
var https = require('https');
var config = require('./config');
var _ = require('lodash');

var baseSparkMessage = {}
if(config.roomId){ baseSparkMessage.roomId = config.roomId };
if(config.toPersonId){ baseSparkMessage.toPersonId = config.toPersonId };
if(config.toPersonEmail){ baseSparkMessage.toPersonEmail = config.toPersonEmail };

var postMessage = function(message, callback) {
  var body = JSON.stringify(message);
  var options = url.parse(config.webhookUrl);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Authorization': 'Bearer ' + config.accessToken,
  };

  var postReq = https.request(options, function(res) {
    var chunks = [];
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      return chunks.push(chunk);
    });
    res.on('end', function() {
      var body = chunks.join('');
      if (callback) {
        callback({
          body: body,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage
        });
      }
    });
    return res;
  });

  postReq.write(body);
  postReq.end();
};

// Format the message for other, unknown event types
var handleUnknown = function(event, context) {
  var subject = "AWS Notification";
  var detail = event.detail;
  var body = [];

  try {
    body.push(`##${subject} - account #${event.account}`);

    body.push(`- Actor: ${detail.userIdentity.userName} (${detail.userIdentity.type})`);
    body.push(`- Affected Instance: ${detail.requestParameters.userName}`);
    body.push(`- Event ID: [${detail.eventID}](https://console.aws.amazon.com/cloudtrail/home?region=${event.region}#/events?EventId=${detail.eventID})`);
  }
  catch(e) {
    body.push("\n##Couldn't process notification:");
    body.push(JSON.stringify(event));
  }

  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: body.join("<br/>\n")
  };

  return _.merge(baseSparkMessage, sparkMessage);
};

// Format the message for IAM events
var handleIAM = function(event, context) {
  var subject = "AWS IAM Notification";
  var detail = event.detail;
  var body = [];

  try {
    body.push(`##${subject} - account #${event.account}`);

    switch(detail.eventName.split(/(?=[A-Z])/)[0]){
      case "Create":
          body.push(`##EVENT: ${detail.eventName}!!`);
          break;
      case "Delete":
          body.push(`Event: ${detail.eventName}`);
          break;
      default:
          body.push(`Event: ${detail.eventName}`);
    }

    body.push(`- Actor: ${detail.userIdentity.userName} (${detail.userIdentity.type})`);
    body.push(`- Affected User: ${detail.requestParameters.userName}`);
    body.push(`- Event ID: [${detail.eventID}](https://console.aws.amazon.com/cloudtrail/home?region=${event.region}#/events?EventId=${detail.eventID})`);
  }
  catch(e) {
    color = "danger";
    body.push("\n##Couldn't process notification:");
    body.push(JSON.stringify(event));
  }


  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: body.join("<br/>\n")
  };

  return _.merge(baseSparkMessage, sparkMessage);
};


exports.handler = function(event, context) {
  console.log("sns received:" + JSON.stringify(event, null, 2));
  var sparkMessage = null;

  switch(event.source) {
    case "aws.iam":
      console.log("processing IAM notification...");
      sparkMessage = handleIAM(event,context);
      break;
    default:
      console.log("processing unknown notification...");
      sparkMessage = handleUnknown(event,context);
  }

  postMessage(sparkMessage, function(response) {
    if (response.statusCode < 400) {
      console.info('message posted successfully');
      context.succeed();
    } else if (response.statusCode < 500) {
      console.error("error posting message to Spark API: " + response.statusCode + " - " + response.statusMessage);
      // Don't retry because the error is due to a problem with the request
      context.succeed();
    } else {
      // Let Lambda retry
      context.fail("server error when processing message: " + response.statusCode + " - " + response.statusMessage);
    }
  });
};

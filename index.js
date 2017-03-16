var AWS = require('aws-sdk');
var url = require('url');
var https = require('https');
var config = require('./config');
var _ = require('lodash');
var accessToken;

var baseSparkMessage = {}
if(config.roomId){ baseSparkMessage.roomId = config.roomId };
if(config.toPersonId){ baseSparkMessage.toPersonId = config.toPersonId };
if(config.toPersonEmail){ baseSparkMessage.toPersonEmail = config.toPersonEmail };

var postMessage = function(message, callback) {
  var body = JSON.stringify(message);
  var options = url.parse(config.hookUrl);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Authorization': 'Bearer ' + accessToken,
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

var handleElasticBeanstalk = function(event, context) {
  var timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  var subject = "AWS Elastic Beanstalk Notification";
  var message = event.Records[0].Sns.Message;

  var stateRed = message.indexOf(" to RED");
  var stateSevere = message.indexOf(" to Severe");
  var butWithErrors = message.indexOf(" but with errors");
  var noPermission = message.indexOf("You do not have permission");
  var failedDeploy = message.indexOf("Failed to deploy application");
  var failedConfig = message.indexOf("Failed to deploy configuration");
  var failedQuota = message.indexOf("Your quota allows for 0 more running instance");
  var unsuccessfulCommand = message.indexOf("Unsuccessful command execution");

  var stateYellow = message.indexOf(" to YELLOW");
  var stateDegraded = message.indexOf(" to Degraded");
  var stateInfo = message.indexOf(" to Info");
  var removedInstance = message.indexOf("Removed instance ");
  var addingInstance = message.indexOf("Adding instance ");
  var abortedOperation = message.indexOf(" aborted operation.");
  var abortedDeployment = message.indexOf("some instances may have deployed the new application version");

  var color = "good";

  if (stateRed != -1 || stateSevere != -1 || butWithErrors != -1 || noPermission != -1 || failedDeploy != -1 || failedConfig != -1 || failedQuota != -1 || unsuccessfulCommand != -1) {
    color = "danger";
  }
  if (stateYellow != -1 || stateDegraded != -1 || stateInfo != -1 || removedInstance != -1 || addingInstance != -1 || abortedOperation != -1 || abortedDeployment != -1) {
    color = "warning";
  }

  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: "###" + subject
    + "\n\n**Subject:**<br />  " + event.Records[0].Sns.Subject
    + "<br />  "
    + "\n\n**Message:**<pre>" + message + "</pre>"
  };

  return _.merge(baseSparkMessage, sparkMessage);
};

var handleCodeDeploy = function(event, context) {
  var subject = "AWS CodeDeploy Notification";
  var timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  var snsSubject = event.Records[0].Sns.Subject;
  var message;
  var fields = [];
  var color = "warning";

  try {
    message = JSON.parse(event.Records[0].Sns.Message);

    if(message.status === "SUCCEEDED"){
      color = "good";
    } else if(message.status === "FAILED"){
      color = "danger";
    }
    fields.body = "\n\n**Deployment Group:**<br />  " + message.deploymentGroupName
    + "\n\n**Application:**<br />  " + message.applicationName
    + "<br />  "
    + "\n\n**Status Link:**<br />  " + "https://console.aws.amazon.com/codedeploy/home?region=" + message.region + "#/deployments/" + message.deploymentId
  }
  catch(e) {
    color = "good";
    message = event.Records[0].Sns.Message;
    fields.body = "\n\n**Detail:**<pre>" + message + "</pre>"
  }


  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: "###" + subject
    + "\n\n**Message:**<br />  " + snsSubject
    + "<br />  "
    + fields.body
  };

  return _.merge(baseSparkMessage, sparkMessage);
};

var handleElasticache = function(event, context) {
  var subject = "AWS ElastiCache Notification"
  var message = JSON.parse(event.Records[0].Sns.Message);
  var timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  var eventname, nodename;
  var color = "good";

  for(key in message){
    eventname = key;
    nodename = message[key];
    break;
  }

  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: "###" + subject
    + "\n\n**Event:**<br />  " + eventname.split(":")[1]
    + "<br />  "
    + "\n\n**Node:**<br />  " + nodename
    + "<br />  "
    + "\n\n**Link to cache node:**<br />  "
    + "https://console.aws.amazon.com/elasticache/home?region=" + config.region + "#cache-nodes:id=" + nodename + ";nodes"
  };

  return _.merge(baseSparkMessage, sparkMessage);
};

var handleCloudWatch = function(event, context) {
  var timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  var message = JSON.parse(event.Records[0].Sns.Message);
  var subject = "AWS CloudWatch Notification";
  var alarmName = message.AlarmName;
  var metricName = message.Trigger.MetricName;
  var oldState = message.OldStateValue;
  var newState = message.NewStateValue;
  var alarmDescription = message.AlarmDescription;
  var alarmReason = message.NewStateReason;
  var trigger = message.Trigger;
  var color = "warning";

  if (message.NewStateValue === "ALARM") {
      color = "danger";
  } else if (message.NewStateValue === "OK") {
      color = "good";
  }

  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: "###" + subject
    + "\n\n**Alarm Name:**<br />  " + alarmName
    + "<br />  "
    + "\n\n**Alarm Reason:**<br />  " + alarmReason
    + "<br />  "
    + "\n\n**Trigger:**<br />  " + trigger.Statistic
      + " " + metricName + " "
      + trigger.ComparisonOperator + " " + trigger.Threshold + " for "
      + trigger.EvaluationPeriods + " period(s) of "
      + trigger.Period + " seconds."
    + "<br />  "
    + "\n\n**Old State:** " + oldState
    + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Current State:** " + newState
    + "<br />  "
    + "\n\n**Link to Alarm:**<br />  " + "https://console.aws.amazon.com/cloudwatch/home?region=" + config.region + "#alarm:alarmFilter=ANY;name=" + alarmName
  };
  return _.merge(baseSparkMessage, sparkMessage);
};

var handleAutoScaling = function(event, context) {
  var subject = "AWS AutoScaling Notification"
  var message = JSON.parse(event.Records[0].Sns.Message);
  var timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  var eventname, nodename;
  var color = "good";

  for(key in message){
    eventname = key;
    nodename = message[key];
    break;
  }

  var sparkMessage = {
    text: "*" + subject + "*",
    markdown: "###" + subject
    + "\n\n**Message:**<br />  " + event.Records[0].Sns.Subject
    + "<br />  "
    + "\n\n**Description:**<br />  " + message.Description
    + "<br />  "
    + "\n\n**Event:**<br />  " + message.Event
    + "<br />  "
    + "\n\n**Cause:**<br />  " + message.Cause
    + "<br />  "
  };

  return _.merge(baseSparkMessage, sparkMessage);
};

var processEvent = function(event, context) {
  console.log("sns received:" + JSON.stringify(event, null, 2));
  var sparkMessage = null;
  var eventSubscriptionArn = event.Records[0].EventSubscriptionArn;
  var eventSnsSubject = event.Records[0].Sns.Subject || 'no subject';
  var eventSnsMessage = event.Records[0].Sns.Message;

  if(eventSubscriptionArn.indexOf(config.services.elasticbeanstalk.match_text) > -1 || eventSnsSubject.indexOf(config.services.elasticbeanstalk.match_text) > -1 || eventSnsMessage.indexOf(config.services.elasticbeanstalk.match_text) > -1){
    console.log("processing elasticbeanstalk notification");
    sparkMessage = handleElasticBeanstalk(event,context)
  }
  else if(eventSubscriptionArn.indexOf(config.services.cloudwatch.match_text) > -1 || eventSnsSubject.indexOf(config.services.cloudwatch.match_text) > -1 || eventSnsMessage.indexOf(config.services.cloudwatch.match_text) > -1){
    console.log("processing cloudwatch notification");
    sparkMessage = handleCloudWatch(event,context);
  }
  else if(eventSubscriptionArn.indexOf(config.services.codedeploy.match_text) > -1 || eventSnsSubject.indexOf(config.services.codedeploy.match_text) > -1 || eventSnsMessage.indexOf(config.services.codedeploy.match_text) > -1){
    console.log("processing codedeploy notification");
    sparkMessage = handleCodeDeploy(event,context);
  }
  else if(eventSubscriptionArn.indexOf(config.services.elasticache.match_text) > -1 || eventSnsSubject.indexOf(config.services.elasticache.match_text) > -1 || eventSnsMessage.indexOf(config.services.elasticache.match_text) > -1){
    console.log("processing elasticache notification");
    sparkMessage = handleElasticache(event,context);
  }
  else if(eventSubscriptionArn.indexOf(config.services.autoscaling.match_text) > -1 || eventSnsSubject.indexOf(config.services.autoscaling.match_text) > -1 || eventSnsMessage.indexOf(config.services.autoscaling.match_text) > -1){
    console.log("processing autoscaling notification");
    sparkMessage = handleAutoScaling(event, context);
  }
  else{
    context.fail("no matching processor for event");
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

exports.handler = function(event, context) {
  if (accessToken) {
    processEvent(event, context);
  } else if (config.unencryptedAccessToken) {
    accessToken = config.unencryptedAccessToken;
    processEvent(event, context);
  } else if (config.kmsEncryptedAccessToken && config.kmsEncryptedAccessToken !== '<kmsEncryptedAccessToken>') {
    var encryptedBuf = new Buffer(config.kmsEncryptedAccessToken, 'base64');
    var cipherText = { CiphertextBlob: encryptedBuf };
    var kms = new AWS.KMS();

    kms.decrypt(cipherText, function(err, data) {
      if (err) {
        console.log("decrypt error: " + err);
        processEvent(event, context);
      } else {
        accessToken = data.Plaintext.toString('ascii');
        processEvent(event, context);
      }
    });
  } else {
    context.fail('access token has not been set.');
  }
};

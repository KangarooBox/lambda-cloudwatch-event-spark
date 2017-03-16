module.exports = {

  kmsEncryptedAccessToken: "<kmsEncryptedAccessToken>",
  unencryptedAccessToken: "ODVjYWI4MzUtOGIyZC00MzM2LThiMmItYWY2ZGMxODRlZGRmNGI3ZTdhNjUtZTFl",
  hookUrl: "https://api.ciscospark.com/v1/messages",
  roomId: "",
  toPersonId: "722bb271-d7ca-4bce-a9e3-471e4412fa77",
  toPersonEmail: "",
  sparkChannel: "#test",  // spark channel to send a message to
  sparkUsername: "AWS SNS via Lamda", // spark username to user for messages
  region: "us-east-1", // default region for links in services that dont include region in sns
  icon_emoji: ":aws_emoji:", // slack emoji icon to use for messages
  orgIcon: "https://kangaroobox.com/assets/images/logo.png", // url to icon for your organization for display in the footer of messages
  orgName: "KangarooBox", // name of your organization for display in the footer of messages
  services: {
    elasticbeanstalk: {
      match_text: "ElasticBeanstalkNotifications" // text in the sns message or topicname to match on to process this service type
    },
    cloudwatch: {
      match_text: "CloudWatchNotifications" // text in the sns message or topicname to match on to process this service type
    },
    codedeploy: {
      match_text: "CodeDeploy" // text in the sns message or topicname to match on to process this service type
    },
    elasticache: {
      match_text: "ElastiCache" // text in the sns message or topicname to match on to process this service type
    },
    autoscaling: {
      match_text: "AutoScaling" // text in the sns message or topicname to match on to process this service type
    }
  }

}

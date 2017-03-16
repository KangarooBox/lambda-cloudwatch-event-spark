# lambda-cloudwatch-spark

An [AWS Lambda](http://aws.amazon.com/lambda/) function for better Cisco Spark notifications.
This work is a direct descendant of function and wouldn't be possible without it.

[![BuildStatus](https://travis-ci.org/KangarooBox/lambda-cloudwatch-spark.png?branch=master)](https://travis-ci.org/assertible/lambda-cloudwatch-spark)
[![NPM version](https://badge.fury.io/js/lambda-cloudwatch-spark.png)](http://badge.fury.io/js/lambda-cloudwatch-spark)


## Overview

This function was originally derived from the
[lambda-cloudwatch-slack](https://github.com/assertible/lambda-cloudwatch-slack) project which was originally derived from the
[AWS blueprint named `cloudwatch-alarm-to-spark`](https://aws.amazon.com/blogs/aws/new-spark-integration-blueprints-for-aws-lambda/). The
function in this repo improves on the default blueprint in several ways:

**Better default formatting for CloudWatch notifications:**

![AWS Cloud Notification for Spark](https://github.com/kangaroobox/lambda-cloudwatch-spark/raw/master/images/cloudwatch.png)

**Support for notifications from Elastic Beanstalk:**

![Elastic Beanstalk Spark Notifications](https://github.com/kangaroobox/lambda-cloudwatch-spark/raw/master/images/elastic-beanstalk.png)

**Support for notifications from Code Deploy:**

![AWS CodeDeploy Notifications](https://github.com/kangaroobox/lambda-cloudwatch-spark/raw/master/images/code-deploy.png)

**Basic support for notifications from ElastiCache:**

![AWS ElastiCache Notifications](https://github.com/kangaroobox/lambda-cloudwatch-spark/raw/master/images/elasticache.png)

**Support for encrypted and unencrypted Spark access token:**


## Configuration

Clone this repository and open the Makefile in your editor, then follow
the steps below:


### 1. Configure AWS environment

Fill in the variables at the top of the `Makefile`. For example, your
variables may look like this:

```
LAMBDA_FUNCTION_NAME=cloudwatch-to-spark
AWS_REGION=us-west-2
AWS_ROLE=arn:aws:iam::123456789123:role/lambda_exec_role
AWS_PROFILE=myprofile
```


### 2. Configure AWS Lambda script

Next, open `config.js`. there are several mandatory and optional
configuration options. We've tried to choose a good set of defaults:


#### a. mandatory configuration

A hook URL and a `sparkChannel` are required configurations. The
`sparkChannel` is the name of the Spark room to send the messages. To
get the value for the URL, you'll need to set up a Spark hook,
[as described below](#3-setup-spark-access-token).

To configure a proper Spark webhook URL, either the
`kmsEncyptedHookUrl` or `unencryptedHookUrl` needs to be filled
out. `kmsEncyptedHookUrl` uses the AWS KMS encryption service. See the
documentation below for more details
([unencrypted hook url](#unencrypted-hook-url) &
[encrypted hook url](#encrypted-hook-url))


#### b. optional configuration

All other configuration options are "optional". Some customize the
look and text in the Spark notification; `sparkUsername` and `orgIcon`
will enhance the messages appearance.


### 3. Setup Spark hook

Follow these steps to configure the webhook in Spark:

  1. Navigate to
     [https://.spark.com/services/new](https://.spark.com/services/new)
     and search for and select "Incoming WebHooks".

  3. Choose the default channel where messages will be sent and click
     "Add Incoming WebHooks Integration".

  4. Copy the access token from the setup instructions and use it in
     the next section.

  5. Click 'Save Settings' at the bottom of the Spark integration
     page.


#### Unencrypted access token

If you don't want or need to encrypt your access token, you can use the
`unencryptedAccessToken`.  If this variable is specified, the
kmsEncyptedAccessToken is ignored.


#### Encrypted access token

Follow these steps to encrypt your Spark access token for use in this
function:

  1. Create a KMS key -
     http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html.

  2. Encrypt the event collector token using the AWS CLI.
     $ aws kms encrypt --key-id alias/<KMS key name> --plaintext "<SPARK_ACCESS_TOKEN>"

  3. Copy the base-64 encoded, encrypted key (CiphertextBlob) to the
     ENCRYPTED_ACCESS_TOKEN variable.

  4. Give your function's role permission for the kms:Decrypt action.
     Example:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1443036478000",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt"
            ],
            "Resource": [
                "<your KMS key ARN>"
            ]
        }
    ]
}
```

## Tests

With the variables filled in, you can test the function:

```
npm install
make test
```

## License

MIT License

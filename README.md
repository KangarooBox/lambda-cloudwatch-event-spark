# lambda-cloudwatch-event-spark

An [AWS Lambda](http://aws.amazon.com/lambda/) function for better Cisco Spark notifications generated from CloudWatch
events.
This work is a direct descendant of [lambda-cloudwatch-slack](https://github.com/assertible/lambda-cloudwatch-slack)
and wouldn't be possible without it.

[![BuildStatus](https://travis-ci.org/KangarooBox/lambda-cloudwatch-spark.png?branch=master)](https://travis-ci.org/assertible/lambda-cloudwatch-spark)
[![NPM version](https://badge.fury.io/js/lambda-cloudwatch-spark.png)](http://badge.fury.io/js/lambda-cloudwatch-spark)


## Overview

This function was originally derived from the
[lambda-cloudwatch-slack](https://github.com/assertible/lambda-cloudwatch-slack) project which was originally derived from the
[AWS blueprint named `cloudwatch-alarm-to-spark`](https://aws.amazon.com/blogs/aws/new-spark-integration-blueprints-for-aws-lambda/). The
function in this repo allows CloudWatch Events to generate Spark notifications.


## Configuration

Clone this repository and open the Makefile in your editor, then follow
the steps below:

TODO

## Tests

With the variables filled in, you can test the function:

```
npm install
make test
```

## License

MIT License

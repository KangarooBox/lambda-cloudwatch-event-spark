
LAMBDA_TEST?=./node_modules/node-lambda/bin/node-lambda
LAMBDA_FUNCTION_NAME=notifySpark
AWS_REGION=us-east-1
AWS_ROLE=arn:aws:iam:2132342424:role/my_role
AWS_PROFILE=dw

all:
	npm build

.PHONY: deps
deps:
	npm install

.PHONY: test
test:
	AWS_REGION=$(AWS_REGION) $(LAMBDA_TEST) run -x test/context.json -j test/sns-cloudwatch-event.json
	# AWS_REGION=$(AWS_REGION) $(LAMBDA_TEST) run -x test/context.json -j test/sns-elastic-beanstalk-event.json
	# AWS_REGION=$(AWS_REGION) $(LAMBDA_TEST) run -x test/context.json -j test/sns-codedeploy-event.json
	# AWS_REGION=$(AWS_REGION) $(LAMBDA_TEST) run -x test/context.json -j test/sns-codedeploy-configuration.json
	# AWS_REGION=$(AWS_REGION) $(LAMBDA_TEST) run -x test/context.json -j test/sns-elasticache-event.json
	# AWS_REGION=$(AWS_REGION) $(LAMBDA_TEST) run -x test/context.json -j test/sns-autoscaling-event.json

.PHONY: package
package:
	$(LAMBDA_TEST) package --functionName $(LAMBDA_FUNCTION_NAME)

.PHONY: deploy
deploy:
	$(LAMBDA_TEST) deploy --functionName $(LAMBDA_FUNCTION_NAME) \
				--role $(AWS_ROLE) \
				--accessKey $(AWS_ACCESS_KEY_ID) \
				--secretKey $(AWS_ACCESS_KEY_SECRET) \
				--region $(AWS_REGION) \
				--profile $(AWS_PROFILE)

# Lemmy Explorer Deployment (Amazon CDK v2)

The deploy is an Amazon CDK v2 project that deploys the Lemmy Explorer frontend to AWS.

`config.example.json` has the configuration for the deploy, rename to `config.json` and fill in the values.

then run `cdk deploy --all` (or `yarn deploy`) to deploy the frontend to AWS.

## Deployment

`yarn install`

`yarn synth`

`yarn deploy`

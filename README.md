# aws-amplify-hooks
Collection of handy hooks I come up with for AWS Amplify CLI

Any scripts you find in here can be cut and pasted into your AWS Amplify project for them to kick in. They all follow the [AWS Amplify build hooks format]( [https://docs.amplify.aws/cli/project/command-hooks/).

## Installation

Download the files and cut and paste them into your project root. This should add a /amplify/hooks/ folder for you with the hooks in place. 

All hooks will run when you run a related command. To disable a hook either delete it or rename it with `_hidden` on the end or similar.

## Available hooks

### Auto Add TypeScript to javascript functions

When you add a new function this hook will kick in and if it is a javascript function it will set it up to use TypeScript out of the box. 

* Copies over a tsconfig.json file (this comes from `/amplify/hooks/typescriptFiles` if you want to edit it for future functions.
* Renames `src\index.js` to `src\index.ts`
* Adds a compile line to the application root package.json (Amplify will automatically run this on build or when mocking)

## Development tips

Often it can get annoying to run the script within the CLI all the time so I try to make them run as simple node scripts where I can and only add in any CLI specific stuff when I'm ready to test it within the CLI. Examples of that is when trying to get somehing from the parameters which are pretty limiting anyway. I tend to just hardcode what I need while I develop and then uncomment the parameter parsing stuff after.

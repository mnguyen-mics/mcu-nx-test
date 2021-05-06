# end-to-end-scenarios - Front testing (Cypress)

## How to use cypress

Cypress is installed via npm. To use it, you'll need to run `npm install` first, in `./Cypress` (it requires a Node version >= 4.0.0).

Before running anything, you'll need to use the script in `./build-support/jenkins/generate-cypress-json.sh`.
To use it, start the following command from the Git repository's root if you are testing against a virtual platform :

    bash ./build-support/jenkins/generate-cypress-json.sh <virtual_platform_name> > ./Cypress/cypress.json

If you want to execute tests on a virtual platform and the name of your machine is different from the name recognized by the virtual platforms (ssh username) you can pass your ssh username as an argument so you would get recognized :

    bash ./build-support/jenkins/generate-cypress-json.sh <virtual_platform_name> <ssh_username> > ./Cypress/cypress.json

If you're not (for local tests for instance), don't pass any argument ; localhost:9000 will then be used as the base url.

Several commands are already available, you can run them with `npm run` followed by the instruction (you can add others in the `package.json`). For instance, you can :

- run Cypress using its GUI : `cypress`. All the tests in `cypress/integration` will be listed here, you can run them simply by clicking on them.
- run all Cypress tests in headless mode : `cy:run`
- run Cypress and generate an HTML report : `cy:report`. It will generate the file at `Cypress/mochawesome-report/mochawesome.html`, that you can open in your favorite web browser. This command runs tests against a headless Electron browser by default ; to change this, you can add `--browser=<browser_name>` after the command, for instance : `npm run cy:report --browser=chrome`. See `Cypress/scripts/report.js` for more details.
- run Cypress with a different browser than Electron, with `cy:run:chrome` or `cy:run:firefox` (note that the browser should exist on the machine beforehand, Cypress doesn't install it). This will run the tests in a headed browser ; if you want it to be headless, you can use `cy:run:hl-chrome` / `cy:run:hl-firefox` instead.

## Project structure

https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Folder-Structure

### The `cypress.json` file

For more information, see https://docs.cypress.io/guides/references/configuration.html#Options.

This file should be generated with the script `generate-cypress-json.sh`. For more details, see instructions in the script file.

This file is the configuration file of Cypress. Since it's a generated file, ignored by Git, you can edit it as you want to fit your needs. For now, it contains :

- **baseUrl** : This URL will be used as a prefix every time you'll use `cy.visit()` or `cy.request()`.
- **testFiles** / **ignoreTestFiles** : A string or array of glob patterns used to include / ignore test files. You'll see that all files should end with `.spec.js` or `.spec.ts` to be included.
- **watchForFileChanges** : Whether Cypress will watch and restart tests on test file changes. It is set to false for the CI, but you can change it for your local tests.
- **defaultCommandTimeout** : Time, in milliseconds, to wait until most DOM based commands are considered timed out. This is the default timeout for almost all cy.xXx commands.
- **video** : Whether Cypress will capture a video of the tests run. It is set to false for the CI, but you can change it for your local tests.
- **reporter**, **reporterOptions** : Configuration for the report generator.

### cypress/

This is the main folder of front e2e tests. It is divided in several subfolders :

#### [fixtures](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Fixture-Files)

Quoting the official documentation : "_Fixtures are used as external pieces of static data that can be used by your tests._"

#### [integration](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Test-files)

This is where all test suites should be located (only the files located here will be displayed when running).

#### [plugins](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Plugin-files)

All plugins run before tests are located here. Plugins allow to "_tap into, modify, or extend the internal behavior of Cypress_".

#### [support](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Support-file)

- You can add reusable pieces of code here, by adding custom commands in `commands.js`.
- `index.d.ts` is used to declare the definitions of the custom commands. It's not compulsory, but if you do it, VS Code will show IntelliSense where the command is used, as it does for Typescript. (as long as there is `/// <reference path="../support/index.d.ts" />` at the top of the file, see [doc](https://docs.cypress.io/guides/tooling/intelligent-code-completion.html#Triple-slash-directives) for more info).

Beside the `cypress` folder, there are a few other important folders, not tracked by Git, which contain the output of tests : `cypress/screenshots` and `cypress/videos` for screenshots and videos (!!), and `mochawesome-report` for generated reports.

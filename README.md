# Mediarithmics Navigator

This is the repository for [Navigator](https://navigator.mediarithmics.com/), the application used by our customers.  
If you need to learn more about how the Navigator loads its plugins checkout the [Navigator Loading Documentation](https://github.com/MEDIARITHMICS/mediarithmics-navigator/blob/master/NAVIGATOR_LOADING.md)

## Project structure

### app/conf

This is where you can configure your React app (available features, global constants, etc ...). You will have to create a Git ignored `app/conf/app-configuration.js` file to modify these constants. (see below)

### app/react/src

Almost everything you need to know about navigator is here. Let's focus on a few parts :

#### components

All our custom components are here but not for long: we are currently migrating them to [an external library](https://github.com/MEDIARITHMICS/ux-components) to be able to use them in different projects. They are mostly built from Ant Design components.

#### containers

Containers are made with components and correspond to the Navigator parts.

#### models

This is where we type our resources. See [typescript basic types for more details](https://www.typescriptlang.org/docs/handbook/basic-types.html)

#### routes

Declare here your new routes.

#### services

Our CRUD methods to communicate with our API.

#### state

Everything that is Redux related is here (actions, reducers etc ...). For more details, see [the ofifcial redux documentation](https://redux.js.org/introduction/getting-started) and [the redux saga one](https://redux-saga.js.org/).

#### styles

We are using LESS in order to generate Navigator style sheets. See the [less documentation for details](http://lesscss.org/).

#### utils

A list of useful methods and helpers that can be used in different parts of Navigator.

## Prerequisites

### Overview

System:

- node.js (version >= 0.12)
- npm

### Details

Here is the configuration of our build machine (so you can reproduce the build on your side) :

#### To install global packages :

In `~/.npmrc` :

```
prefix=~/.local
```

#### optional : set the version of nodejs

We use [nvm](https://github.com/creationix/nvm) to set the nodejs version.

#### setup endpoints

create `app/conf/react-configuration.js` using `app/conf/react-configuration.js.template`.

## Getting started

- Clone the navigator project
- Make sure all prerequisites are fulfilled
- Follow the first 3 steps of the [Adding and using the library in client project](https://github.com/MEDIARITHMICS/ux-components/tree/master/mcs-react-components#adding-and-using-the-library-in-client-project) section
- `npm install`
- `npm start` (set by default environment variables to local)
- If you want to set environment variables to a specific environment, you can use `npm run start:local` or `npm run start:prod`
- If you want to change the environment without relaunching `npm start`, you can simply run `npm run local` or `npm run prod` in a new terminal tab.

## Useful tools

We recommend you use [Visual Studio Code](https://code.visualstudio.com/) with these extensions:

- Auto Import
- ES Lint
- Git History
- Git Lens
- HTML snippets
- Prettier
- TS Lint
- SonarLint

Also we strongly recommend you download the React and Redux extensions for your favorite web browser. Here are the links for [React Developer Tools for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) and [Redux DevTools for Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=fr).

## Features flags

Some components of this application require features to be activated on the end user browser. Some features are public and given to everybody, and some features are overriden on a per user basis.

In order to activate or remove a feature from an end user browser, we need to update the configuration done in split.io

Please ask to a Product team member to do so.

## BEM methodology

All new class names should respect BEM (Block Element Modifier) methodology.

Block, element and modifier names should be in camelCase.

All homemade classes should be prefixed by `mcs-` as follow:

```
mcs-block_element
```

For element with modifier:

```
mcs-block_element--modifier
```

A class name can't have more than two elements. In this case class name should be splitted. The third element become the first element:

```
mcs-block_element1_element2

mcs-block_element3_element4

```

In order to improve component isolation and reusability, block name should be the same as component name.

Example:

```
<ul class="mcs-menu">
  <li class="mcs-menu_item">
    <a href="" class="mcs-menu_item_link">link1</a>
  </li>
  <li class="mcs-menu_item">
    <a href="" class="mcs-menu_item_link">link2</a>
  </li>
  <!-- This link item has a class with a modifier because we want to give it a different color from the other items -->
  <li class="mcs-menu_item mcs-menu_item--secondary">
    <a href="" class="mcs-menu_item_link">link3</a>
  </li>
</ul>

```

## VSCode SonarLint extension

This extension permits to detect and fix quality issues scanned from SonarQube directly in VSCode.

### Installation instructions

1. Token generation from SonarQube server

- Sign-in to following adress using Google credentials. Login is your email without `@mediarithmics.com`

```
https://sf-sonarqube.mediarithmics.com
```

- Click to `My Account` > `Security`
- Generate a token and copy it.

2. SonarLint installation

- In VS Code, type `CTRL+P` and enter following command

```
ext install SonarSource.sonarlint-vscode
```

- In `File` > `Preferences` > `Settings` > `Extensions` > `SonarLint` > `Connected Mode` > `Connections: Sonarqube`
- Click on `Edit in settings.json`
- Paste following block :

```
  "sonarlint.connectedMode.connections.sonarqube": [
      { "serverUrl": "https://sf-sonarqube.mediarithmics.com", "token": "PASTE_YOUR_TOKEN_HERE" }
  ],
  "sonarlint.connectedMode.project": {
      "projectKey": "mediarithmics-navigator"
  }
```

- Enable SonarLint by typing `CTRL+SHIFT+P` and select `SonarLint: Update all project bindings to SonarQube/SonarCloud`

CSS rules && Guidelines

1/ Avoid antd css classes direct targeting. Create new BEM class instead. if no choice, you can only target antd classes inside another scoped class.

2/ Always use BEM methodology for class naming (see above)

## Linters

This repository has three mandatory checks for a successful build : TS Lint, ES Lint and Prettier. Your code should be compliant to these checks before making a pull request. Compliance can be checked using following commands.

- For TS Lint, run

```
npm run test:tslint
```

- For ES Lint, run

```
npm run test:lint
```

- For Prettier, a file can be prettified in VS Code by typing `CTRL+SHIFT+L` command. For running a complete check, run :

```
npm run prettier-check
```

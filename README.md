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
- If you want to set environment variables to a specific environment, you can use `npm run start:local` or `npm run start:prod` (note that we strongly discourage you to use `npm run start:prod` however if you want to, you will have to add your ADMIN_API_TOKEN to `app/conf/react-configuration.js` file in MCS_CONSTANTS object)
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

## How to create a React component at mediarithmics

### Example

Here is an example of the structure of a React component with `datamartId` as props and with a state
to fetch data according to the `datamartId` in the props :

```
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../Notifications/injectNotifications'; // Need correct path
import { IDatamartService } from '../services/DatamartService'; // Idem
import { lazyInject } from '../config/inversify.config'; // Idem
import { TYPES } from '../constants/types'; // Idem
import { DatamartResource } from '../models/datamart/DatamartResource'; // Idem

interface MyComponentProps {
  datamartId: string;
}

type Props = MyComponentProps &
  InjectedIntlProps &
  InjectedNotificationProps;

interface State {
  isLoading: string;
  data?: DatamartResource;
}

class MyComponent extends React.Component<Props, State> {
  // Services are injected using inversify
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      data: undefined
    };
  }

  componentDidMount() {
    const {
      datamartId,
    } = this.props;
    this.fetchData(datamartId);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      datamartId,
    } = this.props;

    const {
      datamartId: previousDatamartId,
    } = previousProps;

    const { isLoading } = this.state;

    if (previousDatamartId !== datamartId) {
      this.fetchData(datamartId);
    }
  }

  fetchData = (datamartId: string) => {
    const { notifyError } = this.props;
    this.setState({isLoading: true}, () => {
      this._datamartService
        .getDatamart(datamartId)
        .then(resData => {
          this.setState({isLoading: false, data: resData.data});
        })
        .catch(err => {
          // catch and notify error when fetching data
          notifyError(err);
          this.setState({isLoading: false});
        });
    });
  };


  render() {
    const { isLoading, data } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return <MySubcomponent data={data}/>;
  }
}

export default compose<Props, MyComponentProps>(injectIntl, injectNotifications)(MyComponent);
```

This component is defined as a class. That is why it extends `React.Component`.
The only method that must be defined when extending `React.Component` is `render()`. All the
other ones are optional.

Those optional methods are called lifecycle methods.

### Instance properties

The `props` that are defined by the caller of the component are found in `this.props`.

In the example, the `props` are defined as follows :

```
interface MyComponentProps {
  datamartId: string;
}

type Props = MyComponentProps & InjectedIntlProps;
```

The `props` that are specific to the component are defined in `MyComponentProps`. Additional generic
`props` like `InjectedIntlProps` are then added in order to create the complete `Props`.

In the case of React Intl messages, see examples in the code about how to define messages and use them.
You should use messages and not use strings as text.

Reference to those generic props is also found at the end of the file, when `MyComponent` is exported
(`injectIntl` refers to `InjectedIntlProps`) :

```
export default compose<Props, MyComponentProps>(injectIntl, injectNotifications)(MyComponent);
```

The `state` contains data that is specific to the component and which may change over time.

In the example, the `state` is defined as follows :

```
interface State {
  isLoading: string;
  data: string[];
}
```

This corresponds to a typical state containing data that is fetched, and the associated `isLoading`
variable which value is `true` when the data is being fetched.

### Lifecycle methods

The lifecycle methods are methods that can be overriden in order to run code at peculiar times
in the life of the component.

#### Mounting methods

The mounting methods are called when an instance of the component is created and inserted in the DOM.

#### constructor()

The constructor method only needs to be implemented if a state needs to be initialized.
`super(props)` should be called before any other statement in this method.

In order to initialize the state in the constructor, `this.state` should be assigned directly
and `setState()` should not be called. The constructor is the only place where `this.state` should
be assigned directly. In all other methods, `setState()` should be used.

#### render()

It is the method that is called when the component is rendered. It should return React elements, typically created
via JSX. The returned value represents what will be displayed by the component.
This function should be pure, that is to say it shouldn't modify the state of the component.

#### componentDidMount()

It is invoked directly after the component is mounted.

Data can be fetched in this method, like in the example.

#### Updating methods

Updating methods can be called because of changes in props or state.

#### render()

Same as above, in mounting methods.

#### componentDidUpdate()

It is called immediately after updating occurs.
Data can be fetched in this method, after having compared the current props
to the previous ones.

### Other React components features

For more information about React components and their lifecycles,
see the [documentation](https://en.reactjs.org/docs/react-component.html).

Concerning the injection of dependencies for services, you can refer to inversify
[documentation](https://github.com/inversify/InversifyJS).

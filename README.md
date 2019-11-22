Mediarithmics Navigator
=======================

This is the repository for [Navigator](https://navigator.mediarithmics.com/), the application used by our customers.  
If you need to learn more about how the Navigator loads its plugins checkout the [Navigator Loading Documentation](https://github.com/MEDIARITHMICS/mediarithmics-navigator/blob/master/NAVIGATOR_LOADING.md)

Project structure
-------------

### app/angular/src
The application is coded with React but small parts using Angular still remain (Navigator V1 was made with Angular) and that is what `angular/src` is about.

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

Prerequisites
-------------

### Overview
System:
* node.js (version >= 0.12)
* npm
* ruby

Node packages:
* grunt-cli (-g)
* bower (-g)

Ruby gems:
* compass


### Details

Here is the configuration of our build machine (so you can reproduce the build on your side) :

#### To install global packages / gems in your home :

In `~/.npmrc` :
```
prefix=~/.local
```

In `~/.gemrc` :
```
gemhome: /home/your_user/.gem
gem: --no-ri --no-rdoc
```

#### install system dependencies

Here on Debian :

```
sudo aptitude install ruby1.9.3 build-essential libpng-dev zlib1g-dev imagemagick
```

Here for the mac users:
make sure xcode is installed on your mac and follow those steps to install libpng-dev 
http://mac-dev-env.patrickbougie.com/libpng/
```
xcode-select --install
brew install ImageMagick
```

#### update path

Before the build or in your bashrc :
```
export PATH=$PATH:~/.gem/bin:~/.local/bin
export GEM_PATH=$(gem environment gempath)
export GEM_HOME=~/.gem
```

#### install project dependencies

```
npm install -g bower
npm install -g grunt-cli
gem install compass
```

#### optional : set the version of nodejs

We use [nvm](https://github.com/creationix/nvm) to set the nodejs version.

#### setup endpoints

create `app/conf/app-configuration.js` using `app/conf/app-configuration.js.template`.


Getting started
---------------

* Clone the navigator project
* Make sure all prerequisites are fulfilled
* Follow the first 3 steps of the [Adding and using the library in client project](https://github.com/MEDIARITHMICS/ux-components/tree/master/mcs-react-components#adding-and-using-the-library-in-client-project) section
* `npm install`
* `bower install`
* `npm start` (set by default environment variables to local)
* If you want to set environment variables to a specific environment, you can use `npm run start:local` or `npm run start:prod`
* If you want to change the environment without relaunching `npm start`, you can simply run `npm run local` or `npm run prod` in a new terminal tab.

Useful tools
---------------

We recommend you use [Visual Studio Code](https://code.visualstudio.com/) with these extensions:
* Auto Import
* ES Lint
* Git History
* Git Lens
* HTML snippets
* Prettier
* TS Lint

Also we strongly recommend you download the React and Redux extensions for your favorite web browser. Here are the links for [React Developer Tools for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) and [Redux DevTools for Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=fr).

Features flags
---------------

Some components of this application require features to be activated on the end user browser. Some features are public and given to everybody, and some features are overriden on a per user basis.

In order to activate or remove a feature from an end user browser, we need to make them access a navigator link.

This link contains a token that is generated as explained below (to be executed in a Node REPL):
```
Buffer.from(JSON.stringify({version: 1, method: 'add', featureName:
"mysuperfeature"})).toString('base64')

# Returns: 'eyJ2ZXJzaW9uIjoxLCJtZXRob2QiOiJhZGQiLCJmZWF0dXJlTmFtZSI6Im15c3VwZXJmZWF0dXJlIn0='

Buffer.from(JSON.stringify({version: 1, method: 'remove', featureName:
"mysuperfeature"})).toString('base64')

# Returns: 'eyJ2ZXJzaW9uIjoxLCJtZXRob2QiOiJyZW1vdmUiLCJmZWF0dXJlTmFtZSI6Im15c3VwZXJmZWF0dXJlIn0='
```

Then, this token should appended to: `/#/v2/o/<USER_ORGANISATION_ID>/ui-feature-flag?token=` Navigator route.

Replace `<USER_ORGANISATION_ID>` by the id of an organisation the user has access to.

Ex:
```
https://navigator.mediarithmics.com/#/v2/o/1/ui-feature-flag?token=eyJ2ZXJzaW9uIjoxLCJtZXRob2QiOiJhZGQiLCJmZWF0dXJlTmFtZSI6Im15c3VwZXJmZWF0dXJlIn0=
# Is adding the `mysuperfeature` to the user clicking on the link

https://navigator.mediarithmics.com/#/v2/o/1/ui-feature-flag?token=eyJ2ZXJzaW9uIjoxLCJtZXRob2QiOiJhZGQiLCJmZWF0dXJlTmFtZSI6Im15c3VwZXJmZWF0dXJlIn0=
# Is removing the `mysuperfeature` to the user clicking on the link
```

import * as React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';

import enUS from 'antd/lib/locale-provider/en_US';
import { LocaleProvider } from 'antd';

import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';

import Navigator from './containers/Navigator';
import { HashRouter as Router } from 'react-router-dom';

const messagesEn = require('../src/translations/en.json');
const messagesFr = require('../src/translations/fr.json');

addLocaleData([...enLocaleData, ...frLocaleData]);

const messages: any = {
  en: messagesEn,
  fr: messagesFr,
};

const language = navigator.language.split(/[-_]/)[0]; // language without region code

const formats = {
  number: {
    USD: {
      style: 'currency',
      currency: 'USD',
    },
    EUR: {
      style: 'currency',
      currency: 'EUR',
    },
  },
};

class IntlApp extends React.Component<{}> {
  render() {
    return (
      <IntlProvider
        locale={language}
        messages={messages[language]}
        formats={formats}
        defaultFormats={formats}
      >
        <LocaleProvider locale={enUS}>
          <Router>
            <Navigator />
          </Router>
        </LocaleProvider>
      </IntlProvider>
    );
  }
}

export default IntlApp;

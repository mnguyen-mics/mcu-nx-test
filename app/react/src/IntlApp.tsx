import * as React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import enUS from 'antd/lib/locale-provider/en_US';
import { ConfigProvider } from 'antd';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';
import { HashRouter as Router } from 'react-router-dom';
import NavigatorWithKeycloak from './containers/Navigator/NavigatorWithKeycloak';

// const messagesEn = require('../src/translations/en.json');
// const messagesFr = require('../src/translations/fr.json');

addLocaleData([...enLocaleData, ...frLocaleData]);

// const messages: any = {
//   en: messagesEn,
//   fr: messagesFr,
// };

// const language = navigator.language.split(/[-_]/)[0]; // language without region code

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
        // messages={messages[language]}
        formats={formats}
        defaultFormats={formats}
        locale='en'
      >
        <ConfigProvider locale={enUS}>
          <Router>
            <NavigatorWithKeycloak />
          </Router>
        </ConfigProvider>
      </IntlProvider>
    );
  }
}

export default IntlApp;

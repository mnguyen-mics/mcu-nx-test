import * as React from 'react';
import { connect } from 'react-redux';
import { addLocaleData, IntlProvider } from 'react-intl';

import enUS from 'antd/lib/locale-provider/en_US';
import { LocaleProvider } from 'antd';

import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';

import Navigator from './containers/Navigator';
import { HashRouter as Router } from 'react-router-dom';

addLocaleData([...enLocaleData, ...frLocaleData]);
interface IntlAppProps {
  locale?: string;
  translations: { [id: string]: string };
}

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

const IntlApp: React.SFC<IntlAppProps> = ({ locale, translations }) => {
  return (
    <IntlProvider
      locale={locale}
      messages={translations}
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
};

// TODO find browser locale
IntlApp.defaultProps = {
  locale: 'en',
  translations: {},
};

const mapStateToProps = (state: { translations: object }) => ({
  translations: state.translations,
});

export default connect(mapStateToProps)(IntlApp);

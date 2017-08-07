import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { Actionbar } from '../Actionbar';

class SettingsActionBar extends Component {
  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      intl: { formatMessage }
    } = this.props;

    const breadcrumbMessages = defineMessages({ settings: { id: 'settings.settings', defaultMessage: 'Settings' } });

    const breadcrumbPaths = [{
      name: formatMessage(breadcrumbMessages.settings),
      url: { pathname: `/v2/o/${organisationId}/settings`, search: '&tab=sites' }
    }];
    return (
      <Actionbar path={breadcrumbPaths} />
    );
  }
}

SettingsActionBar.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  intl: intlShape.isRequired
};

SettingsActionBar = compose(
  withRouter,
  injectIntl
)(SettingsActionBar);

export default SettingsActionBar;

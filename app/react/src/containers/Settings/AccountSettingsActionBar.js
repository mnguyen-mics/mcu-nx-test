import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Button } from 'antd';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';

import { Actionbar } from '../Actionbar';

class AccountSettingsActionBar extends Component {
  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbMessages = defineMessages({ settings: { id: 'settings.settings', defaultMessage: 'Settings' } });

    const breadcrumbPaths = [{ name: formatMessage(breadcrumbMessages.settings), url: `/v2/o/${organisationId}/settings/useraccount` }];
    return (<Actionbar path={breadcrumbPaths}>
      <Button type="primary" className="mcs-primary">
        <i className="anticon anticon-lock" /> <FormattedMessage id="RESET_PASSWORD_BUTTON" />
      </Button>
    </Actionbar>);
  }
}

AccountSettingsActionBar.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  intl: intlShape.isRequired,
};

AccountSettingsActionBar = compose(
  withRouter,
  injectIntl,
)(AccountSettingsActionBar);

export default AccountSettingsActionBar;

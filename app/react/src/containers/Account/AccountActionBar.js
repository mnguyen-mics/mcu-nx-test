import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Button } from 'antd';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';

import { Actionbar } from '../Actionbar';

class AccountActionBar extends Component {
  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbMessages = defineMessages({
      account: {
        id: 'account.account',
        defaultMessage: 'Account',
      },
    });

    const breadcrumbPaths = [{
      name: formatMessage(breadcrumbMessages.account),
      url: {
        pathname: `/v2/o/${organisationId}/account`,
        search: '&tab=user_account',
      },
    }];
    return (<Actionbar path={breadcrumbPaths}>
      <Button type="primary" className="mcs-primary">
        <i className="anticon anticon-lock" /> <FormattedMessage id="RESET_PASSWORD_BUTTON" />
      </Button>
    </Actionbar>);
  }
}

AccountActionBar.propTypes = {
  match: PropTypes.shape().isRequired,
  intl: intlShape.isRequired,
};

AccountActionBar = compose(
  withRouter,
  injectIntl,
)(AccountActionBar);

export default AccountActionBar;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../Actionbar';
import { McsIcons } from '../../components/McsIcons';
import { withTranslations } from '../Helpers';
import { getDefaultDatamart } from '../../state/Session/selectors';

class AccountSettingsActionBar extends Component {
  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      translations
    } = this.props;

    const breadcrumbPaths = [{ name: translations.USER_ACCOUNTS, url: `/v2/o/${organisationId}/settings/useraccount` }];
    return (<Actionbar path={breadcrumbPaths}>
      <Button type="primary">
        <i className="anticon anticon-lock" /> <FormattedMessage id="RESET_PASSWORD_BUTTON" />
      </Button>
    </Actionbar>);
  }
}

AccountSettingsActionBar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state)
});

AccountSettingsActionBar = connect(
  mapStateToProps
)(AccountSettingsActionBar);

AccountSettingsActionBar = compose(
  withTranslations,
  withRouter
)(AccountSettingsActionBar);

export default AccountSettingsActionBar;

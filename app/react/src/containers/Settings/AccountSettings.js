import React, { Component, PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { UserAccount } from './UserAccount';
import { OrganisationAccount } from './OrganisationAccount';
import { getDefaultWorspaceOrganisationId } from '../../state/Session/selectors';

const TabPane = Tabs.TabPane;

class AccountSettings extends Component {
  render() {
    const {
      intl: { formatMessage },
      organisationName
    } = this.props;

    const messages = defineMessages({ userAccount: { id: 'settings.tab.title.user_account', defaultMessage: 'User Account' },
      organisationAccount: { id: 'settings.tab.title.organisation_account', defaultMessage: 'Organisation Account' } });

    return (<Row className="mcs-table-container">
      <Tabs
        defaultActiveKey="1"
        tabPosition="left"
      >
        <TabPane tab={formatMessage(messages.userAccount)} key="1">
          <UserAccount />
        </TabPane>
        <TabPane tab={formatMessage(messages.organisationAccount)} key="2">
          <OrganisationAccount organisationName={organisationName} />
        </TabPane>
      </Tabs>
    </Row>);
  }
}

AccountSettings.propTypes = {
  organisationName: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  organisationName: getDefaultWorspaceOrganisationId(state)
});

AccountSettings.propTypes = {
  intl: intlShape.isRequired
};

AccountSettings = compose(
  connect(mapStateToProps),
  injectIntl
)(AccountSettings);

export default AccountSettings;

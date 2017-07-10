import React, { Component, PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { UserAccount } from './UserAccount';
import { OrganisationAccount } from './OrganisationAccount';

const TabPane = Tabs.TabPane;

function getDefaultOrganisation(user) {
  return user.workspaces[user.default_workspace];
}

class AccountSettings extends Component {
  render() {
    const {
      intl: { formatMessage },
      organisationName
    } = this.props;

    const messages = defineMessages({ userAccount: { id: 'UserAccount', defaultMessage: 'User Account' },
      organisationAccount: { id: 'OrganisationAccount', defaultMessage: 'Organisation Account' } });

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
  organisationName: getDefaultOrganisation(state.session.connectedUser).organisation_name
});

AccountSettings.propTypes = {
  intl: intlShape.isRequired
};

AccountSettings = compose(
  injectIntl
)(AccountSettings);

AccountSettings = connect(
  mapStateToProps
)(AccountSettings);

export default AccountSettings;

import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Col, Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { UserAccount } from './UserAccount';
import { OrganisationAccount } from './OrganisationAccount'

function getDefaultOrganisation(user) {
  return user.workspaces[user.default_workspace];
}

class AccountSettings extends Component {
  render() {
    const {
      intl: { formatMessage },
      organisation_name
    } = this.props;

    const messages = defineMessages({ userAccount: {id:"UserAccount", defaultMessage:"User Account"}, 
                       organisationAccount: {id:"OrganisationAccount", defaultMessage:"Organisation Account"}});

    return (<Row className="mcs-table-container">
      <Tabs
          defaultActiveKey="1"
          tabPosition="left"
        >
          <TabPane tab={formatMessage(messages.userAccount)} key="1">
            <UserAccount />
          </TabPane>
          <TabPane tab={formatMessage(messages.organisationAccount)} key="2">
            <OrganisationAccount organisation_name={organisation_name} />
          </TabPane>
        </Tabs>
    </Row>); 
  }
}

const mapStateToProps = (state) => ({
  organisation_name : getDefaultOrganisation(state.session.connectedUser).organisation_name
});

AccountSettings.propTypes = {
  intl: intlShape.isRequired
};

AccountSettings = compose(
  injectIntl
)(AccountSettings);

AccountSettings = connect(
  mapStateToProps
)(AccountSettings)

export default AccountSettings;

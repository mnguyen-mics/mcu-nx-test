import React, { Component } from 'react';
import {compose} from 'recompose';
import { Row, Col, Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import { UserAccount } from './UserAccount';
import { OrganisationAccount } from './OrganisationAccount'

class AccountSettings extends Component {
  render() {
    const {
      intl: { formatMessage }
    } = this.props;

    const messages = defineMessages({ userAccount: {id:"UserAccount", defaultMessage:"User Account"}, 
                       organisationAccount: {id:"OrganisationAccount", defaultMessage:"Organisation Account"}});

    return (<Row className="mcs-table-container">
      <Tabs
          defaultActiveKey="2"
          tabPosition="left"
        >
          <TabPane tab={formatMessage(messages.userAccount)} key="1">
            <UserAccount />
          </TabPane>
          <TabPane tab={formatMessage(messages.organisationAccount)} key="2">
            <OrganisationAccount />
          </TabPane>
        </Tabs>
    </Row>); 
  }
}

AccountSettings.propTypes = {
  intl: intlShape.isRequired
};

AccountSettings = compose(
  injectIntl
)(AccountSettings);

export default AccountSettings;

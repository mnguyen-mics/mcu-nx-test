import React, { Component, PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../Helpers';
import { UserAccount } from './UserAccount';
import { OrganisationAccount } from './OrganisationAccount';
import { getDefaultWorkspaceOrganisationId } from '../../state/Session/selectors';
import { ReactRouterPropTypes } from '../../validators/proptypes';
import { parseSearch } from '../../utils/LocationSearchHelper';
import * as menuActions from '../../state/Menu/actions';

const messages = defineMessages({
  userAccount: { id: 'account.tab.title.user_account', defaultMessage: 'User Account' },
  organisationAccount: { id: 'account.tab.title.organisation_account', defaultMessage: 'Organisation Account' },
});

const TabPane = Tabs.TabPane;

class Account extends Component {
  constructor(props) {
    super(props);

    this.switchTab = this.switchTab.bind(this);
    this.getUrlParameters = this.getUrlParameters.bind(this);
  }

  componentWillMount() {
    const { openCloseMenu } = this.props;
    openCloseMenu({
      collapsed: true,
      mode: 'vertical',
    });
  }

  getUrlParameters() {
    const {
      location: { search },
    } = this.props;

    const parsed = parseSearch(search);
    const tab = parsed.tab ? parsed.tab : 'user_account';

    return {
      currentTab: tab,
    };
  }

  switchTab(tabKey) {
    const {
      organisationId,
      history,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/account`,
      search: `?tab=${tabKey}`,
    });
  }

  render() {
    const {
      intl: { formatMessage },
      organisationName,
    } = this.props;

    const urlParams = this.getUrlParameters();

    return (
      <Row className="mcs-table-container">
        <Tabs defaultActiveKey={urlParams.currentTab} tabPosition="left" onTabClick={(key) => this.switchTab(key)}>
          <TabPane tab={formatMessage(messages.userAccount)} key="user_account"><UserAccount /></TabPane>
          <TabPane tab={formatMessage(messages.organisationAccount)} key="organisation_account"><OrganisationAccount organisationName={organisationName} /></TabPane>
        </Tabs>
      </Row>
    );
  }
}

Account.propTypes = {
  organisationName: PropTypes.string.isRequired,
  organisationId: PropTypes.string.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  openCloseMenu: PropTypes.func.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
};

const mapStateToProps = (state) => ({
  organisationName: getDefaultWorkspaceOrganisationId(state),
});

const mapDispatchToProps = {
  openCloseMenu: menuActions.openCloseMenu,
};

Account.propTypes = {
  intl: intlShape.isRequired,
};

Account = compose(
  withMcsRouter,
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Account);

export default Account;

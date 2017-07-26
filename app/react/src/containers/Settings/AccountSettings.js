import React, { Component, PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../Helpers';
import { SitesListPage } from './Sites';
import { UserAccount } from './UserAccount';
import { OrganisationAccount } from './OrganisationAccount';
import { getDefaultDatamart, getDefaultWorspaceOrganisationId } from '../../state/Session/selectors';
import { ReactRouterPropTypes } from '../../validators/proptypes';
import { parseSearch } from '../../utils/LocationSearchHelper';
import { getDefaultWorspaceOrganisationId } from '../../state/Session/selectors';
import * as menuActions from '../../state/Menu/actions';

const TabPane = Tabs.TabPane;

class AccountSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    const {
      organisationId,
      defaultDatamart
    } = this.props;

    const datamart = defaultDatamart(organisationId);
    if (datamart) {
      this.state.datamartId = parseInt(datamart.id, 0);
    }

    this.switchTab = this.switchTab.bind(this);
    this.getUrlParameters = this.getUrlParameters.bind(this);
  }

  getUrlParameters() {
    const {
      location: { search }
    } = this.props;

    const parsed = parseSearch(search);
    const tab = parsed.tab ? parsed.tab : 'user_account';

    return {
      currentTab: tab
    };
  }

  switchTab(tabKey) {
    const {
      organisationId,
      history
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/settings`,
      search: `?tab=${tabKey}`
    });
  }


  componentWillMount() {
    const { openCloseMenu } = this.props;
    openCloseMenu({
      collapsed: true,
      mode: 'verlical'
    });
  }

  render() {
    const {
      intl: { formatMessage },
      organisationName
    } = this.props;

    const messages = defineMessages({
      userAccount: { id: 'settings.tab.title.user_account', defaultMessage: 'User Account' },
      organisationAccount: { id: 'settings.tab.title.organisation_account', defaultMessage: 'Organisation Account' },
      sites: { id: 'settings.tab.title.sites', defaultMessage: 'Sites' }
    });

    const urlParams = this.getUrlParameters();

    return (
      <Row className="mcs-table-container">
        <Tabs defaultActiveKey={urlParams.currentTab} tabPosition="left" onTabClick={(key) => this.switchTab(key)}>
          <TabPane tab={formatMessage(messages.userAccount)} key="user_account">
            <UserAccount />
          </TabPane>
          <TabPane tab={formatMessage(messages.organisationAccount)} key="organisation_account">
            <OrganisationAccount organisationName={organisationName} />
          </TabPane>
          {
            this.state.datamartId
              ? <TabPane tab={formatMessage(messages.sites)} key="sites"><SitesListPage datamartId={this.state.datamartId} /></TabPane>
              : null
          }
        </Tabs>
      </Row>
    );
  }
}

AccountSettings.propTypes = {
  organisationName: PropTypes.string.isRequired,
  organisationId: PropTypes.string.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  openCloseMenu: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

const mapStateToProps = (state) => ({
  organisationName: getDefaultWorspaceOrganisationId(state),
  defaultDatamart: getDefaultDatamart(state)
});

const mapDispatchToProps = {
  openCloseMenu: menuActions.openCloseMenu
};

AccountSettings = compose(
  withMcsRouter,
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AccountSettings);

export default AccountSettings;

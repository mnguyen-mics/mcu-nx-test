import React, { Component, PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../Helpers';
import { SitesListPage } from './Sites';
import { DatamartsListPage } from './Datamarts';
import { MobileApplicationsListPage } from './MobileApplications';
import { getDefaultDatamart } from '../../state/Session/selectors';
import { ReactRouterPropTypes } from '../../validators/proptypes';
import { parseSearch } from '../../utils/LocationSearchHelper';
import * as menuActions from '../../state/Menu/actions';

import messages from './messages';

const TabPane = Tabs.TabPane;

class Settings extends Component {
  constructor(props) {
    super(props);

    const {
      organisationId,
      defaultDatamart
    } = this.props;

    const datamart = defaultDatamart(organisationId);
    if (datamart) {
      this.datamartId = parseInt(datamart.id, 0);
    }

    this.switchTab = this.switchTab.bind(this);
    this.getUrlParameters = this.getUrlParameters.bind(this);
  }

  componentWillMount() {
    const { openCloseMenu } = this.props;
    openCloseMenu({
      collapsed: true,
      mode: 'vertical'
    });
  }

  getUrlParameters() {
    const {
      location: { search }
    } = this.props;

    const parsed = parseSearch(search);
    const tab = parsed.tab ? parsed.tab : 'sites';

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

  render() {
    const {
      intl: { formatMessage }
    } = this.props;

    const urlParams = this.getUrlParameters();

    return (
      <div>
        {
          this.datamartId &&
          <Row className="mcs-table-container">
            <Tabs defaultActiveKey={urlParams.currentTab} tabPosition="left" onTabClick={(key) => this.switchTab(key)}>
              <TabPane tab={formatMessage(messages.sites)} key="sites"><SitesListPage datamartId={this.datamartId} /></TabPane>
              <TabPane tab={formatMessage(messages.mobileApplications)} key="mobile_applications"><MobileApplicationsListPage datamartId={this.datamartId} /></TabPane>
              <TabPane tab={formatMessage(messages.datamarts)} key="datamarts"><DatamartsListPage datamartId={this.datamartId} /></TabPane>
            </Tabs>
          </Row>
        }
      </div>
    );
  }
}

Settings.propTypes = {
  organisationId: PropTypes.string.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  openCloseMenu: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

const mapStateToProps = (state) => ({
  defaultDatamart: getDefaultDatamart(state)
});

const mapDispatchToProps = {
  openCloseMenu: menuActions.openCloseMenu
};

Settings = compose(
  withMcsRouter,
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Settings);

export
default
Settings;

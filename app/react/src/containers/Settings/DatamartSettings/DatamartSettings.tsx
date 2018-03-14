import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';


import { SitesListPage } from './Sites/List';
import { DatamartsListPage } from './Datamarts/List';
import { MobileApplicationsListPage } from './MobileApplications/List';
import { parseSearch, TAB_SEARCH_SETTINGS } from '../../../utils/LocationSearchHelper';
import * as menuActions from '../../../state/Menu/actions';

import messages from './messages';
import { RouteComponentProps, withRouter } from 'react-router';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';

const TabPane = Tabs.TabPane;

export interface SettingsProps {
  openCloseMenu: (a: any) => void;
}

type Props = SettingsProps & InjectedIntlProps & RouteComponentProps<{ organisationId: string }> & InjectedDatamartProps

class Settings extends React.Component<Props> {


  componentWillMount() {
    const { openCloseMenu } = this.props;
    openCloseMenu({
      collapsed: true,
      mode: 'vertical',
    });
  }

  getUrlParameters = () => {
    const {
      location: { search },
    } = this.props;

    const parsed = parseSearch(search, TAB_SEARCH_SETTINGS);
    const tab = parsed.tab ? parsed.tab : 'sites';
    return {
      currentTab: tab,
    };
  }

  switchTab = (tabKey: string) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart`,
      search: `?tab=${tabKey}`,
    });
  }

  render() {
    const {
      intl: { formatMessage },
      datamart,
    } = this.props;

    const urlParams = this.getUrlParameters();
    const datamartId = datamart && datamart.id;

    const onTabClick = (key: string) => this.switchTab(key)

    return (
      <div>

        <Row className="mcs-table-container">
          <Tabs defaultActiveKey={urlParams.currentTab} tabPosition="left" onTabClick={onTabClick}>
            {datamartId && <TabPane tab={formatMessage(messages.sites)} key="sites"><SitesListPage datamartId={datamartId} /></TabPane>}
            {datamartId && <TabPane tab={formatMessage(messages.mobileApplications)} key="mobile_applications"><MobileApplicationsListPage datamartId={datamartId} /></TabPane>}
            {datamartId && <TabPane tab={formatMessage(messages.datamarts)} key="datamarts"><DatamartsListPage /></TabPane>}
          </Tabs>
        </Row>
      </div>
    );
  }
}

const mapDispatchToProps = {
  openCloseMenu: menuActions.openCloseMenu,
};


export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(
    undefined,
    mapDispatchToProps,
  ),
)(Settings);

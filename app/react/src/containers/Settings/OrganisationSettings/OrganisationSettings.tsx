import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Row, Tabs } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';


import { LabelsListPage } from './Labels';
import UserListPage from './Users/UserListPage';
import { parseSearch, SETTINGS_PAGINATION_SEARCH_SETTINGS } from '../../../utils/LocationSearchHelper';
import * as menuActions from '../../../state/Menu/actions';

import messages from './messages';
import { RouteComponentProps, withRouter } from 'react-router';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';

const TabPane = Tabs.TabPane;

export interface OrganisationSettingsProps {
  openCloseMenu: (a: any) => void;
}

type Props = OrganisationSettingsProps & InjectedIntlProps & RouteComponentProps<{ organisationId: string }> & InjectedDatamartProps

class OrganisationSettings extends React.Component<Props> {


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

    const parsed = parseSearch(search, SETTINGS_PAGINATION_SEARCH_SETTINGS);
    const tab = parsed.tab ? parsed.tab : 'labels';

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
      pathname: `/v2/o/${organisationId}/settings/organisation`,
      search: `?tab=${tabKey}`,
    });
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const urlParams = this.getUrlParameters();

    const onTabClick = (key: string) => this.switchTab(key)

    return (
      <div>
        <Row className="mcs-table-container">
          <Tabs defaultActiveKey={urlParams.currentTab} tabPosition="left" onTabClick={onTabClick}>
            <TabPane tab={formatMessage(messages.labels)} key="labels"><LabelsListPage /></TabPane>
            <TabPane tab={formatMessage(messages.users)} key="users"><UserListPage /></TabPane>
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
)(OrganisationSettings);

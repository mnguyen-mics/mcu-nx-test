import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { Labels } from '../../../../Labels';
import {
  DisplayCampaignInfoResource,
  AdInfoResource,
} from '../../../../../models/campaign/display';
import CampaignDashboardHeader from '../../../Common/CampaignDashboardHeader';
import AdServingActionBar from './AdServingActionBar';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import AdCard from './AdCard';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import {
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';
import messages from '../messages';
import { FormattedMessage } from 'react-intl';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';


const { Content } = Layout;

export interface DisplayCampaignProps {
  campaign: DisplayCampaignInfoResource;
}

type Props = DisplayCampaignProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> & InjectedNotificationProps;

class AdServing extends React.Component<Props> {
  componentDidMount() {
    const {
      history,
      location: { search, pathname },
    } = this.props;

    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
      });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      history,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch },
    } = nextProps;

    if (!compareSearches(search, nextSearch)) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            DISPLAY_DASHBOARD_SEARCH_SETTINGS,
          ),
        });
      }
    }
  }

  archiveCampaign = (campaignId: string) => {
    const {
      history,
      match: { params: { organisationId } }
    } = this.props;
    return DisplayCampaignService.updateCampaign(campaignId, {archived: true})
      .then(() => {
        history.push({
          pathname: `/v2/o/${organisationId}/campaigns/display`
        })
      }).catch(err => {
        this.props.notifyError(err)
      })
  };

  public render() {
    const {
      campaign,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const adList: AdInfoResource[] = [];
    campaign.ad_groups.forEach(adgroup => {
      adgroup.ads.forEach(ad => {
        adList.push(ad);
      });
    });
    return (
      <div className="ant-layout">
        <AdServingActionBar
          campaign={campaign}
          archiveCampaign={this.archiveCampaign}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader campaign={campaign} showStatus={false} />
            <Labels
              labellableId={campaign.id}
              organisationId={organisationId}
              labellableType="DISPLAY_CAMPAIGN"
            />
            {adList.map(ad => {
              return <AdCard key={ad.id} ad={ad} />;
            })}
            {adList.length === 0 ? 
              <Row>
                <Col span={24} className="mcs-table-view-empty" style={{ marginTop: 200 }}>
                  <FormattedMessage {...messages.emptyAds} />
                </Col>
              </Row> 
            : null }
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, DisplayCampaignProps>(withRouter, injectNotifications)(AdServing);

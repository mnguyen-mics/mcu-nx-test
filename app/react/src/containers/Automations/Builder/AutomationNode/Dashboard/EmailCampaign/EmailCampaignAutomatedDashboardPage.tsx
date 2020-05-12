import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Layout } from 'antd';
import CampaignDashboardHeader from '../../../../../Campaigns/Common/CampaignDashboardHeader';
import { Card } from '@mediarithmics-private/mcs-components-library';
import {
  EMAIL_DASHBOARD_SEARCH_SETTINGS,
  EmailDashboardSearchSettings,
} from '../../../../../Campaigns/Email/Dashboard/constants';
import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  updateSearch,
} from '../../../../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { EmailCampaignResource } from '../../../../../../models/campaign/email';
import { Index } from '../../../../../../utils';
import Overview from '../../../../../Campaigns/Email/Dashboard/Overview';
import { EmailStackedAreaChart } from '../../../../../Campaigns/Email/Dashboard/Charts';
import { McsDateRangeValue } from '../../../../../../components/McsDateRangePicker';
import ReportService from '../../../../../../services/ReportService';
import log from '../../../../../../utils/Logger';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import { McsIcon } from '../../../../../../components';
import ActionBar from '../../../../../../components/ActionBar';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IEmailCampaignService } from '../../../../../../services/EmailCampaignService';
import { TYPES } from '../../../../../../constants/types';

export interface EmailCampaignAutomatedDashboardPageProps {
  campaignId: string;
  close: () => void;
}

const { Content } = Layout;

const messageMap = defineMessages({
  overview: {
    id: 'email.automatedCampaigns.dashboard.tabs.overview',
    defaultMessage: 'Overview',
  },
  devileryAnalysis: {
    id: 'email.automatedCampaigns.dashboard.tabs.deliveryAnalysis',
    defaultMessage: 'Delivery Analysis',
  },
  statusUpdateSuccess: {
    id: 'email.automatedCampaigns.dashboard.status-update-successfull',
    defaultMessage: 'Campaign status successfully updated',
  },
  statusUpdateFailure: {
    id: 'email.automatedCampaigns.dashboard.status-update-failure',
    defaultMessage:
      'There was an error updating your campaign... Please try again...',
  },
  notifSuccess: {
    id: 'email.automatedCampaigns.dashboard.notification-success',
    defaultMessage: 'Success',
  },
  notifError: {
    id: 'email.automatedCampaigns.dashboard.notification-error',
    defaultMessage: 'Error',
  },
});

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  EmailCampaignAutomatedDashboardPageProps;

interface State {
  campaign?: EmailCampaignResource;
  isLoadingCampaign: boolean;
  campaignStatReport: Array<Index<any>>;
  isLoadingCampaignStatReport: boolean;
}

class EmailCampaignAutomatedDashboardPage extends React.Component<
  Props,
  State
> {

  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingCampaign: true,
      isLoadingCampaignStatReport: true,
      campaignStatReport: [],
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
      campaignId,
    } = this.props;
    if (!isSearchValid(search, EMAIL_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS),
      });
    } else {
      const filter = parseSearch<EmailDashboardSearchSettings>(
        search,
        EMAIL_DASHBOARD_SEARCH_SETTINGS,
      );
      this.loadCampaign(campaignId);
      this.refreshStats(organisationId, campaignId, filter);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      campaignId,
      history,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch },
      match: {
        params: { organisationId: nextOrganisationId },
      },
      campaignId: nextCampaignId,
    } = nextProps;
    if (!compareSearches(search, nextSearch) || campaignId !== nextCampaignId) {
      if (!isSearchValid(nextSearch, EMAIL_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            EMAIL_DASHBOARD_SEARCH_SETTINGS,
          ),
        });
      } else {
        const filter = parseSearch<EmailDashboardSearchSettings>(
          nextSearch,
          EMAIL_DASHBOARD_SEARCH_SETTINGS,
        );
        this.loadCampaign(nextCampaignId);
        this.refreshStats(nextOrganisationId, nextCampaignId, filter);
      }
    }
  }

  loadCampaign = (campaignId: string) => {
    if (!this.state.campaign || this.state.campaign.id !== campaignId) {
      this.setState({ isLoadingCampaign: true });
      this._emailCampaignService.getEmailCampaign(campaignId)
        .then(res => {
          this.setState({
            isLoadingCampaign: false,
            campaign: res.data,
          });
        })
        .catch(err => {
          log.error(err);
          this.setState({
            isLoadingCampaign: false,
          });
          this.props.notifyError(err);
        });
    }
  };

  refreshStats = (
    organisationId: string,
    campaignId: string,
    filter: EmailDashboardSearchSettings,
  ) => {
    this.setState({
      isLoadingCampaignStatReport: true,
    });
    ReportService.getSingleEmailDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      ['day'],
    )
      .then(res => {
        this.setState({
          isLoadingCampaignStatReport: false,
          campaignStatReport: normalizeReportView(res.data.report_view),
        });
      })
      .catch(err => {
        log.error(err);
        this.setState({
          isLoadingCampaignStatReport: false,
        });
        this.props.notifyError(err);
      });
  };

  updateLocationSearch(params: Index<any>) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        EMAIL_DASHBOARD_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  render() {
    const {     
      location: { search },
      intl,
    } = this.props;

    const {
      campaign,
      isLoadingCampaignStatReport,
      campaignStatReport,
      isLoadingCampaign,
    } = this.state;

    const filter = parseSearch(
      search,
      EMAIL_DASHBOARD_SEARCH_SETTINGS,
    ) as EmailDashboardSearchSettings;

    const handleDateRangeChange = (values: McsDateRangeValue) =>
      this.updateLocationSearch(values);

   

    return (
      <div className="ant-layout">
        <ActionBar
          paths={[
            {
              name: campaign ? campaign.name : ''
            }
          ]}
          edition={true}
        >
          <McsIcon
            type="close"
            className="close-icon"
            style={{cursor: 'pointer'}}
            onClick={this.props.close}
          />
        </ActionBar> 
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader campaign={campaign} />
            <Card
              title={intl.formatMessage(messageMap.overview)}
            >
              <Overview campaign={campaign} isLoading={isLoadingCampaign} />
            </Card>
            <Card
              title={intl.formatMessage(messageMap.devileryAnalysis)}
            >
              <EmailStackedAreaChart
                dateRangeValue={{ from: filter.from, to: filter.to }}
                onDateRangeChange={handleDateRangeChange}
                isLoading={isLoadingCampaignStatReport}
                emailReport={campaignStatReport}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, EmailCampaignAutomatedDashboardPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(EmailCampaignAutomatedDashboardPage);

import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import McsMoment from '../../../../../utils/McsMoment';
import log from '../../../../../utils/Logger';
import TotalConsumption from '../Common/TotalConsumption';
import messages from '../messages';
import { DisplayCampaignResource } from '../../../../../models/campaign/display/DisplayCampaignResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';

interface RouterProps {
  organisationId: string;
  campaignId: string;
}

type CampaignDisplayProgressProps = InjectedIntlProps &
  RouteComponentProps<RouterProps>;

interface CampaignDisplayProgressState {
  isLoading: boolean;
  campaign?: DisplayCampaignResource;
  error: boolean;
}

class CampaignDisplayProgress extends React.Component<
  CampaignDisplayProgressProps,
  CampaignDisplayProgressState
> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: CampaignDisplayProgressProps) {
    super(props);
    this.state = {
      isLoading: false,
      error: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;
    this.fetchAll(organisationId, campaignId);
  }

  componentDidUpdate(previousProps: CampaignDisplayProgressProps) {
    const {
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;

    const {
      match: {
        params: {
          organisationId: previousOrganisationId,
          campaignId: previousCampaignId,
        },
      },
    } = previousProps;

    if (
      previousCampaignId !== campaignId &&
      previousOrganisationId !== organisationId
    ) {
      this.fetchAll(organisationId, campaignId);
    }
  }

  fetchAll = (organisationId: string, id: string) => {
    this.setState(
      prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.isLoading = true;
        return nextState;
      },
      () => {
        this._displayCampaignService
          .getCampaignDisplay(id)
          .then(response => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.campaign = response.data;
              nextState.isLoading = false;
              return nextState;
            });
          })
          .catch(err => {
            log.error(err);
            this.setState({
              isLoading: false,
              error: true,
            });
          });
      },
    );
  };

  render() {
    const { campaign, isLoading } = this.state;

    const {
      intl: { formatMessage },
    } = this.props;

    let from = new McsMoment('now');
    let periodMessage = '';
    switch (campaign && campaign.max_budget_period) {
      case 'DAY':
        from = new McsMoment('now');
        periodMessage = formatMessage(messages.dailyBudgetConsumption);
        break;
      case 'WEEK':
        from = new McsMoment('now-7d');
        periodMessage = formatMessage(messages.weeklyBudgetConsumption);
        break;
      case 'MONTH':
        from = new McsMoment('now-30d');
        periodMessage = formatMessage(messages.monthlyBudgetConsumption);
        break;
      default:
        from = new McsMoment('now');
        periodMessage = formatMessage(messages.dailyBudgetConsumption);
        break;
    }

    const to = new McsMoment('now');
    const fromInfiniteAndBeyond = new McsMoment(1325376000000);

    const totalBudgetGlobal = (campaign && campaign.total_budget) || 1;
    const totalBudgetPeriod = (campaign && campaign.max_budget_per_period) || 1;

    const totalMessage = formatMessage(messages.totalBudgetConsumption);

    return campaign &&
      campaign.id &&
      campaign.organisation_id &&
      campaign.max_budget_period ? (
      <Row gutter={100}>
        <Col span={12}>
          <TotalConsumption
            formattedMessage={totalMessage}
            loading={isLoading}
            id={campaign && campaign.id}
            organisationId={campaign.organisation_id}
            objectType="campaign"
            totalBudget={totalBudgetGlobal}
            from={fromInfiniteAndBeyond}
            to={to}
          />
        </Col>
        <Col span={12}>
          <TotalConsumption
            formattedMessage={periodMessage}
            loading={isLoading}
            id={campaign.id}
            organisationId={campaign.organisation_id}
            objectType="campaign"
            totalBudget={totalBudgetPeriod}
            from={from}
            to={to}
          />
        </Col>
      </Row>
    ) : (
      <Row gutter={100}>
        <Col span={12}>
          <div className="mcs-progress-wrapper">
            <i className="mcs-table-cell-loading" style={{ width: '100%' }} />
          </div>
        </Col>
        <Col span={12}>
          <div className="mcs-progress-wrapper">
            <i className="mcs-table-cell-loading" style={{ width: '100%' }} />
          </div>
        </Col>
      </Row>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
)(CampaignDisplayProgress);

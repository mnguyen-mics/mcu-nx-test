import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { compose } from 'recompose';

import DisplayCampaignService from '../../../../../services/DisplayCampaignService.ts';
import McsMoment from '../../../../../utils/McsMoment.ts';
import TotalConsumption from '../Common/TotalConsumption';
import messages from '../messages';


class CampaignDisplayProgress extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      campaign: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
    } = this.props;
    this.fetchAll(organisationId, campaignId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
    } = this.props;

    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          campaignId: nextCampaignId,
        },
      },
    } = nextProps;

    if (nextCampaignId !== campaignId && nextOrganisationId !== organisationId) {
      this.fetchAll(organisationId, campaignId);
    }

  }

  fetchAll = (organisationId, id) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {
      DisplayCampaignService.getCampaignDisplay(id).then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.campaign = response.data;
          nextState.isLoading = false;
          return nextState;
        });
      });

    });
  }

  render() {
    const {
      campaign,
      isLoading,
    } = this.state;

    const {
      intl: {
        formatMessage,
      },
    } = this.props;

    let from = new McsMoment('now');
    let periodMessage = '';
    switch (campaign.max_budget_period) {
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
    const fromInfiniteAndBeyond = new McsMoment(0);

    const totalBudgetGlobal = campaign.total_budget;
    const totalBudgetPeriod = campaign.max_budget_per_period;

    const totalMessage = formatMessage(messages.totalBudgetConsumption);

    return campaign.max_budget_period ? (
      <Row gutter={100}>
        <Col span={12}>
          <TotalConsumption
            formattedMessage={totalMessage}
            loading={isLoading}
            id={campaign.id}
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
    ) : <Row gutter={100}>
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
    </Row>;
  }

}

CampaignDisplayProgress.propTypes = {
  match: PropTypes.shape().isRequired,
  intl: intlShape.isRequired,
};

CampaignDisplayProgress = compose(
  injectIntl,
  withRouter,
)(CampaignDisplayProgress);

export default CampaignDisplayProgress;

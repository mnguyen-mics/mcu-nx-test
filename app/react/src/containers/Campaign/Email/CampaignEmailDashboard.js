import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import lodash from 'lodash';
import { CampaignDashboardTabs } from '../../../components/CampaignDashboardTabs';
import { StackedAreaPlot } from '../../../components/StackedAreaPlot';
import { PieChart } from '../../../components/PieChart';
import * as CampaignEmailActions from '../../../state/Campaign/Email/actions';
import { McsDateRangePicker } from '../../../components/McsDateRangePicker';
import { EmptyCharts } from '../../../components/EmptyCharts';
import { LegendChart } from '../../../components/LegendChart';

import {
  CAMPAIGN_EMAIL_QUERY_SETTINGS
} from '../RouteQuerySelector';

import {
  updateQueryWithParams,
  deserializeQuery
} from '../../../services/RouteQuerySelectorService';

import {
  getTableDataSource
 } from '../../../state/Campaign/Email/selectors';

class CampaignEmailDashboard extends Component {

  componentDidMount() {
    const {
      params: {
        campaignId
      },
      query,
      loadCampaignEmailAndDeliveryReport
    } = this.props;

    const filter = deserializeQuery(query, CAMPAIGN_EMAIL_QUERY_SETTINGS);

    loadCampaignEmailAndDeliveryReport(campaignId, filter);
  }

  componentWillUnmount() {
    this.props.resetCampaignEmail();
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      loadCampaignEmailAndDeliveryReport
    } = this.props;

    const {
      params: {
        campaignId
      },
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, CAMPAIGN_EMAIL_QUERY_SETTINGS);
      loadCampaignEmailAndDeliveryReport(campaignId, filter);
    }
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, CAMPAIGN_EMAIL_QUERY_SETTINGS)
    });
  }

  renderDatePicker() {
    const {
      query
    } = this.props;

    const filter = deserializeQuery(query, CAMPAIGN_EMAIL_QUERY_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to
    };

    const onChange = (newValues) => this.updateQueryParams({
      rangeType: newValues.rangeType,
      lookbackWindow: newValues.lookbackWindow,
      from: newValues.from,
      to: newValues.to,
    });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderOverview() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
    } = this.props;

    const options = {
      domains: ['email_sent', 'clicks', 'impressions', 'email_hard_bounced'],
      colors: ['#ff9012', '#00a1df', '#00ad68', '#f12f2f']
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            <LegendChart identifier="chartLegend" options={options} />
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        { (dataSource.length === 0 && hasFetchedCampaignStat) ? <EmptyCharts title={translations.NO_EMAIL_STATS} /> : this.renderStackedAreaCharts() }
      </div>
    );

    return chartArea;
  }

  renderDeliveryAnalysis() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat
    } = this.props;

    const chartArea = (
      <div>
        <Row>
          <Col span={24}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        { (dataSource.length === 0 && hasFetchedCampaignStat) ? <EmptyCharts title={translations.NO_EMAIL_STATS} /> : this.renderPieCharts() }
      </div>
    );

    return chartArea;
  }

  renderStackedAreaCharts() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
      query
    } = this.props;

    const filter = deserializeQuery(query, CAMPAIGN_EMAIL_QUERY_SETTINGS);

    const {
      lookbackWindow
    } = filter;

    const optionsForChart = {
      xKey: 'day',
      yKeys: ['email_sent', 'clicks', 'impressions', 'email_hard_bounced'],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#ff9012', '#00a1df', '#00ad68', '#f12f2f']
    };
    if (hasFetchedCampaignStat) {
      console.log(dataSource);
    }
    return hasFetchedCampaignStat ? (<StackedAreaPlot identifier="test2" dataset={dataSource} options={optionsForChart} />) : (<span>Loading</span>);
  }

  renderPieCharts() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat
    } = this.props;

    const optionsForCirclePieChart = {
      innerRadius: true,
      colors: ['#eaeaea', '#ff9012']
    };

    const optionsForHalfCirclePieChart = {
      innerRadius: true,
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2,
      colors: ['#00a1df', '#eaeaea']
    };

    const data = [
      { key: 'opens', val: 10, color: '#00a1df' },
      { key: 'rest', val: 15, color: '#eaeaea' }
    ];

    const dataDelive = [
      { key: 'rest', val: 10, color: '#eaeaea' },
      { key: 'delivered', val: 90, color: '#ff9012' }
    ];

    let dataDelivered = [];
    let dataOpens = [];
    let dataClicks2Opens = [];
    let dataUnsubscribe = [];
    let dataClicks = [];

    if (hasFetchedCampaignStat) {
      const emailSent = dataSource.reduce((a, b) => {
        return a + b.email_sent;
      }, 0);

      const emailHardBounced = dataSource.reduce((a, b) => {
        return a + b.email_hard_bounced;
      }, 0);

      const emailSoftBounced = dataSource.reduce((a, b) => {
        return a + b.email_soft_bounced;
      }, 0);

      const emailDelivered = emailSent - emailHardBounced - emailSoftBounced;
      const emailOpened = dataSource.reduce((a, b) => {
        return a + b.impressions;
      }, 0);
      const emailClicks = dataSource.reduce((a, b) => {
        return a + b.clicks;
      }, 0);
      const emailUnsubscribe = dataSource.reduce((a, b) => {
        return a + b.email_unsubscribed;
      }, 0);

      dataDelivered = [
        { key: 'delivered', val: emailDelivered, color: '#eaeaea' },
        { key: 'rest', val: emailSent - emailDelivered, color: '#ff9012' }
      ];

      dataOpens = [
        { key: 'delivered', val: emailOpened, color: '#eaeaea' },
        { key: 'rest', val: emailSent - emailOpened, color: '#ff9012' }
      ];

      dataClicks2Opens = [
        { key: 'delivered', val: emailClicks, color: '#eaeaea' },
        { key: 'rest', val: emailOpened - emailClicks, color: '#ff9012' }
      ];

      dataClicks = [
        { key: 'delivered', val: emailClicks, color: '#eaeaea' },
        { key: 'rest', val: emailSent - emailClicks, color: '#ff9012' }
      ];

      dataUnsubscribe = [
        { key: 'unsubscribe', val: emailUnsubscribe, color: '#eaeaea' },
        { key: 'rest', val: emailSent - emailUnsubscribe, color: '#ff9012' }
      ];
    }

    return hasFetchedCampaignStat ? (
      <div>
        <Row>
          <Col span={9}>
            <PieChart identifier="pieDelivered" dataset={dataDelivered} options={optionsForCirclePieChart} />
          </Col>
          <Col span={15}>
            <Row>
              <Col span={12}>
                <PieChart identifier="pieOpens" dataset={dataOpens} options={optionsForHalfCirclePieChart} />
              </Col>
              <Col span={12}>
                <PieChart identifier="pieClicks" dataset={dataClicks} options={optionsForHalfCirclePieChart} />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <PieChart identifier="pieClicks2Opens" dataset={dataClicks2Opens} options={optionsForHalfCirclePieChart} />
              </Col>
              <Col span={12}>
                <PieChart identifier="pieUnsubscribe" dataset={dataUnsubscribe} options={optionsForHalfCirclePieChart} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>) : (<span>Loading</span>);
  }

  render() {

    const {
      translations,
      dataSource,
      hasFetchedCampaignStat
    } = this.props;

    const items = [
      {
        title: translations.CAMPAIGN_OVERVIEW,
        display: this.renderOverview()
      },
      {
        title: translations.CAMPAIGN_DELIVERY_ANALYSIS,
        display: this.renderDeliveryAnalysis()
      }
    ];

    return <CampaignDashboardTabs items={items} />;
  }

}

CampaignEmailDashboard.propTypes = {
  translations: PropTypes.object.isRequired,  // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  params: PropTypes.shape({
    campaignId: PropTypes.string
  }).isRequired,
  loadCampaignEmailAndDeliveryReport: PropTypes.func.isRequired,
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  resetCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  translations: state.translationsState.translations,
  params: ownProps.router.params,
  query: ownProps.router.location.query,
  isFetchingCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.isFetching,
  hasFetchedCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.hasFetched,
  dataSource: getTableDataSource(state)
});


const mapDispatchToProps = {
  loadCampaignEmailAndDeliveryReport: CampaignEmailActions.loadCampaignEmailAndDeliveryReport,
  resetCampaignEmail: CampaignEmailActions.resetCampaignEmail
};

CampaignEmailDashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailDashboard);

export default CampaignEmailDashboard;

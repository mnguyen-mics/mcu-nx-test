import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import lodash from 'lodash';
import { Row, Col } from 'antd';
import { EmptyCharts } from '../../../../components/EmptyCharts';
import * as CampaignEmailActions from '../../../../state/Campaign/Email/actions';
import { McsDateRangePicker } from '../../../../components/McsDateRangePicker';
import { PieChart } from '../../../../components/PieChart';

import {
  CAMPAIGN_EMAIL_QUERY_SETTINGS
} from '../../RouteQuerySelector';

import {
  updateQueryWithParams,
  deserializeQuery
} from '../../../../services/RouteQuerySelectorService';

import {
  getTableDataSource,
  flattenData
 } from '../../../../state/Campaign/Email/selectors';

class EmailPieCharts extends Component {

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

  renderPieCharts() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
      flatData
    } = this.props;

    const emailDelivered = flatData.uniq_email_sent - flatData.uniq_email_hard_bounced - flatData.uniq_email_soft_bounced;
    const emailOpened = flatData.uniq_impressions;
    const emailUnsubscribe = flatData.uniq_email_unsubscribed;
    const emailClicks = flatData.uniq_clicks;
    const emailSent = flatData.uniq_email_sent;

    const generateRatio = (a, b) => {
      const ratio = (a / b) * 100;
      return `${Math.round(ratio, 2)}%`;
    };

    const generateData = (type) => {

      switch (type) {
        case 'delivered':
          return [
            { key: 'delivered', val: emailDelivered, color: '#ff9012' },
            { key: 'rest', val: emailSent - emailDelivered, color: '#eaeaea' }
          ];
        case 'opens':
          return [
            { key: 'delivered', val: emailOpened },
            { key: 'rest', val: emailSent - emailOpened }
          ];
        case 'clicks2open':
          return [
            { key: 'clicks', val: emailClicks },
            { key: 'rest', val: emailOpened - emailClicks }
          ];
        case 'clicks':
          return [
            { key: 'clicks', val: emailClicks },
            { key: 'rest', val: emailSent - emailClicks }
          ];
        case 'unsubscribe':
          return [
            { key: 'unsubscribe', val: emailUnsubscribe },
            { key: 'rest', val: emailSent - emailUnsubscribe }
          ];
        default:
          return [];
      }
    };

    const generateOptions = (isHalf, color, translationKey, ratioValeA, ratioValeB) => {

      let colorFormated = '';
      if (color === 'blue') {
        colorFormated = '#00a1df';
      } else {
        colorFormated = '#ff9012';
      }
      const gray = '#eaeaea';

      const options = {
        innerRadius: true,
        isHalf: isHalf,
        text: {
          value: generateRatio(ratioValeA, ratioValeB),
          text: translations[translationKey]
        }
      };

      if (isHalf === true) {
        options.colors = [colorFormated, gray];
      } else {
        options.colors = [colorFormated, gray];
      }

      return options;
    };

    return hasFetchedCampaignStat ? (
      <div>
        <Row>
          <Col span={8}>
            <PieChart identifier="pieDelivered1" dataset={generateData('delivered')} options={generateOptions(false, 'orange', 'DELIVERED', emailDelivered, emailSent)} />
          </Col>
          <Col span={16}>
            <Row>
              <Col span={12}>
                <PieChart identifier="pieOpens1" dataset={generateData('opens')} options={generateOptions(true, 'blue', 'OPENS', emailOpened, emailSent)} />
              </Col>
              <Col span={12}>
                <PieChart identifier="pieClicks1" dataset={generateData('clicks')} options={generateOptions(true, 'blue', 'CLICKS', emailClicks, emailSent)} />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <PieChart identifier="pieClicks2Opens1" dataset={generateData('clicks2open')} options={generateOptions(true, 'blue', 'CLICKS_TO_OPENS', emailClicks, emailOpened)} />
              </Col>
              <Col span={12}>
                <PieChart identifier="pieUnsubscribe1" dataset={generateData('unsubscribe')} options={generateOptions(true, 'blue', 'UNSUBSCRIBE', emailUnsubscribe, emailSent)} />
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
}
EmailPieCharts.propTypes = {
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
  flatData: PropTypes.object.isRequired,  // eslint-disable-line react/forbid-prop-types
  resetCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  translations: state.translationsState.translations,
  params: ownProps.router.params,
  query: ownProps.router.location.query,
  isFetchingCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.isFetching,
  hasFetchedCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.hasFetched,
  dataSource: getTableDataSource(state),
  flatData: flattenData(state)
});


const mapDispatchToProps = {
  loadCampaignEmailAndDeliveryReport: CampaignEmailActions.loadCampaignEmailAndDeliveryReport,
  resetCampaignEmail: CampaignEmailActions.resetCampaignEmail
};

EmailPieCharts = connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailPieCharts);

export default EmailPieCharts;

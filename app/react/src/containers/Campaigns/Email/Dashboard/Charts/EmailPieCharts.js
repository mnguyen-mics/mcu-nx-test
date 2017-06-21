import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';

import { EmptyCharts } from '../../../../../components/EmptyCharts';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { PieChart } from '../../../../../components/PieChart';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch
} from '../../../../../utils/LocationSearchHelper';

import {
  getTableDataSource,
  flattenData
 } from '../../../../../state/Campaign/Email/selectors';

class EmailPieCharts extends Component {

  updateLocationSearch(params) {
    const {
      history,
      location: {
        search: currentSearch,
        pathname
      }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, EMAIL_DASHBOARD_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      history: {
        location: {
          search
        }
      }
    } = this.props;

    const filter = parseSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to
    };

    const onChange = (newValues) => this.updateLocationSearch({
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
            { key: 'delivered', val: emailDelivered ? emailDelivered : 0, color: '#ff9012' },
            { key: 'rest', val: (emailDelivered === 0) ? 100 : Math.abs(emailSent - emailDelivered), color: '#eaeaea' }
          ];
        case 'opens':
          return [
            { key: 'delivered', val: emailOpened ? emailOpened : 0 },
            { key: 'rest', val: emailOpened === 0 ? 100 : Math.abs(emailSent - emailOpened) }
          ];
        case 'clicks2open':
          return [
            { key: 'clicks', val: emailClicks ? emailClicks : 0 },
            { key: 'rest', val: emailClicks === 0 ? 100 : Math.abs(emailOpened - emailClicks) }
          ];
        case 'clicks':
          return [
            { key: 'clicks', val: emailClicks ? emailClicks : 0 },
            { key: 'rest', val: emailClicks === 0 ? 100 : Math.abs(emailSent - emailClicks) }
          ];
        case 'unsubscribe':
          return [
            { key: 'unsubscribe', val: emailUnsubscribe ? emailUnsubscribe : 0 },
            { key: 'rest', val: emailUnsubscribe === 0 ? 100 : Math.abs(emailSent - emailUnsubscribe) }
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
          value: (ratioValeB === 0 || ratioValeA === 0) ? '0%' : generateRatio(ratioValeA, ratioValeB),
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
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  flatData: PropTypes.object.isRequired,  // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasFetchedCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.hasFetched,
  dataSource: getTableDataSource(state),
  flatData: flattenData(state)
});


EmailPieCharts = connect(
  mapStateToProps
)(EmailPieCharts);

EmailPieCharts = withRouter(EmailPieCharts);

export default EmailPieCharts;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index.ts';
import * as EmailCampaignActions from '../../../../../state/Campaign/Email/actions';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker.tsx';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart/index.ts';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import {
  updateSearch,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper.ts';

import { getTableDataSource } from '../../../../../state/Campaign/Email/selectors';

import injectThemeColors from '../../../../../containers/Helpers/injectThemeColors.ts';

class EmailStackedAreaChart extends Component {

  generateColors = () => {
    const {
      colors
    } = this.props;
    return [colors['mcs-warning'], colors['mcs-info'], colors['mcs-success'], colors['mcs-error']];
  }

  updateLocationSearch(params) {
    const {
      history,
      location: {
        search: currentSearch,
        pathname,
      },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, EMAIL_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      history: {
        location: {
          search,
        },
      },
    } = this.props;

    const filter = parseSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues) => this.updateLocationSearch({
      from: newValues.from,
      to: newValues.to,
    });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const {
      dataSource,
      hasFetchedCampaignStat,
    } = this.props;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'email_sent', message: messages.emailSent },
        { key: 'clicks', message: messages.emailClicks },
        { key: 'impressions', message: messages.emailImpressions },
        { key: 'email_hard_bounced', message: messages.emailHardBounce },
      ],
      colors: this.generateColors(),
    };
    return hasFetchedCampaignStat
      ? (
        <StackedAreaPlot
          identifier="StackedAreaChartEmailOverview"
          dataset={dataSource}
          options={optionsForChart}
        />
      )
      : <LoadingChart />;
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
      colors
    } = this.props;

    const options = [{
      domain: translations['email_sent'.toUpperCase()],
      color: colors['mcs-warning'],
    }, {
      domain: translations['clicks'.toUpperCase()],
      color: colors['mcs-info'],
    }, {
      domain: translations['impressions'.toUpperCase()],
      color: colors['mcs-success'],
    }, {
      domain: translations['email_hard_bounced'.toUpperCase()],
      color: colors['mcs-error']
    }];

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource.length === 0 && hasFetchedCampaignStat
              ? <div />
              : <LegendChart identifier="chartLegend" options={options} />
            }
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        {dataSource.length === 0 && hasFetchedCampaignStat
          ? <EmptyCharts title={translations.NO_EMAIL_STATS} />
          : this.renderStackedAreaCharts()
        }
      </div>
    );

    return chartArea;
  }
}

EmailStackedAreaChart.propTypes = {
  translations: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  colors: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  isFetchingCampaignStat: state.emailCampaignSingle.emailCampaignPerformance.isFetching,
  hasFetchedCampaignStat: state.emailCampaignSingle.emailCampaignPerformance.hasFetched,
  dataSource: getTableDataSource(state),
});


const mapDispatchToProps = {
  loadEmailCampaignAndDeliveryReport: EmailCampaignActions.loadEmailCampaignAndDeliveryReport,
  resetEmailCampaign: EmailCampaignActions.resetEmailCampaign
};


EmailStackedAreaChart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailStackedAreaChart);


EmailStackedAreaChart = compose(
  injectIntl,
  injectThemeColors,
  withRouter,
)(EmailStackedAreaChart);

export default EmailStackedAreaChart;

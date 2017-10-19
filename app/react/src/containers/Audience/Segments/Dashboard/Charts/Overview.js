import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index.ts';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker.tsx';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';

import {
  getAudienceSegmentPerformance
} from '../../../../../state/Audience/Segments/selectors';

import messages from '../messages';


class Overview extends Component {

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
      search: updateSearch(currentSearch, params, SEGMENT_QUERY_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: {
        search,
      },
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues) => this.updateLocationSearch({
      rangeType: newValues.rangeType,
      lookbackWindow: newValues.lookbackWindow,
      from: newValues.from,
      to: newValues.to,
    });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const {
      location: {
        search,
      },
      dataSource,
      hasFetchedAudienceStat,
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

    const { lookbackWindow } = filter;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'user_points', message: messages.userPoints },
        { key: 'user_accounts', message: messages.userAccounts },
        { key: 'emails', message: messages.emails },
        { key: 'desktop_cookie_ids', message: messages.desktopCookieId },
      ],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#ff9012', '#00a1df', '#00ad68', '#f12f2f'],
    };
    return (hasFetchedAudienceStat
      ? (
        <StackedAreaPlot
          identifier="StackedAreaChartEmailOverview"
          dataset={dataSource}
          options={optionsForChart}
        />
      )
      : <LoadingChart />
    );
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
    } = this.props;

    const options = {
      domains: [
        translations['user_points'.toUpperCase()],
        translations['user_accounts'.toUpperCase()],
        translations['emails'.toUpperCase()],
        translations['desktop_cookie_ids'.toUpperCase()],
      ],
      colors: ['#ff9012', '#00a1df', '#00ad68', '#f12f2f'],
    };

    return (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource.length === 0 && hasFetchedAudienceStat
              ? <div />
              : <LegendChart identifier="LegendOverview" options={options} />
            }
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        { dataSource.length === 0 && hasFetchedAudienceStat
          ? <EmptyCharts title={translations.NO_EMAIL_STATS} />
          : this.renderStackedAreaCharts()
        }
      </div>
    );
  }
}

Overview.propTypes = {
  translations: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  hasFetchedAudienceStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasFetchedAudienceStat: state.audienceSegmentsTable.performanceReportSingleApi.hasFetched,
  dataSource: getAudienceSegmentPerformance(state),
});

Overview = connect(mapStateToProps)(Overview);
Overview = withRouter(Overview);

export default Overview;

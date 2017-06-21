import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';

import { EmptyCharts } from '../../../../../components/EmptyCharts';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { VerticalBarChart } from '../../../../../components/BarCharts';
import { LegendChart } from '../../../../../components/LegendChart';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch
} from '../../../../../utils/LocationSearchHelper';

import {
  getSinglePerfView
 } from '../../../../../state/Audience/Segments/selectors';


class Overlap extends Component {

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
      search: updateSearch(currentSearch, params, SEGMENT_QUERY_SETTINGS)
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: {
        search
      }
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

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

  renderStackedAreaCharts() {
    const {
      location: {
        search
      },
      dataSource,
      hasFetchedAudienceStat
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

    const { lookbackWindow } = filter;

    const fakeData = [{ segment_source_id: '4237', segment_intersect_with: '3261', overlap_number: 8 }, { segment_source_id: '4237', segment_intersect_with: '3257', overlap_number: 59 }, { segment_source_id: '4237', segment_intersect_with: '3248', overlap_number: 12 }, { segment_source_id: '4237', segment_intersect_with: '3073', overlap_number: 45 }, { segment_source_id: '4237', segment_intersect_with: '3236', overlap_number: 3 }, { segment_source_id: '4237', segment_intersect_with: '3251', overlap_number: 38 }, { segment_source_id: '4237', segment_intersect_with: '3239', overlap_number: 0 }, { segment_source_id: '4237', segment_intersect_with: '2488', overlap_number: 3 }, { segment_source_id: '4237', segment_intersect_with: '3258', overlap_number: 116 }, { segment_source_id: '4237', segment_intersect_with: '3124', overlap_number: 0 }, { segment_source_id: '4237', segment_intersect_with: '3126', overlap_number: 27 }, { segment_source_id: '4237', segment_intersect_with: '3096', overlap_number: 6 }, { segment_source_id: '4237', segment_intersect_with: '3134', overlap_number: 167 }, { segment_source_id: '4237', segment_intersect_with: '3123', overlap_number: 0 }, { segment_source_id: '4237', segment_intersect_with: '3002', overlap_number: 2 }];
    fakeData.sort((a, b) => {
      return a.overlap_number > b.overlap_number ? -1 : 1;
    });

    const optionsForChart = {
      xKey: 'segment_intersect_with',
      yKeys: ['overlap_number'],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#ff9012']
    };
    return hasFetchedAudienceStat ? (<VerticalBarChart identifier="StackedAreaChartEmailOverlap" dataset={fakeData} options={optionsForChart} />) : (<span>Loading</span>);
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
    } = this.props;

    const options = {
      domains: ['overlap_number'],
      colors: ['#ff9012']
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            { (dataSource.length === 0 && hasFetchedAudienceStat) ? <div /> : <LegendChart identifier="LegendOverlap" options={options} /> }
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        { (dataSource.length === 0 && hasFetchedAudienceStat) ? <EmptyCharts title={translations.NO_EMAIL_STATS} /> : this.renderStackedAreaCharts() }
      </div>
    );

    return chartArea;
  }
}

Overlap.propTypes = {
  translations: PropTypes.object.isRequired,  // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasFetchedAudienceStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasFetchedAudienceStat: state.audienceSegmentsTable.performanceReportSingleApi.hasFetched,
  dataSource: getSinglePerfView(state)
});

Overlap = connect(
  mapStateToProps
)(Overlap);

Overlap = withRouter(Overlap);

export default Overlap;

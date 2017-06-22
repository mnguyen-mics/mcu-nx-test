import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';


import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { StackedBarCharts } from '../../../../../components/BarCharts';
import { LegendChart } from '../../../../../components/LegendChart';
import messages from '../messages';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch
} from '../../../../../utils/LocationSearchHelper';

import {
  getSinglePerfView
 } from '../../../../../state/Audience/Segments/selectors';


class AdditionDeletion extends Component {

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

    const formatedDataSource = dataSource.map(item => {
      const formatedItem = {
        ...item,
        user_point_deletions: -item.user_point_deletions
      };
      return formatedItem;
    });

    const optionsForChart = {
      xKey: 'day',
      yKeys: [{ key: 'user_point_additions', message: messages.userPointAddition }, { key: 'user_point_deletions', message: messages.UserPointDeletion }],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#00ad68', '#ff5959']
    };
    return hasFetchedAudienceStat ? (<StackedBarCharts identifier="StackedBarCharAdditionDeletion" dataset={formatedDataSource} options={optionsForChart} />) : (<LoadingChart />);
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
    } = this.props;

    const options = {
      domains: [translations['user_point_additions'.toUpperCase()], translations['user_point_deletions'.toUpperCase()]],
      colors: ['#00ad68', '#ff5959']
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            { (dataSource.length === 0 && hasFetchedAudienceStat) ? <div /> : <LegendChart identifier="LegendAdditionDeletion" options={options} /> }
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

AdditionDeletion.propTypes = {
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

AdditionDeletion = connect(
  mapStateToProps
)(AdditionDeletion);

AdditionDeletion = withRouter(AdditionDeletion);

export default AdditionDeletion;

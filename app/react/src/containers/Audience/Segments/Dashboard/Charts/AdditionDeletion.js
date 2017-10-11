import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index.ts';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker.tsx';
import { StackedBarCharts } from '../../../../../components/BarCharts/index.ts';
import { LegendChart } from '../../../../../components/LegendChart';
import messages from '../messages';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';

import { getAudienceSegmentPerformance } from '../../../../../state/Audience/Segments/selectors';

class AdditionDeletion extends Component {

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

    const formattedDataSource = dataSource.map(item => {
      return {
        ...item,
        user_point_deletions: -item.user_point_deletions,
      };
    });

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'user_point_additions', message: messages.userPointAddition },
        { key: 'user_point_deletions', message: messages.UserPointDeletion },
      ],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#00ad68', '#ff5959'],
    };
    return hasFetchedAudienceStat
    ? (
      <StackedBarCharts
        identifier="StackedBarCharAdditionDeletion"
        dataset={formattedDataSource}
        options={optionsForChart}
      />
      )
    : <LoadingChart />;
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
    } = this.props;

    const options = {
      domains: [
        translations[
          'user_point_additions'.toUpperCase()],
        translations['user_point_deletions'.toUpperCase()
        ],
      ],
      colors: ['#00ad68', '#ff5959'],
    };

    return (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            { (dataSource.length === 0 && hasFetchedAudienceStat)
              ? <div />
              : <LegendChart identifier="LegendAdditionDeletion" options={options} />
            }
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        { (dataSource.length === 0 && hasFetchedAudienceStat)
          ? <EmptyCharts title={translations.NO_EMAIL_STATS} />
          : this.renderStackedAreaCharts()
        }
      </div>
    );
  }
}

AdditionDeletion.propTypes = {
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

AdditionDeletion = connect(mapStateToProps)(AdditionDeletion);
AdditionDeletion = withRouter(AdditionDeletion);

export default AdditionDeletion;

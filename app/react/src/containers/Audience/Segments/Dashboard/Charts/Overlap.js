import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col, Button, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { VerticalBarChart } from '../../../../../components/BarCharts';
import { LegendChart } from '../../../../../components/LegendChart';
import { McsIcons } from '../../../../../components/McsIcons';
import * as AudienceSegmentActions from '../../../../../state/Audience/Segments/actions';
import { getDefaultDatamart } from '../../../../../state/Session/selectors';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch
} from '../../../../../utils/LocationSearchHelper';

import {
  getSinglePerfView,
  getOverlapView
 } from '../../../../../state/Audience/Segments/selectors';


class Overlap extends Component {

  constructor(props) {
    super(props);
    this.renderModalExtend = this.renderModalExtend.bind(this);
  }

  componentDidMount() {
    const {
      defaultDatamart,
      fetchOverlapAnalysis,
      match: {
        params: {
          segmentId,
          organisationId
        }
      },
    } = this.props;
    const datamartId = defaultDatamart(organisationId).id;
    fetchOverlapAnalysis(segmentId, organisationId, datamartId);
  }

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
      isFetchingOverlap,
      segmentsInformation
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);

    const { lookbackWindow } = filter;

    const data = dataSource.data.slice(0, 20);

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: ['yKey'],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#2FBCF2']
    };
    return !isFetchingOverlap ? (<VerticalBarChart identifier="StackedAreaChartEmailOverlap" dataset={data} options={optionsForChart} />) : (<LoadingChart />);
  }

  renderModalExtend() {
    const {
      createOverlapAnalysis,
      defaultDatamart,
      match: {
        params: {
          organisationId,
          segmentId
        }
      }
    } = this.props;
    const datamartId = defaultDatamart(organisationId).id;

    Modal.confirm({
      title: 'Create an Overlap Analysis',
      content: (
        <div>
          <p>By clicking on OK you will create an overlap of the selected segment</p>
        </div>
      ),
      onOk() {
        console.log(datamartId, segmentId);
        createOverlapAnalysis(datamartId, segmentId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
      isFetchingOverlap,
      hasOverlap
    } = this.props;

    const options = {
      domains: [translations['overlap_number'.toUpperCase()]],
      colors: ['#2FBCF2']
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            { (isFetchingOverlap && !hasFetchedAudienceStat && !hasOverlap) ? <div /> : <LegendChart identifier="LegendOverlap" options={options} /> }
          </Col>
          <Col span={12} className="text-right">
            { (!isFetchingOverlap && hasFetchedAudienceStat && hasOverlap) && (<span className="generated">Generated { moment(dataSource.date).fromNow() }</span>) } {(!isFetchingOverlap && hasFetchedAudienceStat) && (<Button onClick={this.renderModalExtend}><McsIcons type="extend" /> { (hasOverlap) ? (<FormattedMessage id="REFRESH" defaultMessage="Refresh" />) : (<FormattedMessage id="EXTEND" defaultMessage="Extend" />) }</Button>)}
          </Col>
        </Row>
        { (!hasOverlap && hasFetchedAudienceStat && !isFetchingOverlap) ? <EmptyCharts title={translations.NO_EMAIL_STATS} /> : this.renderStackedAreaCharts() }
      </div>
    );

    return chartArea;
  }
}

Overlap.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasFetchedAudienceStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.shape({
    date: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  fetchOverlapAnalysis: PropTypes.func.isRequired,
  isFetchingOverlap: PropTypes.bool.isRequired,
  hasOverlap: PropTypes.bool.isRequired,
  segmentsInformation: PropTypes.arrayOf(PropTypes.object).isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  createOverlapAnalysis: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasFetchedAudienceStat: state.audienceSegmentsTable.performanceReportSingleApi.hasFetched,
  isFetchingOverlap: state.audienceSegmentsTable.overlapAnalysisApi.isFetching,
  hasOverlap: state.audienceSegmentsTable.overlapAnalysisApi.hasOverlap,
  dataSource: getOverlapView(state),
  defaultDatamart: getDefaultDatamart(state),
  segmentsInformation: state.audienceSegmentsTable.audienceSegmentsApi.data,
});

const mapDispatchToProps = {
  fetchOverlapAnalysis: AudienceSegmentActions.fetchAudienceSegmentOverlap.request,
  createOverlapAnalysis: AudienceSegmentActions.createAudienceSegmentOverlap.request,
};

Overlap = connect(
  mapStateToProps,
  mapDispatchToProps
)(Overlap);

Overlap = withRouter(Overlap);

export default Overlap;

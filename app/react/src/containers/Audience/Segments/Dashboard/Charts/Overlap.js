import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col, Button, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { compose } from 'recompose';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index.ts';
import { VerticalBarChart } from '../../../../../components/BarCharts/index.ts';
import { LegendChart } from '../../../../../components/LegendChart';
import McsIcons from '../../../../../components/McsIcons.tsx';
import * as AudienceSegmentActions from '../../../../../state/Audience/Segments/actions';
import { getDefaultDatamart } from '../../../../../state/Session/selectors';
import messages from '../messages';

import { SEGMENT_QUERY_SETTINGS } from '../constants';

import { parseSearch } from '../../../../../utils/LocationSearchHelper';

import { getOverlapView } from '../../../../../state/Audience/Segments/selectors';


class Overlap extends Component {

  componentDidMount() {
    const {
      defaultDatamart,
      fetchOverlapAnalysis,
      match: {
        params: {
          segmentId,
          organisationId,
        },
      },
    } = this.props;
    const datamartId = defaultDatamart(organisationId).id;

    fetchOverlapAnalysis(segmentId, organisationId, datamartId);
  }

  renderStackedAreaCharts() {
    const {
      location: {
        search,
      },
      dataSource,
      isFetchingOverlap,
      colors,
    } = this.props;

    const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);
    const { lookbackWindow } = filter;
    const data = dataSource.data.slice(0, 20);

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: ['yKey'],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: [colors['mcs-info']],
    };

    return !isFetchingOverlap
    ? (
      <VerticalBarChart
        identifier="StackedAreaChartEmailOverlap"
        dataset={data}
        options={optionsForChart}
        colors={{ base: colors['mcs-info'], hover: colors['mcs-warning'] }}
      />
    )
    : <LoadingChart />;
  }

  renderModalExtend = () => {
    const {
      createOverlapAnalysis,
      defaultDatamart,
      match: {
        params: {
          organisationId,
          segmentId,
        },
      },
      intl: { formatMessage },
    } = this.props;
    const datamartId = defaultDatamart(organisationId).id;

    Modal.confirm({
      title: formatMessage(messages.modalOverlapContentTitle),
      content: (
        <div>
          <p>{formatMessage(messages.modalOverlapContentMessage)}</p>
        </div>
      ),
      onOk() {
        createOverlapAnalysis(datamartId, segmentId, organisationId);
      },
      onCancel() {
      },
    });
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
      isFetchingOverlap,
      hasOverlap,
      colors,
    } = this.props;

    const options = {
      domains: [translations['overlap_number'.toUpperCase()]],
      colors: [colors['mcs-info']],
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {isFetchingOverlap && !hasFetchedAudienceStat && !hasOverlap
              ? <div />
              : <LegendChart identifier="LegendOverlap" options={options} />
            }
          </Col>
          <Col span={12} className="text-right">
            {!isFetchingOverlap && hasFetchedAudienceStat && hasOverlap
              && (
                <span className="generated">
                  <FormattedMessage {...messages.generated} /> { moment(dataSource.date).fromNow() }
                </span>
              )
            } {!isFetchingOverlap
                && hasFetchedAudienceStat
                && (
                  <Button onClick={this.renderModalExtend}>
                    <McsIcons type="extend" /> {hasOverlap
                      ? <FormattedMessage {...messages.refresh} />
                      : <FormattedMessage {...messages.createOverlap} />
                    }
                  </Button>
                )
              }
          </Col>
        </Row>
        {!hasOverlap && hasFetchedAudienceStat && !isFetchingOverlap
          ? <EmptyCharts title={translations.NO_EMAIL_STATS} />
          : this.renderStackedAreaCharts()
        }
      </div>
    );

    return chartArea;
  }
}

Overlap.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  hasFetchedAudienceStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.shape({
    date: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  fetchOverlapAnalysis: PropTypes.func.isRequired,
  isFetchingOverlap: PropTypes.bool.isRequired,
  hasOverlap: PropTypes.bool.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  createOverlapAnalysis: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  colors: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasFetchedAudienceStat: state.audienceSegmentsTable.performanceReportSingleApi.hasFetched,
  isFetchingOverlap: state.audienceSegmentsTable.overlapAnalysisApi.isFetching,
  hasOverlap: state.audienceSegmentsTable.overlapAnalysisApi.hasOverlap,
  dataSource: getOverlapView(state),
  defaultDatamart: getDefaultDatamart(state),
  segmentsInformation: state.audienceSegmentsTable.audienceSegmentsApi.data,
  colors: state.theme.colors,
});

const mapDispatchToProps = {
  fetchOverlapAnalysis: AudienceSegmentActions.fetchAudienceSegmentOverlap.request,
  createOverlapAnalysis: AudienceSegmentActions.createAudienceSegmentOverlap.request,
};

Overlap = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Overlap);

Overlap = compose(
  injectIntl,
  withRouter,
)(Overlap);

export default Overlap;

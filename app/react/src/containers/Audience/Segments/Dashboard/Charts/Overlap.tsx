import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col, Button, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';

import {
  EmptyCharts,
  LoadingChart,
} from '../../../../../components/EmptyCharts/index';
import { VerticalBarChart } from '../../../../../components/BarCharts/index';
import { LegendChart } from '../../../../../components/LegendChart';
import McsIcon from '../../../../../components/McsIcon';
import * as AudienceSegmentActions from '../../../../../state/Audience/Segments/actions';
import messages from '../messages';

import { getOverlapView } from '../../../../../state/Audience/Segments/selectors';
import { TranslationProps } from '../../../../Helpers/withTranslations';
import injectColors, {
  InjectedColorsProps,
} from '../../../../Helpers/injectColors';
import {
  injectDatamart,
  InjectedDatamartProps,
} from '../../../../Datamart/index';

const VerticalBarChartJS = VerticalBarChart as any;

interface MapStateToProps {
  hasFetchedAudienceStat: boolean;
  isFetchingOverlap: boolean;
  hasOverlap: boolean;
  dataSource: any;
  segmentsInformation: any;
}

interface MapDispatchToProps {
  fetchOverlapAnalysis: (
    segmentId: string,
    organisationId: string,
    datamartId: string,
  ) => void;
  createOverlapAnalysis: (
    datamartId: string,
    segmentId: string,
    organisationId: string,
  ) => void;
}

type OverlapProps = MapStateToProps &
  MapDispatchToProps &
  InjectedColorsProps &
  InjectedDatamartProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps;

class Overlap extends React.Component<OverlapProps> {
  componentDidMount() {
    const {
      datamart,
      fetchOverlapAnalysis,
      match: { params: { segmentId, organisationId } },
    } = this.props;

    fetchOverlapAnalysis(segmentId, organisationId, datamart.id);
  }

  renderStackedAreaCharts() {
    const { dataSource, isFetchingOverlap, colors } = this.props;

    const data = dataSource.data.slice(0, 20);

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: ['yKey'],
      colors: [colors['mcs-info']],
    };

    return !isFetchingOverlap ? (
      <VerticalBarChartJS
        identifier="StackedAreaChartEmailOverlap"
        dataset={data}
        options={optionsForChart}
        colors={{ base: colors['mcs-info'], hover: colors['mcs-warning'] }}
      />
    ) : (
      <LoadingChart />
    );
  }

  renderModalExtend = () => {
    const {
      datamart,
      createOverlapAnalysis,
      match: { params: { organisationId, segmentId } },
      intl: { formatMessage },
    } = this.props;

    Modal.confirm({
      title: formatMessage(messages.modalOverlapContentTitle),
      content: (
        <div>
          <p>{formatMessage(messages.modalOverlapContentMessage)}</p>
        </div>
      ),
      onOk() {
        createOverlapAnalysis(datamart.id, segmentId, organisationId);
      },
      onCancel() {
        //
      },
    });
  };

  render() {
    const {
      translations,
      dataSource,
      hasFetchedAudienceStat,
      isFetchingOverlap,
      hasOverlap,
      colors,
    } = this.props;

    const options = [
      {
        domain: translations['overlap_number'.toUpperCase()],
        color: colors['mcs-info'],
      },
    ];

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {isFetchingOverlap && !hasFetchedAudienceStat && !hasOverlap ? (
              <div />
            ) : (
              <LegendChart identifier="LegendOverlap" options={options} />
            )}
          </Col>
          <Col span={12} className="text-right">
            {!isFetchingOverlap &&
              hasFetchedAudienceStat &&
              hasOverlap && (
                <span className="generated">
                  <FormattedMessage {...messages.generated} />{' '}
                  {moment(dataSource.date).fromNow()}
                </span>
              )}{' '}
            {!isFetchingOverlap &&
              hasFetchedAudienceStat && (
                <Button onClick={this.renderModalExtend}>
                  <McsIcon type="extend" />{' '}
                  {hasOverlap ? (
                    <FormattedMessage {...messages.refresh} />
                  ) : (
                    <FormattedMessage {...messages.createOverlap} />
                  )}
                </Button>
              )}
          </Col>
        </Row>
        {!hasOverlap && hasFetchedAudienceStat && !isFetchingOverlap ? (
          <EmptyCharts title={translations.NO_EMAIL_STATS} />
        ) : (
          this.renderStackedAreaCharts()
        )}
      </div>
    );

    return chartArea;
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
  hasFetchedAudienceStat:
    state.audienceSegmentsTable.performanceReportSingleApi.hasFetched,
  isFetchingOverlap: state.audienceSegmentsTable.overlapAnalysisApi.isFetching,
  hasOverlap: state.audienceSegmentsTable.overlapAnalysisApi.hasOverlap,
  dataSource: getOverlapView(state),
  segmentsInformation: state.audienceSegmentsTable.audienceSegmentsApi.data,
});

const mapDispatchToProps = {
  fetchOverlapAnalysis:
    AudienceSegmentActions.fetchAudienceSegmentOverlap.request,
  createOverlapAnalysis:
    AudienceSegmentActions.createAudienceSegmentOverlap.request,
};

export default compose<{}, {}>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, mapDispatchToProps),
  injectColors,
  injectDatamart,
)(Overlap);

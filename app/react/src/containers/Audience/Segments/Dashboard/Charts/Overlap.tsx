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
import { getDefaultDatamart } from '../../../../../state/Session/selectors';
import messages from '../messages';

import { getOverlapView } from '../../../../../state/Audience/Segments/selectors';
import { TranslationProps } from '../../../../Helpers/withTranslations';


const VerticalBarChartJS = VerticalBarChart as any;

interface MapStateToProps {
  hasFetchedAudienceStat: boolean;
  isFetchingOverlap: boolean;
  hasOverlap: boolean;
  dataSource: any;
  defaultDatamart: any; // ??
  segmentsInformation: any; // type
  colors: any; // type
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
  TranslationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps;

class Overlap extends React.Component<OverlapProps> {
  componentDidMount() {
    const {
      defaultDatamart,
      fetchOverlapAnalysis,
      match: { params: { segmentId, organisationId } },
    } = this.props;
    const datamartId = defaultDatamart(organisationId).id;

    fetchOverlapAnalysis(segmentId, organisationId, datamartId);
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
      createOverlapAnalysis,
      defaultDatamart,
      match: { params: { organisationId, segmentId } },
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
  defaultDatamart: getDefaultDatamart(state),
  segmentsInformation: state.audienceSegmentsTable.audienceSegmentsApi.data,
  colors: state.theme.colors,
});

const mapDispatchToProps = {
  fetchOverlapAnalysis:
    AudienceSegmentActions.fetchAudienceSegmentOverlap.request,
  createOverlapAnalysis:
    AudienceSegmentActions.createAudienceSegmentOverlap.request,
};

export default compose<OverlapProps, OverlapProps>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, mapDispatchToProps),
)(Overlap);

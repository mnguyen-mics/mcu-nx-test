import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {Row, Col, Button, Modal} from 'antd';
import moment from 'moment';
import {FormattedMessage, injectIntl, InjectedIntlProps} from 'react-intl';
import {compose} from 'recompose';
import {RouteComponentProps} from 'react-router';

import {
  EmptyCharts,
  LoadingChart,
} from '../../../../../components/EmptyCharts/index';
import {VerticalBarChart} from '../../../../../components/BarCharts/index';
import {LegendChart} from '../../../../../components/LegendChart';
import McsIcon from '../../../../../components/McsIcon';
import messages from '../messages';

import {TranslationProps} from '../../../../Helpers/withTranslations';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import {
  injectDatamart,
  InjectedDatamartProps,
} from '../../../../Datamart/index';
import {IOverlapInterval} from '../OverlapServices';
import {OverlapData} from '../constants';
import {TYPES} from '../../../../../constants/types';
import {lazyInject} from '../../../../../config/inversify.config';

const VerticalBarChartJS = VerticalBarChart as any;

interface State {
  data: OverlapData;
  isFetchingOverlap: boolean;
  overlapFetchingError: boolean;
}

export interface OverlapProps {
  datamartId: string;
}

type Props = InjectedThemeColorsProps &
  InjectedDatamartProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps & OverlapProps;

class Overlap extends React.Component<Props, State> {
  @lazyInject(TYPES.IOverlapInterval)
  private _overlapInterval: IOverlapInterval;

  constructor(props: Props) {
    super(props);
    this.state = {
      data: {
        hasOverlap: false,
        isRunning: false,
        isInError: false,
        data: null,
      },
      isFetchingOverlap: true,
      overlapFetchingError: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: {segmentId},
      },
    } = this.props;

    this._overlapInterval
      .fetchOverlapAnalysisLoop(segmentId)
      .then(() => this._overlapInterval.fetchOverlapAnalysis(segmentId))
      .then(res => this.setState({data: res, isFetchingOverlap: false}))
      .catch(() => this.setState({overlapFetchingError: true, isFetchingOverlap: false}));
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: {segmentId},
      },
    } = this.props;
    const {
      match: {
        params: {segmentId: nextSegmentId},
      },
    } = nextProps;

    if (segmentId !== nextSegmentId) {
      this.setState({isFetchingOverlap: true}, () => {
        this._overlapInterval
          .fetchOverlapAnalysisLoop(nextSegmentId)
          .then(() => this._overlapInterval.fetchOverlapAnalysis(nextSegmentId))
          .then(res => this.setState({data: res, isFetchingOverlap: false}));
      });
    }
  }

  componentWillUnmount() {
    this._overlapInterval.stopInterval();
  }

  renderStackedAreaCharts() {
    const {colors} = this.props;
    const {data, isFetchingOverlap} = this.state;

    if (isFetchingOverlap) return <LoadingChart/>;

    const dataSource: Array<{ xKey: string; yKey: number }> = [];

    const overlapData = data.data;
    if (overlapData) {
      overlapData.formattedOverlap.forEach(item => {
        if (item) {
          dataSource.push({
            xKey: item.segment_intersect_with.name,
            yKey:
              item.segment_intersect_with.segment_size === 0
                ? 0
                : (item.overlap_number / item.segment_source_size) * 100,
          });
        }
      });
    }

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: ['yKey'],
      colors: [colors['mcs-info']],
    };

    return !isFetchingOverlap ? (
      <VerticalBarChartJS
        identifier="StackedAreaChartEmailOverlap"
        dataset={dataSource.sort((a, b) => b.yKey - a.yKey).slice(0, 20)}
        options={optionsForChart}
        colors={{base: colors['mcs-info'], hover: colors['mcs-warning']}}
      />
    ) : (
      <LoadingChart/>
    );
  }

  renderModalExtend = () => {
    const {
      datamartId,
      match: {
        params: {organisationId, segmentId},
      },
      intl: {formatMessage},
    } = this.props;

    const createOv = () => {
      this.setState({isFetchingOverlap: true});
      this._overlapInterval
        .createOverlapAnalysis(datamartId, segmentId, organisationId)
        .then(() => {
          this._overlapInterval
            .fetchOverlapAnalysis(segmentId)
            .then(res =>
              this.setState({data: res, isFetchingOverlap: false}),
            );
        });
    };

    Modal.confirm({
      title: formatMessage(messages.modalOverlapContentTitle),
      content: (
        <div>
          <p>{formatMessage(messages.modalOverlapContentMessage)}</p>
        </div>
      ),
      onOk() {
        createOv();
      },
      onCancel() {
        //
      },
    });
  };

  render() {
    const {colors, intl} = this.props;

    const {data, isFetchingOverlap, overlapFetchingError} = this.state;

    const options = [
      {
        domain: intl.formatMessage(messages.overlapNumber),
        color: colors['mcs-info'],
      },
    ];

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {isFetchingOverlap || !data.hasOverlap ? (
              <div/>
            ) : (
              <LegendChart identifier="LegendOverlap" options={options}/>
            )}
          </Col>
          <Col span={12} className="text-right">
            {!isFetchingOverlap && data.hasOverlap && (
              <span className="generated">
                <FormattedMessage {...messages.generated} />{' '}
                {moment(data.data ? data.data.date : 0).fromNow()}
              </span>
            )}{' '}
            {!isFetchingOverlap && (
              <Button onClick={this.renderModalExtend}>
                <McsIcon type="extend"/>{' '}
                {data.hasOverlap ? (
                  <FormattedMessage {...messages.refresh} />
                ) : (
                  <FormattedMessage {...messages.createOverlap} />
                )}
              </Button>
            )}
          </Col>
        </Row>
        {
          overlapFetchingError ?
            (<EmptyCharts title={intl.formatMessage(messages.overlapFetchingError)}/>) :
            !data.hasOverlap && !isFetchingOverlap ?
              (<EmptyCharts title={intl.formatMessage(messages.noAdditionDeletion)}/>) :
              (this.renderStackedAreaCharts())
        }
      </div>
    );

    return chartArea;
  }
}

export default compose<Props, OverlapProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
  injectDatamart,
)(Overlap);

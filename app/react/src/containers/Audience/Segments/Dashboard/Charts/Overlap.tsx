import * as React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Row, Col, Button, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';
import McsIcon from '../../../../../components/McsIcon';
import messages from '../messages';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import {
  injectDatamart,
  InjectedDatamartProps,
} from '../../../../Datamart/index';
import { IOverlapInterval } from '../OverlapServices';
import { OverlapData } from '../constants';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import StackedBarPlot, {
  StackedBarPlotOptions,
} from '../../../../../components/Charts/CategoryBased/StackedBarPlot';
import { AudienceSegmentShape } from '../../../../../models/audiencesegment';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';

interface State {
  data: OverlapData;
  isFetchingOverlap: boolean;
  overlapFetchingError: boolean;
}

export interface OverlapProps {
  datamartId: string;
  segment: AudienceSegmentShape;
}

type Props = InjectedThemeColorsProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  OverlapProps;

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
    const { segment } = this.props;

    this._overlapInterval
      .fetchOverlapAnalysisLoop(segment.id)
      .then(() => this._overlapInterval.fetchOverlapAnalysis(segment.id))
      .then(res => this.setState({ data: res, isFetchingOverlap: false }))
      .catch(() =>
        this.setState({ overlapFetchingError: true, isFetchingOverlap: false }),
      );
  }

  componentDidUpdate(previousProps: Props) {
    const { segment } = this.props;
    const { segment: prevSegment } = previousProps;

    if (!_.isEqual(segment, prevSegment)) {
      this.setState({ isFetchingOverlap: true }, () => {
        this._overlapInterval
          .fetchOverlapAnalysisLoop(segment.id)
          .then(() => this._overlapInterval.fetchOverlapAnalysis(segment.id))
          .then(res => this.setState({ data: res, isFetchingOverlap: false }));
      });
    }
  }

  componentWillUnmount() {
    this._overlapInterval.stopInterval();
  }

  renderStackedAreaCharts() {
    const { colors } = this.props;
    const { data, isFetchingOverlap } = this.state;

    if (isFetchingOverlap) return <LoadingChart />;

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

    const optionsForChart: StackedBarPlotOptions = {
      xKey: 'xKey',
      yKeys: [
        {
          key: 'yKey',
          message: { id: 'overlap.name', defaultMessage: 'Overlaping %' },
        },
      ],
      colors: [colors['mcs-info']],
      showLegend: false,
    };

    return !isFetchingOverlap ? (
      <StackedBarPlot
        dataset={dataSource.sort((a, b) => b.yKey - a.yKey).slice(0, 20)}
        options={optionsForChart}
      />
    ) : (
      <LoadingChart />
    );
  }

  renderModalExtend = () => {
    const {
      datamartId,
      segment,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const createOv = () => {
      this.setState({ isFetchingOverlap: true });
      this._overlapInterval
        .createOverlapAnalysis(datamartId, segment.id, organisationId)
        .then(() => {
          this._overlapInterval
            .fetchOverlapAnalysis(segment.id)
            .then(res =>
              this.setState({ data: res, isFetchingOverlap: false }),
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
    const { intl } = this.props;

    const { data, isFetchingOverlap, overlapFetchingError } = this.state;

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            <div />
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
                <McsIcon type="extend" />{' '}
                {data.hasOverlap ? (
                  <FormattedMessage {...messages.refresh} />
                ) : (
                  <FormattedMessage {...messages.createOverlap} />
                )}
              </Button>
            )}
          </Col>
        </Row>
        {overlapFetchingError ? (
          <EmptyChart
            title={intl.formatMessage(messages.overlapFetchingError)}
            icon='warning'
          />
        ) : !data.hasOverlap && !isFetchingOverlap ? (
          <EmptyChart
            title={intl.formatMessage(messages.noAdditionDeletion)}
            icon='warning'
          />
        ) : (
          this.renderStackedAreaCharts()
        )}
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

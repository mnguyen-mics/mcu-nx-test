import {
  AreaChartSlider,
  Card,
  EmptyChart,
  LoadingChart,
  TableViewFilters,
} from '@mediarithmics-private/mcs-components-library';
import { messages } from './messages';
import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Col, Row, Statistic, Steps, Tabs, Tooltip } from 'antd';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import {
  ContextualTargetingResource,
  ContextualTargetingStatus,
} from '../../../../../models/contextualtargeting/ContextualTargeting';
import { IContextualTargetingService } from '../../../../../services/ContextualTargetingService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { DataPoint } from '@mediarithmics-private/mcs-components-library/lib/components/charts/area-chart-slider/AreaChartSlider';
import Papa from 'papaparse';
import { RouteComponentProps, withRouter } from 'react-router';
import { InfoCircleFilled } from '@ant-design/icons';

const { TabPane } = Tabs;

export interface ContextualKeyResource {
  contextual_key: string;
  occurrences_in_segment_count: number;
  occurrences_in_datamart_count: number;
  lift: number;
}

interface SignatureScoredCategoryResource {
  category_name: string;
  weight: number;
}

interface ChartDataResource extends DataPoint {
  lift: number;
  reach: number;
}

interface ContextualTargetingTabProps {
  datamartId: string;
  segmentId: string;
}

const { Step } = Steps;

const stepNumber = 100;

type Props = ContextualTargetingTabProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  contextualTargeting?: ContextualTargetingResource;
  isLoading: boolean;
  sortedContextualKeys?: ContextualKeyResource[];
  chartData?: ChartDataResource[];
  targetedContextualKeyResources?: ContextualKeyResource[];
  signatureScoredCategoryResources?: SignatureScoredCategoryResource[];
  isLoadingContextualKeys: boolean;
  isLoadingSignature: boolean;
  sliderValue: number;
  totalPageViewVolume?: number;
  targetedPageViewVolume?: number;
  isLiveEditing: boolean;
  activeTabKey: string;
}

class ContextualTargetingTab extends React.Component<Props, State> {
  @lazyInject(TYPES.IContextualTargetingService)
  private _contextualTargetingService: IContextualTargetingService;

  private refreshContextualTargetingInterval = setInterval(() => {
    if (this.state.contextualTargeting?.status === 'INIT') {
      this.getContextualTargeting();
    }
  }, 10000);

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoadingContextualKeys: true,
      isLoadingSignature: false,
      sliderValue: 0,
      isLiveEditing: false,
      activeTabKey: '0',
    };
  }

  componentDidMount() {
    this.getContextualTargeting().then(ct => {
      if (ct && ct.status !== 'INIT') this.initLiftData(ct);
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      contextualTargeting,
      targetedContextualKeyResources,
      signatureScoredCategoryResources,
      isLoadingSignature,
    } = this.state;
    if (
      contextualTargeting !== prevState.contextualTargeting &&
      prevState.contextualTargeting?.status === 'INIT' &&
      contextualTargeting?.status === 'DRAFT'
    )
      this.initLiftData(contextualTargeting);
    if (
      (contextualTargeting?.status === 'LIVE' ||
        contextualTargeting?.status === 'LIVE_PUBLISHED') &&
      targetedContextualKeyResources &&
      !signatureScoredCategoryResources &&
      !isLoadingSignature
    ) {
      this.initSignatureData(contextualTargeting);
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshContextualTargetingInterval);
  }

  getContextualTargeting = (): Promise<ContextualTargetingResource | undefined> => {
    const { segmentId } = this.props;

    return this._contextualTargetingService
      .getContextualTargetings(segmentId)
      .then(res => {
        this.setState({
          contextualTargeting: res.data[0],
          isLoading: false,
        });
        return res.data[0];
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
        return undefined;
      });
  };

  initLiftData = (contextualTargeting: ContextualTargetingResource) => {
    const { segmentId } = this.props;
    this.setState({
      isLoadingContextualKeys: true,
    });
    return this._contextualTargetingService
      .getContextualTargetingLiftFile(segmentId, contextualTargeting?.id)
      .then((res: Blob) => {
        res.text().then((resAsText: string) => {
          const contextualKeys = this.parseLiftCsv(resAsText).filter(
            ck => ck.contextual_key && ck.lift && ck.occurrences_in_datamart_count,
          );
          const sortedContextualKeys = contextualKeys.sort((cka, ckb) => ckb.lift - cka.lift);
          const chartData = this.buildChartData(sortedContextualKeys);

          const totalPageViewVolume = sortedContextualKeys.reduce((acc, ck) => {
            if (ck.occurrences_in_datamart_count) return acc + ck.occurrences_in_datamart_count;
            else return acc;
          }, 0);

          let sliderValue: number;
          if (contextualTargeting) {
            const val = chartData.find(
              data =>
                contextualTargeting.volume_ratio &&
                data.reach > (contextualTargeting.volume_ratio * totalPageViewVolume) / 1000000,
            );
            val ? (sliderValue = val.lift) : (sliderValue = chartData[19].lift);
          } else sliderValue = chartData[19].lift;

          const targetedContextualKeys = sortedContextualKeys.filter(ck => ck.lift >= sliderValue);

          const targetedPageViewVolume = targetedContextualKeys.reduce((acc, ck) => {
            return acc + ck.occurrences_in_datamart_count;
          }, 0);
          this.setState({
            sortedContextualKeys: sortedContextualKeys,
            chartData: chartData,
            sliderValue: sliderValue,
            targetedContextualKeyResources: targetedContextualKeys,
            isLoadingContextualKeys: false,
            totalPageViewVolume: totalPageViewVolume,
            targetedPageViewVolume: targetedPageViewVolume,
          });
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoadingContextualKeys: false,
        });
      });
  };

  parseLiftCsv = (csvText: string): ContextualKeyResource[] => {
    const test = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
    });
    return test.data as ContextualKeyResource[];
  };

  initSignatureData = (contextualTargeting: ContextualTargetingResource) => {
    const { segmentId } = this.props;
    this.setState({ isLoadingSignature: true });
    return this._contextualTargetingService
      .getContextualTargetingSignatureFile(segmentId, contextualTargeting?.id)
      .then((res: Blob) => {
        res.text().then((resAsText: string) => {
          const signatureScoredCategories = this.parseSignatureCsv(resAsText)
            .filter(sc => sc.category_name && sc.weight)
            .sort((catA, catB) => catB.weight - catA.weight);
          this.setState({
            signatureScoredCategoryResources: signatureScoredCategories,
            isLoadingSignature: false,
          });
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoadingSignature: false,
        });
      });
  };

  parseSignatureCsv = (csvText: string): SignatureScoredCategoryResource[] => {
    return Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
    }).data as SignatureScoredCategoryResource[];
  };

  buildChartData = (sortedContextualKeys: ContextualKeyResource[]) => {
    const chartData = [];
    const liftMax = sortedContextualKeys[0].lift;
    const liftMin = sortedContextualKeys[sortedContextualKeys.length - 1].lift;
    const liftStep = (liftMax - liftMin) / stepNumber;
    let cumulativeReach = 0;
    for (let i = 0; i < stepNumber; i++) {
      cumulativeReach += sortedContextualKeys
        .filter(ck => ck.lift > liftMax - liftStep * (i + 1) && ck.lift <= liftMax - liftStep * i)
        .reduce((acc, ck) => acc + ck.occurrences_in_datamart_count, 0);
      chartData[i] = { lift: liftMax - liftStep * (i + 1), reach: cumulativeReach / 1000000 };
    }
    return chartData;
  };

  onPublishContextualTargeting = () => {
    const { segmentId } = this.props;
    const { contextualTargeting } = this.state;
    this._contextualTargetingService
      .publishContextualTargeting(segmentId, contextualTargeting!.id, this.getTargetedVolumeRatio())
      .then(res =>
        this.setState({
          contextualTargeting: res.data,
          isLiveEditing: false,
        }),
      )
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  onSliderChange = (point: DataPoint) => {
    if (point) {
      const contextualKeys = this.state.sortedContextualKeys?.filter(url => url.lift >= point.lift);
      const targetedPageViewVolume = contextualKeys?.reduce((acc, ck) => {
        return acc + ck.occurrences_in_datamart_count;
      }, 0);

      this.setState({
        sliderValue: point.lift,
        targetedContextualKeyResources: contextualKeys,
        targetedPageViewVolume: targetedPageViewVolume,
      });
    }
  };

  tipFormater = (selected: DataPoint, index?: number) => {
    return <div>{Math.round(this.getTargetedVolumeRatio() * 100) + '% of total events'}</div>;
  };

  onClick = () => {
    this.setState({
      isLoading: true,
    });
    this.createContextualTargeting();
  };

  createContextualTargeting = () => {
    const { segmentId } = this.props;
    const contextualTargeting = {
      segment_id: segmentId,
    };
    this._contextualTargetingService
      .createContextualTargeting(segmentId, contextualTargeting)
      .then(res => {
        this.setState({
          contextualTargeting: res.data,
          isLoading: false,
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  getStepIndex = (status?: ContextualTargetingStatus) => {
    const { isLiveEditing } = this.state;
    switch (status) {
      case undefined:
        return -1;
      case 'INIT':
        return 0;
      case 'DRAFT':
        return 1;
      case 'PUBLISHED':
        return 2;
      case 'LIVE':
        if (isLiveEditing) return 1;
        else return 2;
      case 'LIVE_PUBLISHED':
        return 2;
    }
  };

  renderNoCtStep = () => {
    const { intl } = this.props;
    return (
      <div className='mcs-contextualTargetingDashboard_noCtStep'>
        <EmptyChart
          title={intl.formatMessage(messages.noContextualTargetingTabText)}
          icon='optimization'
        />
        <Button className='mcs-primary' type='primary' onClick={this.onClick}>
          {intl.formatMessage(messages.noContextualTargetingTabButton)}
        </Button>
      </div>
    );
  };

  renderInitializationStep = () => {
    const { intl } = this.props;
    return (
      <div className='mcs-contextualTargetingDashboard_initializationStep'>
        <EmptyChart
          title={intl.formatMessage(messages.InitializationTabText)}
          icon='optimization'
        />
        <span>{intl.formatMessage(messages.InitializationTabSubText)}</span>
      </div>
    );
  };

  renderDraftStepChart = () => {
    const { intl } = this.props;
    const {
      chartData,
      targetedContextualKeyResources,
      sliderValue,
      contextualTargeting,
      isLiveEditing,
      isLoadingContextualKeys,
    } = this.state;

    const sliderIndex = chartData?.findIndex(data => sliderValue > data.lift);

    return chartData && targetedContextualKeyResources && sliderIndex ? (
      <Card className='mcs-contextualTargetingDashboard_graph'>
        <AreaChartSlider
          data={chartData}
          initialValue={sliderIndex}
          xAxis={{
            key: 'lift',
            labelFormat: '{value}',
            title: 'Lift',
            subtitle: 'Users in this segment consult this content x times more than other people',
            reversed: true,
          }}
          yAxis={{
            key: 'reach',
            labelFormat: '{value}M',
            title: 'Reach',
            subtitle: '# Page views in the last 30 days',
          }}
          color={'#00a1df'}
          onChange={this.onSliderChange}
          tipFormatter={this.tipFormater}
          disabled={
            (contextualTargeting?.status === 'LIVE' && !isLiveEditing) ||
            contextualTargeting?.status === 'LIVE_PUBLISHED' ||
            contextualTargeting?.status === 'PUBLISHED'
          }
        />
      </Card>
    ) : isLoadingContextualKeys ? (
      <LoadingChart />
    ) : (
      <EmptyChart title={intl.formatMessage(messages.InitializationTabText)} icon='optimization' />
    );
  };

  renderStepChartComponent = () => {
    const { contextualTargeting } = this.state;

    if (!contextualTargeting) {
      return this.renderNoCtStep();
    } else if (contextualTargeting.status === 'INIT') {
      return this.renderInitializationStep();
    } else {
      return this.renderDraftStepChart();
    }
  };

  renderStepTabComponent = () => {
    const { intl } = this.props;
    const {
      isLoadingContextualKeys,
      isLoadingSignature,
      targetedContextualKeyResources,
      signatureScoredCategoryResources,
      contextualTargeting,
      activeTabKey,
    } = this.state;

    const liftDataColumnsDefinition: Array<DataColumnDefinition<ContextualKeyResource>> = [
      {
        title: intl.formatMessage(messages.content),
        key: 'contextual_key',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: intl.formatMessage(messages.lift),
        key: 'lift',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: intl.formatMessage(messages.numberOfEvents),
        key: 'occurrences_in_datamart_count',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    const signatureDataColumnsDefinition: Array<
      DataColumnDefinition<SignatureScoredCategoryResource>
    > = [
      {
        title: intl.formatMessage(messages.category),
        key: 'category_name',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: intl.formatMessage(messages.score),
        key: 'weight',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    const lastLiftComputation =
      contextualTargeting &&
      contextualTargeting.last_lift_computation_ts &&
      new Date(contextualTargeting.last_lift_computation_ts);

    return (contextualTargeting?.status === 'DRAFT' ||
      contextualTargeting?.status === 'PUBLISHED') &&
      targetedContextualKeyResources &&
      lastLiftComputation ? (
      <Card
        title={
          <React.Fragment>
            {intl.formatMessage(messages.targetedContentTab)}
            <Tooltip
              className='mcs-contextualTargetingDashboard_lastRefreshDate'
              title={intl.formatMessage(messages.liftRefreshTooltip)}
              placement='left'
            >
              <InfoCircleFilled />
            </Tooltip>
          </React.Fragment>
        }
        className='mcs-contextualTargetingDashboard_contextualTargetingTableContainer'
      >
        <TableViewFilters
          dataSource={targetedContextualKeyResources}
          loading={isLoadingContextualKeys}
          columns={liftDataColumnsDefinition}
        />
      </Card>
    ) : (contextualTargeting?.status === 'LIVE' ||
        contextualTargeting?.status === 'LIVE_PUBLISHED') &&
      targetedContextualKeyResources &&
      lastLiftComputation ? (
      <Card className='mcs-contextualTargetingDashboard_contextualTargetingTableContainer'>
        {activeTabKey === '0' ? (
          <Tooltip
            className='mcs-contextualTargetingDashboard_lastRefreshDate'
            title={intl.formatMessage(messages.liftRefreshTooltip)}
            placement='left'
          >
            <InfoCircleFilled />
          </Tooltip>
        ) : (
          <Tooltip
            className='mcs-contextualTargetingDashboard_lastRefreshDate'
            title={intl.formatMessage(messages.signatureRefreshTooltip)}
            placement='left'
          >
            <InfoCircleFilled />
          </Tooltip>
        )}
        <Tabs defaultActiveKey={'0'} onChange={this.onTabChange}>
          <TabPane tab={intl.formatMessage(messages.targetedContentTab)} key={'0'}>
            <TableViewFilters
              dataSource={targetedContextualKeyResources}
              loading={isLoadingContextualKeys}
              columns={liftDataColumnsDefinition}
            />
          </TabPane>
          <TabPane tab={intl.formatMessage(messages.semanticAnalysisTab)} key={'1'}>
            {signatureScoredCategoryResources ? (
              <React.Fragment>
                <TableViewFilters
                  dataSource={signatureScoredCategoryResources}
                  loading={isLoadingSignature}
                  columns={signatureDataColumnsDefinition}
                />
              </React.Fragment>
            ) : (
              <EmptyChart
                title={intl.formatMessage(messages.InitializationTabText)}
                icon='optimization'
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    ) : (
      <div />
    );
  };

  onTabChange = (activeKey: string) => {
    this.setState({ activeTabKey: activeKey });
  };

  getTargetedVolumeRatio = () => {
    const { targetedPageViewVolume, totalPageViewVolume } = this.state;
    return targetedPageViewVolume && totalPageViewVolume
      ? targetedPageViewVolume / totalPageViewVolume
      : 0;
  };

  renderTargetedVolumeRatio = () => {
    const { sliderValue } = this.state;
    return (
      <div>
        <span className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_volumeRatioValue'>
          {Math.round(this.getTargetedVolumeRatio() * 100) + '%'}
        </span>
        <span className='mcs-contextualTargetingDashboard_settingsCardContainer_stats_liftValue'>
          {`(Lift = ${sliderValue.toFixed(1)})`}
        </span>
      </div>
    );
  };

  liveEditionMode = () => {
    this.setState({
      isLiveEditing: true,
    });
  };

  renderStepStatsCard = () => {
    const {
      contextualTargeting,
      sortedContextualKeys,
      targetedPageViewVolume,
      targetedContextualKeyResources,
      isLiveEditing,
    } = this.state;
    const { intl } = this.props;

    const liveDuration =
      contextualTargeting &&
      contextualTargeting.live_activation_ts &&
      new Date(Date.now() - contextualTargeting.live_activation_ts).getDay();

    const liveCard =
      contextualTargeting?.status === 'LIVE' &&
      contextualTargeting?.live_activation_ts &&
      !isLiveEditing ? (
        <Card className='mcs-contextualTargetingDashboard_liveCard'>
          <div className='mcs-contextualTargetingDashboard_liveCard_title'>LIVE</div>
          <div className='mcs-contextualTargetingDashboard_liveCard_duration'>
            {liveDuration + ' days ago'}
          </div>
        </Card>
      ) : (
        <div />
      );

    const stepIndex = this.getStepIndex(contextualTargeting?.status);

    const steps = (contextualTargeting?.status !== 'LIVE' ||
      (contextualTargeting?.status === 'LIVE' && isLiveEditing)) && (
      <Steps direction='vertical' current={stepIndex}>
        <Step
          title={intl.formatMessage(messages.stepOneTitle)}
          description={intl.formatMessage(messages.stepOneDescription)}
        />
        <Step
          title={intl.formatMessage(messages.stepTwoTitle)}
          description={intl.formatMessage(messages.stepTwoDescription)}
        />
        <Step
          title={intl.formatMessage(messages.stepThreeTitle)}
          description={intl.formatMessage(messages.stepThreeDescription)}
        />
      </Steps>
    );
    const isButtonDisable =
      contextualTargeting &&
      (contextualTargeting.status === 'PUBLISHED' ||
        contextualTargeting.status === 'LIVE_PUBLISHED');

    const stats = stepIndex >= 1 && sortedContextualKeys && (
      <div className='mcs-contextualTargetingDashboard_settingsCardContainer'>
        {contextualTargeting &&
          ((contextualTargeting.status === 'LIVE' && isLiveEditing) ||
            contextualTargeting.status === 'LIVE_PUBLISHED') && (
            <Card className='mcs-contextualTargetingDashboard_liveEditionCard'>
              <div className='mcs-contextualTargetingDashboard_liveEditionCard_title'>LIVE</div>
            </Card>
          )}
        <div className='mcs-contextualTargetingDashboard_settingsCardContainer_stats'>
          <Statistic
            title={intl.formatMessage(messages.targetedRatio)}
            valueRender={this.renderTargetedVolumeRatio}
          />
          <Statistic
            title={intl.formatMessage(messages.numberOfTargetedContent)}
            value={targetedContextualKeyResources ? targetedContextualKeyResources.length : 0}
          />
          <Statistic
            title={intl.formatMessage(messages.targetedVolume)}
            value={targetedPageViewVolume}
          />
        </div>

        <Button
          className='mcs-contextualTargetingDashboard_settingsCardButton'
          onClick={
            contextualTargeting?.status === 'DRAFT' ||
            (contextualTargeting?.status === 'LIVE' && isLiveEditing)
              ? this.onPublishContextualTargeting
              : this.liveEditionMode
          }
          disabled={isButtonDisable}
        >
          {isButtonDisable
            ? intl.formatMessage(messages.settingsCardButtonInProgress)
            : contextualTargeting?.status === 'DRAFT' ||
              (contextualTargeting?.status === 'LIVE' && isLiveEditing)
            ? intl.formatMessage(messages.settingsCardButtonActivation)
            : intl.formatMessage(messages.settingsCardButtonEdition)}
        </Button>
      </div>
    );

    return (
      <div className='mcs-contextualTargetingDashboard_settingsCol'>
        {liveCard}
        {steps}
        {stats}
      </div>
    );
  };

  render() {
    const { isLoading } = this.state;
    const stepChartComponent = this.renderStepChartComponent();
    const stepStatsCard = this.renderStepStatsCard();
    const stepTableComponent = this.renderStepTabComponent();

    return isLoading ? (
      <LoadingChart />
    ) : (
      <React.Fragment>
        <Row className='mcs-contextualTargetingDashboard_contextualTargetingChartContainer'>
          <Col span={19}>{stepChartComponent}</Col>
          <Col span={5}>{stepStatsCard}</Col>
        </Row>
        <Row>{stepTableComponent}</Row>
      </React.Fragment>
    );
  }
}

export default compose<Props, ContextualTargetingTabProps>(
  injectIntl,
  injectNotifications,
  withRouter,
)(ContextualTargetingTab);

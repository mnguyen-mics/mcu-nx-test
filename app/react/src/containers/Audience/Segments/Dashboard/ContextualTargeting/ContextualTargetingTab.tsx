import { LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { DataPoint } from '@mediarithmics-private/mcs-components-library/lib/components/charts/area-chart-slider/AreaChartSlider';
import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Col, Row } from 'antd';
import { ContextualTargetingResource } from '../../../../../models/contextualtargeting/ContextualTargeting';
import { IContextualTargetingService } from '../../../../../services/ContextualTargetingService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import Papa from 'papaparse';
import { RouteComponentProps, withRouter } from 'react-router';
import ContextualTargetingChart, { ChartDataResource } from './ContextualTargetingChart';
import ContextualTargetingStatsCard from './ContextualTargetingStatsCard';
import ContextualTargetingSubTabs from './ContextualTargetingSubTabs';

export interface SignatureScoredCategoryResource {
  category_name: string;
  weight: number;
}

export interface ContextualKeyResource {
  contextual_key: string;
  occurrences_in_segment_count: number;
  occurrences_in_datamart_count: number;
  lift: number;
}
interface ContextualTargetingTabProps {
  segmentId: string;
}

type Props = ContextualTargetingTabProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  contextualTargeting?: ContextualTargetingResource;
  isLoading: boolean;
  sortedContextualKeys?: ContextualKeyResource[];
  targetedContextualKeyResources?: ContextualKeyResource[];
  signatureScoredCategoryResources?: SignatureScoredCategoryResource[];
  isLoadingContextualKeys: boolean;
  isLoadingSignature: boolean;
  chartDataSelected?: ChartDataResource;
  totalPageViewVolume?: number;
  targetedPageViewVolume?: number;
  isLiveEditing: boolean;
  activeTabKey: string;
}

class ContextualTargetingTab extends React.Component<Props, State> {
  @lazyInject(TYPES.IContextualTargetingService)
  private _contextualTargetingService: IContextualTargetingService;

  private refreshContextualTargetingInterval = setInterval(() => {
    if (this.state.contextualTargeting?.status) {
      const status = this.state.contextualTargeting.status;
      if (status === 'INIT' || status === 'PUBLISHED' || status === 'LIVE_PUBLISHED') {
        this.getContextualTargeting();
      }
    }
  }, 10000);

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoadingContextualKeys: true,
      isLoadingSignature: false,
      isLiveEditing: false,
      activeTabKey: '0',
    };
  }

  componentDidMount() {
    this.getContextualTargeting().then(ct => {
      if (ct && ct.status !== 'INIT')
        this.initLiftData(ct).then(_ => {
          if (ct.status !== 'DRAFT') this.initSignatureData(ct);
        });
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { contextualTargeting } = this.state;
    if (
      contextualTargeting !== prevState.contextualTargeting &&
      prevState.contextualTargeting?.status === 'INIT' &&
      contextualTargeting?.status === 'DRAFT'
    )
      this.initLiftData(contextualTargeting);
    if (
      contextualTargeting !== prevState.contextualTargeting &&
      (prevState.contextualTargeting?.status === 'PUBLISHED' ||
        prevState.contextualTargeting?.status === 'LIVE_PUBLISHED') &&
      contextualTargeting?.status === 'LIVE'
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
          const sortedContextualKeys = contextualKeys.sort(this.sortCks);
          const totalPageViewVolume = sortedContextualKeys.reduce((acc, ck) => {
            if (ck.occurrences_in_datamart_count) return acc + ck.occurrences_in_datamart_count;
            else return acc;
          }, 0);
          this.setState({
            sortedContextualKeys: sortedContextualKeys,
            isLoadingContextualKeys: false,
            totalPageViewVolume: totalPageViewVolume,
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
    const parsed = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
    });
    return parsed.data as ContextualKeyResource[];
  };

  sortCks = (ck1: ContextualKeyResource, ck2: ContextualKeyResource): number => {
    if (ck1.lift != ck2.lift) {
      return ck2.lift - ck1.lift;
    } else {
      return ck2.occurrences_in_datamart_count - ck1.occurrences_in_datamart_count;
    }
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

  onSliderChange = (point: DataPoint) => {
    const contextualKeys = this.state.sortedContextualKeys?.filter(url => url.lift >= point.lift);
    const targetedPageViewVolume = contextualKeys?.reduce((acc, ck) => {
      return acc + ck.occurrences_in_datamart_count;
    }, 0);

    this.setState({
      chartDataSelected: point as ChartDataResource,
      targetedContextualKeyResources: contextualKeys,
      targetedPageViewVolume: targetedPageViewVolume,
    });
  };

  onCreateContextualTargetingClick = () => {
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

  getTargetedVolumeRatio = () => {
    const { targetedPageViewVolume, totalPageViewVolume } = this.state;
    return targetedPageViewVolume && totalPageViewVolume
      ? targetedPageViewVolume / totalPageViewVolume
      : 0;
  };

  renderChartComponent = () => {
    const { contextualTargeting, isLiveEditing, sortedContextualKeys, totalPageViewVolume } =
      this.state;

    return (
      <ContextualTargetingChart
        contextualTargeting={contextualTargeting}
        isEditing={isLiveEditing}
        sortedContextualKeys={sortedContextualKeys}
        totalPageViewVolume={totalPageViewVolume}
        onSliderChange={this.onSliderChange}
        createContextualTargeting={this.onCreateContextualTargetingClick}
      />
    );
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

  onEdit = () => {
    this.setState({
      isLiveEditing: true,
    });
  };

  onArchiveContextualTargeting = () => {
    const { segmentId } = this.props;
    const { contextualTargeting } = this.state;
    if (contextualTargeting) {
      this.setState({ isLoading: true });
      this._contextualTargetingService
        .archiveContextualTargeting(segmentId, contextualTargeting.id)
        .then(_ =>
          this.setState({
            contextualTargeting: undefined,
            sortedContextualKeys: undefined,
            targetedContextualKeyResources: undefined,
            signatureScoredCategoryResources: undefined,
            chartDataSelected: undefined,
            totalPageViewVolume: undefined,
            targetedPageViewVolume: undefined,
            activeTabKey: '0',
            isLoading: false,
          }),
        )
        .catch(err => {
          this.props.notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    }
  };

  renderStatsCard = () => {
    const {
      contextualTargeting,
      isLiveEditing,
      chartDataSelected,
      targetedContextualKeyResources,
    } = this.state;
    return (
      <ContextualTargetingStatsCard
        contextualTargeting={contextualTargeting}
        isLiveEditing={isLiveEditing}
        chartDataSelected={chartDataSelected}
        numberOfTargetedContent={targetedContextualKeyResources?.length}
        onPublishContextualTargeting={this.onPublishContextualTargeting}
        onArchiveContextualTargeting={this.onArchiveContextualTargeting}
        onEdit={this.onEdit}
      />
    );
  };

  renderSubTabsComponent = () => {
    const {
      contextualTargeting,
      targetedContextualKeyResources,
      isLoadingContextualKeys,
      signatureScoredCategoryResources,
      isLoadingSignature,
    } = this.state;
    return (
      <ContextualTargetingSubTabs
        contextualTargeting={contextualTargeting}
        targetedContextualKeyResources={targetedContextualKeyResources}
        isLoadingContextualKeys={isLoadingContextualKeys}
        signatureScoredCategoryResources={signatureScoredCategoryResources}
        isLoadingSignature={isLoadingSignature}
      />
    );
  };

  render() {
    const { isLoading } = this.state;
    const chartComponent = this.renderChartComponent();
    const statsCard = this.renderStatsCard();
    const stepTableComponent = this.renderSubTabsComponent();

    return isLoading ? (
      <LoadingChart />
    ) : (
      <React.Fragment>
        <Row className='mcs-contextualTargetingDashboard_contextualTargetingChartContainer'>
          <Col span={19}>{chartComponent}</Col>
          <Col span={5}>{statsCard}</Col>
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

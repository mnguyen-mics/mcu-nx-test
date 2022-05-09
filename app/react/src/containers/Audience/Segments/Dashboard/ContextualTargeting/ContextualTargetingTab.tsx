import {
  Card,
  EmptyChart,
  LoadingChart,
  TableViewFilters,
} from '@mediarithmics-private/mcs-components-library';
import { messages } from './messages';
import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Col, Row, Slider, Statistic, Steps } from 'antd';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { fetchUrls } from './domain';
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

export interface UrlResource {
  id: string;
  url: string;
  number_of_events: number;
  number_of_user_points: number;
  lift: number;
}

interface ContextualTargetingTabProps {
  datamartId: string;
  segmentId: string;
}

const { Step } = Steps;

type Props = ContextualTargetingTabProps & InjectedNotificationProps & InjectedIntlProps;

interface State {
  contextualTargeting?: ContextualTargetingResource;
  isLoading: boolean;
  initialUrls: UrlResource[];
  urls: UrlResource[];
  isLoadingUrls: boolean;
  totalUrls: number;
  sliderValue: number;
  totalOfUserPointsInUrls: number;
}

class ContextualTargetingTab extends React.Component<Props, State> {
  @lazyInject(TYPES.IContextualTargetingService)
  private _contextualTargetingService: IContextualTargetingService;

  private refreshContextualTargetingInterval = setInterval(() => {
    if (this.getContextualTargetingStatus() === 'INIT') {
      this.getContextualTargeting();
    }
  }, 10000);

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoadingUrls: true,
      initialUrls: [],
      urls: [],
      totalUrls: 0,
      sliderValue: 3,
      totalOfUserPointsInUrls: 0,
    };
  }

  componentDidMount() {
    this.getContextualTargeting();
    this.mockUrls();
  }

  componentWillUnmount() {
    clearInterval(this.refreshContextualTargetingInterval);
  }

  getContextualTargeting = () => {
    const { segmentId } = this.props;

    this._contextualTargetingService
      .getContextualTargetings(segmentId)
      .then(res => {
        this.setState({
          contextualTargeting: res.data[0],
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

  mockUrls = () => {
    this.setState({
      isLoadingUrls: true,
    });
    return fetchUrls().then((res: UrlResource[]) => {
      const urls = res.filter(u => u.lift > this.state.sliderValue);
      this.setState({
        initialUrls: urls,
        urls: urls,
        totalUrls: urls.length,
        isLoadingUrls: false,
        totalOfUserPointsInUrls: urls.reduce((acc, v) => {
          return acc + v.number_of_user_points;
        }, 0),
      });
    });
  };

  onPublishSiteTag = () => {
    //
  };

  onSliderChange = (value: number) => {
    const urls = this.state.initialUrls.filter(url => url.lift > value);
    this.setState({
      sliderValue: value,
      urls: urls,
      totalUrls: urls.length,
      totalOfUserPointsInUrls: urls.reduce((acc, v) => {
        return acc + v.number_of_user_points;
      }, 0),
    });
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

  getContextualTargetingStatus = () => {
    const { contextualTargeting } = this.state;
    return contextualTargeting ? contextualTargeting.status : undefined;
  };

  getStepIndex = (status?: ContextualTargetingStatus) => {
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
        return 2;
      case 'LIVE_PUBLISHED':
        return 2;
    }
  };

  renderNoCtStepTab = () => {
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

  renderInitializationStepTab = () => {
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

  renderDraftStepTab = () => {
    const { intl } = this.props;
    const { urls, isLoadingUrls, sliderValue } = this.state;
    const marks = {
      0: 0,
      2: 2,
      4: 4,
      6: 6,
      8: 8,
    };
    const dataColumnsDefinition: Array<DataColumnDefinition<UrlResource>> = [
      {
        title: intl.formatMessage(messages.url),
        key: 'url',
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
        key: 'number_of_events',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    return (
      <div className='mcs-contextualTargetingDashboard_draftStep'>
        <div className='mcs-contextualTargetingDashboard_graph'>graph</div>
        <Slider
          marks={marks}
          defaultValue={3}
          max={9}
          value={sliderValue}
          onChange={this.onSliderChange}
        />
        <Card title={intl.formatMessage(messages.targetedUrls)}>
          <TableViewFilters
            dataSource={urls}
            loading={isLoadingUrls}
            columns={dataColumnsDefinition}
          />
        </Card>
      </div>
    );
  };

  render() {
    const { intl } = this.props;
    const { sliderValue, totalUrls, totalOfUserPointsInUrls, isLoading } = this.state;

    const contextualTargetingStatus = this.getContextualTargetingStatus();
    const stepIndex = this.getStepIndex(contextualTargetingStatus);

    let stepTabComp;

    if (isLoading) {
      stepTabComp = <LoadingChart />;
    } else if (!contextualTargetingStatus) {
      stepTabComp = this.renderNoCtStepTab();
    } else if (contextualTargetingStatus === 'INIT') {
      stepTabComp = this.renderInitializationStepTab();
    } else {
      stepTabComp = this.renderDraftStepTab();
    }

    return (
      <Row className='mcs-contextualTargetingDashboard_contextualTargetingTab'>
        <Col span={19}>{stepTabComp}</Col>
        <Col span={5}>
          <Steps direction='vertical' current={this.getStepIndex(contextualTargetingStatus)}>
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
          {stepIndex >= 1 && (
            <div className='mcs-contextualTargetingDashboard_settingsCard'>
              <div className='mcs-contextualTargetingDashboard_settingsCardContainer'>
                <Statistic title={intl.formatMessage(messages.selectedLift)} value={sliderValue} />
                <Statistic
                  title={intl.formatMessage(messages.numberOfTargetedUrls)}
                  value={totalUrls}
                />
                <Statistic
                  title={intl.formatMessage(messages.numberOfVisitors)}
                  value={totalOfUserPointsInUrls}
                />
              </div>

              <div
                className='mcs-contextualTargetingDashboard_settingsCardButton'
                onClick={this.onPublishSiteTag}
              >
                {intl.formatMessage(messages.settingsCardButton)}
              </div>
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

export default compose<Props, ContextualTargetingTabProps>(
  injectIntl,
  injectNotifications,
)(ContextualTargetingTab);

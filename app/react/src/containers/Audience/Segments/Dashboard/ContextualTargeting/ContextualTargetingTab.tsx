import { Card, EmptyChart, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { messages } from './messages';
import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Col, Row, Slider, Statistic, Steps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { fetchUrls } from './domain';

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

type Props = ContextualTargetingTabProps & InjectedIntlProps;

interface State {
  current: number;
  loading?: boolean;
  initialUrls: UrlResource[];
  urls: UrlResource[];
  isLoadingUrls: boolean;
  totalUrls: number;
  sliderValue: number;
  totalOfUserPointsInUrls: number;
}

class ContextualTargetingTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      current: 0,
      isLoadingUrls: true,
      initialUrls: [],
      urls: [],
      totalUrls: 0,
      sliderValue: 3,
      totalOfUserPointsInUrls: 0,
    };
  }

  componentDidMount() {
    this.fetchUrls();
  }

  fetchUrls = () => {
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
      loading: true,
    });
    setTimeout(() => {
      this.setState({ current: 1 });
    }, 3000);
  };

  render() {
    const { intl } = this.props;
    const {
      current,
      loading,
      urls,
      isLoadingUrls,
      sliderValue,
      totalUrls,
      totalOfUserPointsInUrls,
    } = this.state;
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
      <Row className='mcs-audienceSegmentDashboard_contextualTargetingTab'>
        <Col span={20}>
          {current === 1 ? (
            <div className='mcs-audienceSegmentDashboard_stepTwo'>
              <div className='mcs-audienceSegmentDashboard_graph'>graph</div>
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
          ) : (
            <div className='mcs-audienceSegmentDashboard_stepOne'>
              <EmptyChart
                title={intl.formatMessage(messages.contextualTargetingTabText)}
                icon='optimization'
              />
              <Button className='mcs-primary' type='primary' onClick={this.onClick}>
                {intl.formatMessage(messages.contextualTargetingTabButton)}
              </Button>
            </div>
          )}
        </Col>
        <Col span={4}>
          <Steps direction='vertical' current={current}>
            <Step
              title={intl.formatMessage(messages.stepOneTitle)}
              description={intl.formatMessage(messages.stepOneDescription)}
              icon={loading && current !== 1 && <LoadingOutlined />}
            />
            <Step
              title={intl.formatMessage(messages.stepTwoTitle)}
              description={intl.formatMessage(messages.stepTwoDescription)}
              disabled={true}
            />
            <Step
              title={intl.formatMessage(messages.stepThreeTitle)}
              description={intl.formatMessage(messages.stepThreeDescription)}
              disabled={true}
            />
          </Steps>
          {current === 1 && (
            <div className='mcs-audienceSegmentDashboard_settingsCard'>
              <div className='mcs-audienceSegmentDashboard_settingsCardContainer'>
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
                className='mcs-audienceSegmentDashboard_settingsCardButton'
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

export default compose<Props, ContextualTargetingTabProps>(injectIntl)(ContextualTargetingTab);

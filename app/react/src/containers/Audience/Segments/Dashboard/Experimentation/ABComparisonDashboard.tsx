import * as React from 'react';
import { compose } from 'recompose';
import _ from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router';
import { EditAudienceSegmentParam } from '../../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import FeedCardList from './../Feeds/FeedCardList';
import { UserQuerySegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import ABComparisonGauge from './ABComparisonGauge';
import { messagesMap } from '../Experimentation/AudienceExperimentationForm';
import {
  averageSessionDurationConfig,
  ecommerceEngagementConfig,
  abTestingDashboardConfig,
} from '../../../DatamartUsersAnalytics/config/AnalyticsConfigJson';
import DatamartUsersAnalyticsWrapper, {
  DatamartUsersAnalyticsWrapperProps,
} from '../../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { Card, Alert } from 'antd';
import McsTabs from '../../../../../components/McsTabs';
import { Loading } from '../../../../../components';
import { DashboardConfig } from '../../../DatamartUsersAnalytics/DatamartUsersAnalyticsContent';

interface State {
  ABComparisonDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
  isLoading: boolean;
  allApiValues: any[];
}

export interface ABComparisonDashboardProps {
  experimentationSegment?: UserQuerySegment;
  controlGroupSegment?: UserQuerySegment;
}

type Props = ABComparisonDashboardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps &
  InjectedThemeColorsProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class ABComparisonDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ABComparisonDashboardConfig: [],
      isLoading: true,
      allApiValues: [],
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { controlGroupSegment, experimentationSegment, colors } = this.props;
    const {
      controlGroupSegment: prevControlGroupSegment,
      experimentationSegment: prevExperimentationSegment,
    } = prevProps;
    if (
      (!_.isEqual(prevControlGroupSegment, controlGroupSegment) ||
        !_.isEqual(prevExperimentationSegment, experimentationSegment)) &&
      controlGroupSegment &&
      controlGroupSegment.id &&
      experimentationSegment &&
      experimentationSegment.id
    ) {
      this.setState({
        ABComparisonDashboardConfig: this.getABComparisonDashboardConfig().map(
          dashboardConfig => {
            return {
              ...dashboardConfig,
              config: dashboardConfig.config.map(config => {
                return {
                  ...config,
                  charts: config.charts.map(c => {
                    return {
                      ...c,
                      samplingRatio:
                        c.samplingRatio && experimentationSegment.weight,
                    };
                  }),
                  color: colors['mcs-warning'],
                  segments: {
                    segmentIdToCompareWith: experimentationSegment.id,
                    baseSegmentId: controlGroupSegment.id,
                  },
                };
              }),
            };
          },
        ),
        isLoading: false,
      });
    }
  }

  getApiValue = (value: string | number | null | undefined) => {
    this.setState({
      allApiValues: this.state.allApiValues.concat(value),
    });
  };

  hideDashboard = () => {
    const { allApiValues } = this.state;
    return (
      allApiValues.length >= 1 &&
      (allApiValues.includes(undefined) || allApiValues.includes(null))
    );
  };

  getABComparisonDashboardConfig = () => {
    const {
      experimentationSegment,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;
    if (experimentationSegment) {
      const getFormattedConfigTitle = (
        configs: DatamartUsersAnalyticsWrapperProps[],
      ) => {
        return configs.map(c => {
          return {
            ...c,
            title: c.title ? intl.formatMessage(messagesMap[c.title]) : '',
          };
        });
      };

      const eCommerceEngagementDashboardConfig: DatamartUsersAnalyticsWrapperProps = {
        title: 'E_COMMERCE_ENGAGEMENT',
        datamartId: experimentationSegment.datamart_id,
        config: ecommerceEngagementConfig,
        organisationId: organisationId,
      };
      const averageSessionDurationDashboardConfig: DatamartUsersAnalyticsWrapperProps = {
        title: 'CHANNEL_ENGAGEMENT',
        datamartId: experimentationSegment.datamart_id,
        config: averageSessionDurationConfig,
        organisationId: organisationId,
      };

      const ABComparisonDashboardConfig = [
        eCommerceEngagementDashboardConfig,
        averageSessionDurationDashboardConfig,
      ];
      // Below the graphs, we want to display the config related to the target_metric firstly.
      // But in a near future there could be more than two engagement configs
      // Hence the code underneath

      const firstConfig = ABComparisonDashboardConfig.find(
        c => c.title === experimentationSegment.target_metric,
      );

      return firstConfig
        ? [
            {
              ...firstConfig,
              title: firstConfig.title
                ? intl.formatMessage(messagesMap[firstConfig.title])
                : '',
            },
          ].concat(
            getFormattedConfigTitle(
              ABComparisonDashboardConfig.filter(
                c => c.title !== experimentationSegment.target_metric,
              ),
            ),
          )
        : getFormattedConfigTitle(ABComparisonDashboardConfig);
    } else return [];
  };

  buildItems = () => {
    const {
      experimentationSegment,
      match: {
        params: { organisationId },
      },
      controlGroupSegment,
      intl,
      colors,
    } = this.props;
    if (experimentationSegment && controlGroupSegment) {
      return abTestingDashboardConfig.map((config, i) => {
        const enhancedConfig: DashboardConfig = {
          ...config,
          segments: {
            segmentIdToCompareWith: experimentationSegment.id,
            baseSegmentId: controlGroupSegment.id,
            segmentToCompareWithName: intl.formatMessage(
              messagesMap.experimentationSegmentName,
            ),
            baseSegmentName: intl.formatMessage(
              messagesMap.controlGroupSegmentName,
            ),
          },
          charts: config.charts.map(c => {
            return {
              ...c,
              options: {
                ...c.options,
                colors: [colors['mcs-primary'], colors['mcs-warning']],
              },
            };
          }),
        };
        return {
          title: config.title || '',
          display: (
            <DatamartUsersAnalyticsWrapper
              key={i.toString()}
              datamartId={experimentationSegment.datamart_id}
              organisationId={organisationId}
              config={[enhancedConfig]}
              showDateRangePicker={true}
            />
          ),
        };
      });
    } else return [];
  };

  render() {
    const { experimentationSegment, controlGroupSegment } = this.props;
    const { ABComparisonDashboardConfig, isLoading } = this.state;
    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    return controlGroupSegment &&
      controlGroupSegment.user_points_count === 0 ? (
      <Alert
        message={
          <FormattedMessage
            id="audience.segments.experimentation.dashboard.noUserPoint"
            defaultMessage="Your Control Group segment has no User Point. Please contact your support."
          />
        }
        type="warning"
      />
    ) : this.hideDashboard() ? (
      <Alert
        message={
          <FormattedMessage
            id="audience.segments.experimentation.dashboard.controlGroupSegmentNotComputed"
            defaultMessage="Your Control Group segment is not yet computed. Please come back when later."
          />
        }
        type="warning"
      />
    ) : (
      <React.Fragment>
        <ABComparisonGauge
          weight={experimentationSegment && experimentationSegment.weight}
        />
        <Card>
          <McsTabs items={this.buildItems()} />
        </Card>
        {ABComparisonDashboardConfig.map((conf, i) => {
          return (
            <DatamartUsersAnalyticsWrapper
              key={i.toString()}
              title={conf.title}
              subTitle={conf.subTitle}
              datamartId={conf.datamartId}
              organisationId={conf.organisationId}
              config={conf.config}
              showFilter={conf.showFilter}
              getApiValue={this.getApiValue} // ugly af
            />
          );
        })}
        <FeedCardList />
      </React.Fragment>
    );
  }
}

export default compose<Props, ABComparisonDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectThemeColors,
)(ABComparisonDashboard);

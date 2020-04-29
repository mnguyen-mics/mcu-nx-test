import * as React from 'react';
import { compose } from 'recompose';
import _ from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router';
import { EditAudienceSegmentParam } from '../../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import FeedCardList from './../Feeds/FeedCardList';
import { UserQuerySegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import ABComparisonGauge from './ABComparisonGauge';
import { messagesMap } from '../Experimentation/AudienceExperimentationForm';
import {
  averageSessionDurationConfig,
  ecommerceEngagementConfig,
  graphsConfig,
} from '../../../DatamartUsersAnalytics/config/AnalyticsConfigJson';
import DatamartUsersAnalyticsWrapper, { DatamartUsersAnalyticsWrapperProps } from '../../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import { Card } from 'antd';
import McsTabs from '../../../../../components/McsTabs';
import { Loading } from '../../../../../components';

interface State {
  ABComparisonDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
  isLoading: boolean;
}

export interface ABComparisonDashboardProps {
  experimentationSegment?: UserQuerySegment;
  controlGroupSegment?: UserQuerySegment;
}

type Props = ABComparisonDashboardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class ABComparisonDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ABComparisonDashboardConfig: [],
      isLoading: true,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { controlGroupSegment, experimentationSegment } = this.props;
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
                  segments: {
                    baseSegmentId: controlGroupSegment.id,
                    segmentIdToCompareWith: experimentationSegment.id,
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

  getABComparisonDashboardConfig = () => {
    const {
      experimentationSegment,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;
    if (experimentationSegment) {
      const getFormattedTitleConfig = (configs: DatamartUsersAnalyticsWrapperProps[]) => {
        return configs.map(c => {
          return {
            ...c,
            title: c.title ? intl.formatMessage(messagesMap[c.title]) : '',
          };
        });
      };

      const eCommerceEngagementDashboardConfig = {
        title: 'E_COMMERCE_ENGAGEMENT',
        datamartId: experimentationSegment.datamart_id,
        config: ecommerceEngagementConfig,
        organisationId: organisationId,
      };
      const averageSessionDurationDashboardConfig = {
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
            getFormattedTitleConfig(
              ABComparisonDashboardConfig.filter(
                c => c.title !== experimentationSegment.target_metric,
              ),
            ),
          )
        : getFormattedTitleConfig(ABComparisonDashboardConfig);
    } else return [];
  };

  buildItems = () => {
    const {
      experimentationSegment,
      match: {
        params: { organisationId },
      },
      controlGroupSegment,
    } = this.props;
    if (experimentationSegment && controlGroupSegment) {
      return graphsConfig.map((graphConfig, i) => {
        const newConfig = {
          ...graphConfig,
          segments: {
            baseSegmentId: controlGroupSegment.id,
            segmentIdToCompareWith: experimentationSegment.id,
          },
        };
        return {
          title: graphConfig.title || '',
          display: (
            <DatamartUsersAnalyticsWrapper
              key={i.toString()}
              datamartId={experimentationSegment.datamart_id}
              organisationId={organisationId}
              config={[newConfig]}
              showDateRangePicker={true}
            />
          ),
        };
      });
    } else return [];
  };

  render() {
    const { experimentationSegment } = this.props;
    const { ABComparisonDashboardConfig, isLoading } = this.state;
    return !isLoading ? (
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
            />
          );
        })}
        <FeedCardList />
      </React.Fragment>
    ) : (
      <Loading className="loading-full-screen" />
    );
  }
}

export default compose<Props, ABComparisonDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(ABComparisonDashboard);

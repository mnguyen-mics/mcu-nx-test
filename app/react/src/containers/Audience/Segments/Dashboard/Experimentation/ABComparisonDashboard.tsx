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
  FILTERS,
} from '../../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { Card, Alert } from 'antd';
import {
  McsTabs,
  McsDateRangePicker,
} from '@mediarithmics-private/mcs-components-library';
import { Loading } from '../../../../../components';
import DatamartUsersAnalyticsContent, {
  DashboardConfig,
} from '../../../DatamartUsersAnalytics/DatamartUsersAnalyticsContent';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import SegmentFilter from '../../../DatamartUsersAnalytics/components/SegmentFilter';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../constants';
import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { SegmentNameDisplay } from '../../../Common/SegmentNameDisplay';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';

interface State {
  ABComparisonDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
  isLoading: boolean;
  disableFilters: boolean;
}

export interface ABComparisonDashboardProps {
  experimentationSegment: UserQuerySegment;
  controlGroupSegment?: UserQuerySegment;
}

type Props = ABComparisonDashboardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps &
  InjectedFeaturesProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class ABComparisonDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ABComparisonDashboardConfig: [],
      isLoading: true,
      disableFilters: false,
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
      controlGroupSegment.id
    ) {
      this.setState({
        ABComparisonDashboardConfig: this.getABComparisonDashboardConfig().map(
          (dashboardConfig) => {
            return {
              ...dashboardConfig,
              config: dashboardConfig.config.map((config) => {
                return {
                  ...config,
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

  getABComparisonDashboardConfig = () => {
    const {
      experimentationSegment,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;
    const getFormattedConfigTitle = (
      configs: DatamartUsersAnalyticsWrapperProps[],
    ) => {
      return configs.map((c) => {
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
      (c) => c.title === experimentationSegment.target_metric,
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
              (c) => c.title !== experimentationSegment.target_metric,
            ),
          ),
        )
      : getFormattedConfigTitle(ABComparisonDashboardConfig);
  };

  buildItems = () => {
    const {
      experimentationSegment,
      controlGroupSegment,
      intl,
      colors,
    } = this.props;
    if (controlGroupSegment) {
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
          charts: config.charts.map((c) => {
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
            <DatamartUsersAnalyticsContent
              key={i.toString()}
              datamartId={experimentationSegment.datamart_id}
              dateRange={{
                from: this.getFilter().from,
                to: this.getFilter().to,
              }}
              onChange={this.getLoadingState}
              config={[enhancedConfig]}
              segmentToAggregate={true}
            />
          ),
        };
      });
    } else return [];
  };

  getFilter = () => {
    const {
      location: { search },
    } = this.props;
    return parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
  };

  updateLocationSearch = (params: FILTERS) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DATAMART_USERS_ANALYTICS_SETTING,
      ),
    };

    history.push(nextLocation);
  };

  renderDatePicker() {
    const { controlGroupSegment } = this.props;

    const { disableFilters } = this.state;

    const values = {
      from: this.getFilter().from,
      to: this.getFilter().to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        disabled={disableFilters}
        excludeToday={true}
        startDate={controlGroupSegment && controlGroupSegment.creation_ts}
      />
    );
  }

  onSegmentFilterChange = (newValues: string[]) => {
    this.updateLocationSearch({
      segments: newValues,
    });
  };

  onAllUserFilterChange = (status: boolean) => {
    this.updateLocationSearch({
      allusers: status,
    });
  };

  getLoadingState = (disableFilters: boolean) =>
    this.setState({ disableFilters });

  getSegmentToAddToDimensionFilterClause = () => {
    const segmentId = this.getFilter().segments && this.getFilter().segments[0];
    return segmentId
      ? {
          key: segmentId,
          label: <SegmentNameDisplay audienceSegmentId={segmentId} />,
          value: segmentId,
        }
      : undefined;
  };

  render() {
    const {
      experimentationSegment,
      controlGroupSegment,
      hasFeature,
      colors,
      intl,
    } = this.props;
    const {
      ABComparisonDashboardConfig,
      isLoading,
      disableFilters,
    } = this.state;
    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return !experimentationSegment.user_points_count ||
      (controlGroupSegment && !controlGroupSegment.user_points_count) ? (
      <Alert
        message={
          <FormattedMessage
            id="audience.segments.experimentation.dashboard.noUserPoint"
            defaultMessage="Your {segmentName} segment has no data. If you feel this is not normal, please contact support."
            values={{
              segmentName: !experimentationSegment.user_points_count
                ? 'Experimentation'
                : 'Control Group',
            }}
          />
        }
        type="warning"
      />
    ) : experimentationSegment.user_points_count === 0 ||
      (controlGroupSegment && controlGroupSegment.user_points_count === 0) ? (
      <Alert
        message={
          <FormattedMessage
            id="audience.segments.experimentation.dashboard.zeroUserPoint"
            defaultMessage="Your {segmentName} segment has 0 User Point. If you feel this is not normal, please contact support."
            values={{
              segmentName:
                experimentationSegment.user_points_count === 0
                  ? 'Experimentation'
                  : 'Control Group',
            }}
          />
        }
        type="warning"
      />
    ) : (
      <React.Fragment>
        <ABComparisonGauge
          weight={experimentationSegment.weight}
          segment={experimentationSegment}
          segmentToCompareWith={controlGroupSegment}
        />
        <div className="mcs-datamartUsersAnalytics m-b-20">
          <SegmentFilter
            className={
              disableFilters
                ? 'mcs-datamartUsersAnalytics_segmentFilter _is_disabled'
                : 'mcs-datamartUsersAnalytics_segmentFilter'
            }
            onChange={this.onSegmentFilterChange}
            onToggleAllUsersFilter={this.onAllUserFilterChange}
            datamartId={experimentationSegment.datamart_id}
            organisationId={experimentationSegment.organisation_id}
            disableAllUserFilter={true}
            hideAllUsersButton={true}
            segmentcolors={[colors['mcs-warning']]}
            segmentFiltersLength={1}
            defaultSegment={this.getSegmentToAddToDimensionFilterClause()}
            defaultSegmentCanBeRemoved={true}
            placeholder={intl.formatMessage(
              messagesMap.abDashboardSegmentFilterPlaceholder,
            )}
            segmentType={'USER_ACTIVATION'}
          />

          <div className="text-right">{this.renderDatePicker()}</div>
        </div>
        {hasFeature('audience-segment_uplift_area_chart') && (
          <Card>
            <McsTabs items={this.buildItems()} />
          </Card>
        )}
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
              segmentToAggregate={true}
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
  injectFeatures,
  injectThemeColors,
)(ABComparisonDashboard);

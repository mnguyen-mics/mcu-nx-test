import * as React from 'react';
import {
  DashboardPageContent,
  DataFileDashboardResource,
} from '../../../models/dashboards/dashboards';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { DatamartUsersAnalyticsWrapperProps } from '../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { compose } from 'recompose';
import { LabeledValue } from 'antd/lib/select';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { DashboardPage } from './DashboardPage';
import { defaultDashboardContent } from '../DatamartUsersAnalytics/config/DefaultDashboardContentJson';
import { Loading, Error } from '@mediarithmics-private/mcs-components-library';
import { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';

export const messages = defineMessages({
  comingSoon: {
    id: 'audience.home.dashboard',
    defaultMessage: 'Coming Soon...',
  },
});
interface DashboardPageWrapperProps {
  datamartId: string;
  fetchDataFileDashboards: () => Promise<DataListResponse<DataFileDashboardResource>>;
  fetchApiDashboards: () => Promise<DashboardPageContent[]>;
  isFullScreenLoading: boolean;
  datamartAnalyticsConfig?: DatamartUsersAnalyticsWrapperProps[];
  disableAllUserFilter?: boolean;
  defaultSegment?: LabeledValue;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  tabsClassname?: string;
  className?: string;
  segmentDashboardTechnicalInformation?: React.ReactNode;
}

type Props = DashboardPageWrapperProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  InjectedIntlProps;

interface State {
  isLoading: boolean;
  dataFileDashboards: DataFileDashboardResource[];
  apiDashboards: DashboardPageContent[];
}

class DashboardPageWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dataFileDashboards: [],
      isLoading: true,
      apiDashboards: [],
    };
  }

  componentDidMount() {
    const { datamartId, fetchDataFileDashboards, fetchApiDashboards } = this.props;
    this.loadData(datamartId === '1500', fetchDataFileDashboards, fetchApiDashboards);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { dataFileDashboards: currentDataFileDashboards, apiDashboards: currentApiDashboards } =
      this.state;
    const { dataFileDashboards: nextDataFileDashboards, apiDashboards: nextApiDashboards } =
      nextState;
    const { source: currentSource, defaultSegment: currentDefaultSegment } = this.props;
    const { source: nextSource, defaultSegment: nextDefaultSegment } = nextProps;

    const shouldUpdate =
      currentDataFileDashboards !== nextDataFileDashboards ||
      currentApiDashboards !== nextApiDashboards ||
      currentSource !== nextSource ||
      currentDefaultSegment !== nextDefaultSegment;

    return shouldUpdate;
  }

  loadData = (
    defaultContentForApiDashboards: boolean,
    fetchDataFileDashboardsFunc: () => Promise<DataListResponse<DataFileDashboardResource>>,
    fetchApiDashboardsFunc: () => Promise<DashboardPageContent[]>,
  ) => {
    const { hasFeature } = this.props;

    const promises: Array<
      Promise<DataListResponse<DataFileDashboardResource> | DashboardPageContent[]>
    > = [fetchDataFileDashboardsFunc()];

    if (hasFeature('dashboards-new-engine')) promises.push(fetchApiDashboardsFunc());

    Promise.all(promises)
      .then(res => {
        const filteredApiDashboards = hasFeature('dashboards-new-engine')
          ? (res[1] as DashboardPageContent[]).map(dpc => {
              if (!dpc.dashboardContent && defaultContentForApiDashboards) {
                const defaultContent: DashboardPageContent = {
                  title: dpc.title,
                  dashboardContent: defaultDashboardContent,
                };
                return defaultContent;
              } else return dpc;
            })
          : [];

        if (filteredApiDashboards && filteredApiDashboards.length === 0)
          this.setState({
            isLoading: false,
            dataFileDashboards: (res[0] as DataListResponse<DataFileDashboardResource>).data,
          });
        else {
          this.setState({
            dataFileDashboards: (res[0] as DataListResponse<DataFileDashboardResource>).data,
            apiDashboards: filteredApiDashboards,
            isLoading: false,
          });
        }
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const {
      hasFeature,
      datamartId,
      source,
      tabsClassname,
      disableAllUserFilter,
      defaultSegment,
      className,
      isFullScreenLoading,
      datamartAnalyticsConfig,
      intl,
      segmentDashboardTechnicalInformation,
    } = this.props;

    const { isLoading, dataFileDashboards, apiDashboards } = this.state;

    const shouldDisplayAnalyticsFeature = hasFeature(
      'audience-dashboards-datamart_users_analytics',
    );

    if (
      !isLoading &&
      dataFileDashboards.length === 0 &&
      !shouldDisplayAnalyticsFeature &&
      apiDashboards.length === 0
    ) {
      if (segmentDashboardTechnicalInformation) return segmentDashboardTechnicalInformation;
      return <Error message={intl.formatMessage(messages.comingSoon)} />;
    }

    if (isLoading) {
      if (isFullScreenLoading)
        return <Loading className='m-t-20' isFullScreen={isFullScreenLoading} />;
      else return <Loading isFullScreen={isFullScreenLoading} />;
    } else {
      let dataFileDashboardsOpt: DataFileDashboardResource[] = dataFileDashboards.map(d => {
        d.name = '';
        return d;
      });
      let apiDashboardsOpt: DashboardPageContent[] | undefined;

      if (hasFeature('dashboards-new-engine')) {
        dataFileDashboardsOpt = dataFileDashboards;
        apiDashboardsOpt = apiDashboards;
      }

      return (
        <DashboardPage
          intl={intl}
          hasFeature={hasFeature}
          className={className}
          datamartId={datamartId}
          apiDashboards={apiDashboardsOpt}
          dataFileDashboards={dataFileDashboardsOpt}
          datamartAnalyticsConfig={
            hasFeature('audience-dashboards-datamart_users_analytics')
              ? datamartAnalyticsConfig
              : []
          }
          source={source}
          tabsClassname={tabsClassname}
          disableAllUserFilter={disableAllUserFilter}
          defaultSegment={defaultSegment}
          segmentDashboardTechnicalInformation={segmentDashboardTechnicalInformation}
        />
      );
    }
  }
}

export default compose<Props, DashboardPageWrapperProps>(
  injectFeatures,
  injectIntl,
)(DashboardPageWrapper);

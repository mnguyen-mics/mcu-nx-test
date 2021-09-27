import * as React from 'react';
import {
  DashboardPageContent,
  DataFileDashboardResource,
} from '../../../models/dashboards/dashboards';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import DatamartUsersAnalyticsWrapper, {
  DatamartUsersAnalyticsWrapperProps,
} from '../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import DashboardWrapper from './DashboardWrapper';
import { compose } from 'recompose';
import { McsTabs } from '@mediarithmics-private/mcs-components-library';
import { DashboardLayout } from '@mediarithmics-private/advanced-components';

interface DashboardPageProps {
  dataFileDashboards?: DataFileDashboardResource[];
  datamartAnalyticsConfig?: DatamartUsersAnalyticsWrapperProps[];
  apiDashboards?: DashboardPageContent[];
  datamartId: string;
}

type Props = DashboardPageProps & InjectedFeaturesProps;

class DashboardPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  getDashboardPageContent = (
    datamartId: string,
    dataFileDashboards?: DataFileDashboardResource[],
    datamartAnalyticsConfig?: DatamartUsersAnalyticsWrapperProps[],
    apiDashboards?: DashboardPageContent[],
  ) => {
    const defaultContent = (
      <div>
        {dataFileDashboards &&
          dataFileDashboards.length > 0 &&
          dataFileDashboards.map(d => (
            <DashboardWrapper
              key={d.id}
              layout={d.components}
              title={d.name}
              datamartId={d.datamart_id}
            />
          ))}
        {datamartAnalyticsConfig &&
          dataFileDashboards &&
          dataFileDashboards.length === 0 &&
          datamartAnalyticsConfig.map((conf, i) => {
            return (
              <DatamartUsersAnalyticsWrapper
                key={i.toString()}
                title={conf.title}
                subTitle={conf.subTitle}
                datamartId={conf.datamartId}
                organisationId={conf.organisationId}
                config={conf.config}
                showFilter={conf.showFilter}
                showDateRangePicker={conf.showDateRangePicker}
              />
            );
          })}
      </div>
    );

    if (apiDashboards && apiDashboards.length > 0) {
      const dashboardTabs = apiDashboards.map(dashboard => {
        return {
          title: dashboard.title,
          display: <DashboardLayout datamart_id={datamartId} schema={dashboard.dashboardContent} />,
        };
      });
      dashboardTabs.push({
        title: 'Old OTQL dashboard',
        display: defaultContent,
      });

      return <McsTabs items={dashboardTabs} />;
    } else return defaultContent;
  };

  render() {
    const { dataFileDashboards, datamartAnalyticsConfig, apiDashboards, datamartId } = this.props;

    return (
      <div>
        {this.getDashboardPageContent(
          datamartId,
          dataFileDashboards,
          datamartAnalyticsConfig,
          apiDashboards,
        )}
      </div>
    );
  }
}

export default compose<Props, DashboardPageProps>(injectFeatures)(DashboardPage);

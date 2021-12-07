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
import { LabeledValue } from 'antd/lib/select';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import ScopedDashboardLayout from './ScopedDashboardLayout';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';

export interface DashboardPageProps {
  dataFileDashboards?: DataFileDashboardResource[];
  datamartAnalyticsConfig?: DatamartUsersAnalyticsWrapperProps[];
  apiDashboards?: DashboardPageContent[];
  datamartId: string;
  disableAllUserFilter?: boolean;
  defaultSegment?: LabeledValue;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  tabsClassname?: string;
  className?: string;
  segmentDashboardTechnicalInformation?: React.ReactNode;
}
const messagesDashboardPage = defineMessages({
  technicalInformationTab: {
    id: 'dashboard.page.technical.information.tab',
    defaultMessage: 'Technical information',
  },
});

type Props = DashboardPageProps & InjectedFeaturesProps & InjectedIntlProps;

export class DashboardPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  getDashboardPageContent = (
    datamartId: string,
    dataFileDashboards?: DataFileDashboardResource[],
    datamartAnalyticsConfig?: DatamartUsersAnalyticsWrapperProps[],
    apiDashboards?: DashboardPageContent[],
    disableAllUserFilter?: boolean,
    defaultSegment?: LabeledValue,
    tabsClassname?: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
    segmentDashboardTechnicalInformation?: React.ReactNode,
  ) => {
    const {
      intl: { formatMessage },
    } = this.props;
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
              source={source}
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
                disableAllUserFilter={disableAllUserFilter}
                defaultSegment={defaultSegment}
              />
            );
          })}
      </div>
    );

    if (apiDashboards && apiDashboards.length > 0) {
      const dashboardTabs = apiDashboards
        .sort((a, b) => a.title.localeCompare(b.title))
        .filter(dashboard => !!dashboard.dashboardContent)
        .map(dashboard => {
          return {
            title: dashboard.title,
            display: dashboard.dashboardContent ? (
              <ScopedDashboardLayout
                datamartId={datamartId}
                schema={dashboard.dashboardContent}
                source={source}
              />
            ) : (
              <div />
            ),
          };
        });

      if (
        apiDashboards.length === 1 &&
        dataFileDashboards?.length === 0 &&
        datamartAnalyticsConfig?.length === 0 &&
        !segmentDashboardTechnicalInformation
      )
        return apiDashboards[0].dashboardContent ? (
          <div className='m-t-40'>
            <ScopedDashboardLayout
              datamartId={datamartId}
              schema={apiDashboards[0].dashboardContent}
              source={source}
            />
          </div>
        ) : (
          <div />
        );
      if (segmentDashboardTechnicalInformation) {
        dashboardTabs.unshift({
          title: formatMessage(messagesDashboardPage.technicalInformationTab),
          display: <div>{segmentDashboardTechnicalInformation}</div>,
        });
      }
      if (
        (dataFileDashboards && dataFileDashboards.length > 0) ||
        (datamartAnalyticsConfig && datamartAnalyticsConfig.length > 0)
      )
        dashboardTabs.push({
          title: dataFileDashboards?.length === 0 ? 'Activities analytics' : 'Old OTQL dashboard',
          display: defaultContent,
        });

      return (
        <McsTabs
          destroyInactiveTabPane={true}
          items={dashboardTabs}
          className={tabsClassname}
          animated={false}
        />
      );
    } else if (segmentDashboardTechnicalInformation) {
      const dashboardTabs = [];
      dashboardTabs.push({
        title: 'Technical information',
        display: <div>{segmentDashboardTechnicalInformation}</div>,
      });
      if (
        (dataFileDashboards && dataFileDashboards.length > 0) ||
        (datamartAnalyticsConfig && datamartAnalyticsConfig.length > 0)
      ) {
        dashboardTabs.push({
          title: dataFileDashboards?.length === 0 ? 'Activities analytics' : 'Old OTQL dashboard',
          display: defaultContent,
        });
        return (
          <McsTabs
            destroyInactiveTabPane={true}
            items={dashboardTabs}
            className={tabsClassname}
            animated={false}
          />
        );
      } else return <div>{segmentDashboardTechnicalInformation}</div>;
    } else return defaultContent;
  };

  render() {
    const {
      dataFileDashboards,
      datamartAnalyticsConfig,
      apiDashboards,
      datamartId,
      disableAllUserFilter,
      defaultSegment,
      tabsClassname,
      source,
      className,
      segmentDashboardTechnicalInformation,
    } = this.props;

    return (
      <div className={className}>
        {this.getDashboardPageContent(
          datamartId,
          dataFileDashboards,
          datamartAnalyticsConfig,
          apiDashboards,
          disableAllUserFilter,
          defaultSegment,
          tabsClassname,
          source,
          segmentDashboardTechnicalInformation,
        )}
      </div>
    );
  }
}

export default compose<Props, DashboardPageProps>(injectFeatures, injectIntl)(DashboardPage);

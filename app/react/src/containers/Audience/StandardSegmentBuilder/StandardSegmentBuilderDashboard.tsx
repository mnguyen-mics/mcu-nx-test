import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from './constants';
import { compose } from 'recompose';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import CardFlex from '../Dashboard/Components/CardFlex';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import TimelineSelector from '../AdvancedSegmentBuilder/TimelineSelector';
import { formatMetric } from '../../../utils/MetricHelper';
import { QueryTranslationRequest } from '../../../models/datamart/DatamartResource';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import DatamartUsersAnalyticsWrapper from '../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import DashboardWrapper from '../Dashboard/DashboardWrapper';
import {
  DashboardPageWrapper,
  ICustomDashboardService,
  ITagService,
  TYPES as TYPESA,
  lazyInject as lazyInjectA,
} from '@mediarithmics-private/advanced-components';
import { DashboardPageContent } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dashboardsModel';

interface StandardSegmentBuilderDashboardProps {
  organisationId: string;
  datamartId: string;
  standardSegmentBuilderId: string;
  totalAudience?: number;
  queryDocument?: StandardSegmentBuilderQueryDocument;
  isQueryRunning: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  StandardSegmentBuilderDashboardProps &
  InjectedFeaturesProps;
class StandardSegmentBuilderDashboard extends React.Component<Props> {
  @lazyInjectA(TYPESA.ICustomDashboardService)
  private _dashboardService: ICustomDashboardService;
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;
  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      intl,
      totalAudience,
      isQueryRunning,
      queryDocument,
      datamartId,
      organisationId,
      standardSegmentBuilderId,
    } = this.props;

    const getTimelineSelectorOTQLQuery = (): Promise<string> => {
      const selectionQueryDocument = {
        operations: [{ directives: [], selections: [{ name: 'id' }] }],
        from: 'UserPoint',
        where: queryDocument?.where,
      };

      const queryTranslationRequest: QueryTranslationRequest = {
        input_query_language: 'JSON_OTQL',
        input_query_language_subtype: 'PARAMETRIC',
        input_query_text: JSON.stringify(selectionQueryDocument),
        output_query_language: 'OTQL',
      };

      return this._queryService.translateQuery(datamartId, queryTranslationRequest).then(res => {
        return res.data.output_query_text;
      });
    };

    const fetchApiDashboards = () => {
      return this._dashboardService.getDashboardsPageContents(
        organisationId,
        { archived: false },
        'builders',
        standardSegmentBuilderId,
      );
    };

    const fetchDataFileDashboards = () => {
      return this._dashboardService.getDataFileStandardSegmentBuilderDashboards(
        organisationId,
        datamartId,
        standardSegmentBuilderId,
      );
    };

    const handleOnShowDashboard = (dashboard: DashboardPageContent) => {
      if (dashboard.dashboardRegistrationId) {
        const stats = this._dashboardService.countDashboardsStats(dashboard);
        this._tagService.pushDashboardView(
          'builders',
          dashboard.dashboardRegistrationId,
          dashboard.title,
          stats.numberCharts,
          stats.otqlQueries,
          stats.activitiesAnalyticsQueries,
          stats.collectionVolumesQueries,
          stats.resourcesUsageQueries,
          stats.datafileQueries,
        );
      }
    };

    return (
      <div className='mcs-standardSegmentBuilder_liveDashboard'>
        <React.Fragment>
          <CardFlex className='mcs-standardSegmentBuilder_totalAudience'>
            <McsIcon type='full-users' />
            {isQueryRunning ? (
              <span />
            ) : !!totalAudience || totalAudience === 0 ? (
              <span>
                <span className='mcs-standardSegmentBuilder_totalValue'>
                  {formatMetric(totalAudience, '0,0')}
                </span>
                <span className='mcs-standardSegmentBuilder_selectedAudience'>
                  {intl.formatMessage(messages.selectedAudience)}
                </span>
              </span>
            ) : (
              '-'
            )}
          </CardFlex>
          <DashboardPageWrapper
            className='mcs-dashboardPage_content'
            datamartId={datamartId}
            organisationId={organisationId}
            source={queryDocument}
            tabsClassname='m-t-30'
            fetchApiDashboards={fetchApiDashboards}
            fetchDataFileDashboards={fetchDataFileDashboards}
            isFullScreenLoading={true}
            DatamartUsersAnalyticsWrapper={DatamartUsersAnalyticsWrapper}
            DashboardWrapper={DashboardWrapper}
            onShowDashboard={handleOnShowDashboard}
            queryExecutionSource={'DASHBOARD'}
            queryExecutionSubSource={'STANDARD_SEGMENT_BUILDER_DASHBOARD'}
          />
          <div className='mcs-standardSegmentBuilder_timelineSelector'>
            <TimelineSelector
              stale={false}
              datamartId={datamartId}
              getQuery={getTimelineSelectorOTQLQuery}
              organisationId={organisationId}
              isLoading={isQueryRunning}
            />
          </div>
        </React.Fragment>
      </div>
    );
  }
}

export default compose<Props, StandardSegmentBuilderDashboardProps>(
  injectIntl,
  injectFeatures,
  injectNotifications,
)(StandardSegmentBuilderDashboard);

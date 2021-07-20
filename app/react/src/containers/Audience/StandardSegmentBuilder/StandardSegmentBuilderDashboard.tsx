import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from './constants';
import { compose } from 'recompose';
import { DashboardResource } from '../../../models/dashboards/dashboards';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IDashboardService } from '../../../services/DashboardServices';
import { IQueryService } from '../../../services/QueryService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { Loading, McsIcon } from '@mediarithmics-private/mcs-components-library';
import DashboardWrapper from '../Dashboard/DashboardWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import TimelineSelector from '../AdvancedSegmentBuilder/TimelineSelector';
import { formatMetric } from '../../../utils/MetricHelper';
import { QueryResource } from '../../../models/datamart/DatamartResource';

interface StandardSegmentBuilderDashboardProps {
  organisationId: string;
  datamartId: string;
  standardSegmentBuilderId: string;
  totalAudience?: number;
  queryDocument?: StandardSegmentBuilderQueryDocument;
  isQueryRunning: boolean;
}

type Props = InjectedIntlProps & InjectedNotificationProps & StandardSegmentBuilderDashboardProps;

interface State {
  isDashboardLoading: boolean;
  dashboards: DashboardResource[];
}

class StandardSegmentBuilderDashboard extends React.Component<Props, State> {
  @lazyInject(TYPES.IDashboardService)
  private _dashboardService: IDashboardService;
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);

    this.state = {
      dashboards: [],
      isDashboardLoading: true,
    };
  }
  componentDidMount() {
    const { organisationId, datamartId, standardSegmentBuilderId } = this.props;
    this.loadData(organisationId, datamartId, standardSegmentBuilderId);
  }

  loadData = (organisationId: string, selectedDatamartId: string, standardSegmentBuilderId: string) => {
    this.setState({ isDashboardLoading: true });
    this._dashboardService
      .getStandardSegmentBuilderDashboards(organisationId, selectedDatamartId, standardSegmentBuilderId, {})
      .then(d => {
        this.setState({ dashboards: d.status === 'ok' ? d.data : [] });
      })
      .catch(err => {
        this.props.notifyError(err);
      })
      .finally(() => {
        this.setState({
          isDashboardLoading: false,
        });
      });
  };

  render() {
    const {
      intl,
      totalAudience,
      isQueryRunning,
      queryDocument,
      datamartId,
      organisationId,
    } = this.props;
    const { isDashboardLoading, dashboards } = this.state;

    const getTimelineSelectorOTQLQuery = (): Promise<string> => {
      const selectionQueryDocument = {
        operations: [{ directives: [], selections: [{ name: 'id' }] }],
        from: 'UserPoint',
        where: queryDocument?.where,
      };

      const queryResource: QueryResource = {
        id: '123',
        datamart_id: datamartId,
        query_language: 'JSON_OTQL',
        query_language_subtype: 'PARAMETRIC',
        query_text: JSON.stringify(selectionQueryDocument),
      };

      return this._queryService.convertJsonOtql2Otql(datamartId, queryResource).then(res => {
        return res.data.query_text;
      });
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
          {isDashboardLoading || !queryDocument ? (
            <Loading className='m-t-20' isFullScreen={true} />
          ) : (
            dashboards.map(d => (
              <DashboardWrapper
                key={d.id}
                layout={d.components}
                datamartId={d.datamart_id}
                source={queryDocument}
              />
            ))
          )}
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
  injectNotifications,
)(StandardSegmentBuilderDashboard);

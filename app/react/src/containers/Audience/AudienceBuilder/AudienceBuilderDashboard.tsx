import * as React from 'react';
import { Statistic } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from './constants';
import { compose } from 'recompose';
import { DashboardResource } from '../../../models/dashboards/dashboards';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IDashboardService } from '../../../services/DashboardServices';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import DashboardWrapper from '../Dashboard/DashboardWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';

interface AudienceBuilderDashboardProps {
  organisationId: string;
  datamartId: string;
  totalAudience?: number;
  queryDocument?: QueryDocument;
  isQueryRunning: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  AudienceBuilderDashboardProps;

interface State {
  isLoading: boolean;
  dashboards: DashboardResource[];
}

class AudienceBuilderDashboard extends React.Component<Props, State> {
  @lazyInject(TYPES.IDashboardService)
  private _dashboardService: IDashboardService;

  constructor(props: Props) {
    super(props);

    this.state = {
      dashboards: [],
      isLoading: true,
    };
  }
  componentDidMount() {
    const { organisationId, datamartId } = this.props;
    this.loadData(organisationId, datamartId);
  }

  loadData = (organisationId: string, selectedDatamartId: string) => {
    this.setState({ isLoading: true });
    this._dashboardService
      .getDashboards(organisationId, selectedDatamartId, 'HOME', {})
      .then(d => {
        return d.data;
      })
      .then(d => {
        this.setState({ isLoading: false, dashboards: d });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const { intl, totalAudience, isQueryRunning, queryDocument } = this.props;
    const { isLoading, dashboards } = this.state;
    return (
      <div className="mcs-audienceBuilder_liveDashboard">
        <CardFlex className="mcs-audienceBuilder_totalAudience">
          {totalAudience === undefined ? (
            <Statistic title={intl.formatMessage(messages.selectedAudience)} />
          ) : !isQueryRunning ? (
            <Statistic
              title={intl.formatMessage(messages.selectedAudience)}
              value={totalAudience}
            />
          ) : (
            <Loading isFullScreen={true} />
          )}
        </CardFlex>

        {isLoading ? (
          <Loading isFullScreen={true} />
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
      </div>
    );
  }
}

export default compose<Props, AudienceBuilderDashboardProps>(
  injectIntl,
  injectNotifications,
)(AudienceBuilderDashboard);

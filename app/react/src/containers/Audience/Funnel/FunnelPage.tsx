import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { parseSearch } from '../../../utils/LocationSearchHelper';
import { Button, Layout } from 'antd';
import * as React from 'react';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import { FUNNEL_SEARCH_SETTING } from '../../../components/Funnel/Constants';
import FunnelWrapper from '../../../components/Funnel/FunnelWrapper';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IUserActivitiesFunnelService } from '../../../services/UserActivitiesFunnelService';
import { withDatamartSelector, WithDatamartSelectorProps } from '../../Datamart/WithDatamartSelector';
import ExportService from '../../../services/ExportService';
import injectNotifications, { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import { extractDatesFromProps } from '../../../components/Funnel/Utils';
import { FunnelFilter } from '../../../models/datamart/UserActivitiesFunnel';

const { Content } = Layout;

interface State {
  exportIsRunning: boolean;
  isLoading: boolean;
  executeQuery?: () => void;
  cancelQuery?: () => void;
}

type JoinedProps = WithDatamartSelectorProps & InjectedIntlProps &
  InjectedNotificationProps;

class FunnelPage extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportIsRunning: false,
      isLoading: false
    };
  }

  handleRunExport = () => {
    this.setState({ exportIsRunning: true });
    const {
      selectedDatamartId,
      location: { search },
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const funnelFilter: FunnelFilter[] = (routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : {});
    funnelFilter.forEach(item => item.group_by_dimension = "channel_id")
    const funnelTimeRange = extractDatesFromProps(search);

    this._userActivitiesFunnelService
      .getUserActivitiesFunnel(selectedDatamartId, funnelFilter, funnelTimeRange)
      .then(funnelResponse => {
        this.setState({ exportIsRunning: false });
        ExportService.exportFunnel(funnelResponse.data, selectedDatamartId, organisationId, formatMessage);
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          exportIsRunning: false,
        });
      });
  }

  handleExecuteQueryButtonClick = () => {
    const {executeQuery} = this.state
    if(executeQuery) {
      executeQuery()
    }
  }

  handleFunnelWrapperCallback = (executeQuery: () => void, cancelQuery: () => void, isLoading: boolean) => {
    const { exportIsRunning } = this.state
    this.setState({
      exportIsRunning: exportIsRunning,
      isLoading: isLoading,
      executeQuery: executeQuery,
      cancelQuery: cancelQuery
    })
  }

  handleCancelButtonClick = () => {
    const {cancelQuery} = this.state
    if(cancelQuery) {
      cancelQuery()
      this.setState({
        isLoading: false
      })
    }
  }

  render() {
    const { 
      selectedDatamartId, 
      location: { search } 
    } = this.props;
    const { exportIsRunning, isLoading } = this.state;
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const breadcrumbPaths = [
      {
        key: 'Funnel Analytics',
        name: 'Funnel Analytics'
      }
    ];
    return (
      <div className="ant-layout" >
        <Actionbar paths={breadcrumbPaths}>
          {isLoading && <Button className="mcs-funnelQueryBuilder_cancelBtn" type="default" onClick={this.handleCancelButtonClick}>
            Cancel
          </Button>}
          <Button className="mcs-primary" type="primary" onClick={this.handleExecuteQueryButtonClick} loading={isLoading}>
            {!isLoading && <McsIcon type="play" />}
            Execute Query
          </Button>
          {routeParams.filter.length > 0 && <Button
            onClick={this.handleRunExport} loading={exportIsRunning} >
            {!exportIsRunning && <McsIcon type="download" />}
            <FormattedMessage
              id="funnel.actionbar.exportButton"
              defaultMessage="Export"
            />
          </Button>}
        </Actionbar>
        <Content className="mcs-content-container">
          <FunnelWrapper datamartId={selectedDatamartId} parentCallback={this.handleFunnelWrapperCallback}/>
        </Content>
      </div>)
  }
}


export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectNotifications
)(FunnelPage);

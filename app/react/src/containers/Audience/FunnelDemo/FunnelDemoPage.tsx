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

const { Content } = Layout;

interface State {
  exportIsRunning: boolean;
}

type JoinedProps = WithDatamartSelectorProps & InjectedIntlProps &
  InjectedNotificationProps;

class FunnelDemoPage extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportIsRunning: false,
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
    const funnelFilter = routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : {};
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


  render() {
    const { selectedDatamartId } = this.props;
    const { exportIsRunning } = this.state;
    const breadcrumbPaths = [
      {
        key: 'Funnel Builder',
        name: 'Funnel Builder'
      }
    ];
    return (
      <div className="ant-layout" >
        <Actionbar paths={breadcrumbPaths}>
          <Button
            onClick={this.handleRunExport} loading={exportIsRunning} >
            {!exportIsRunning && <McsIcon type="download" />}
            <FormattedMessage
              id="funnel.actionbar.exportButton"
              defaultMessage="Export"
            />
          </Button>
        </Actionbar>
        <Content className="mcs-content-container">
          <FunnelWrapper datamartId={selectedDatamartId} />
        </Content>
      </div>)
  }
}

export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectNotifications
)(FunnelDemoPage);
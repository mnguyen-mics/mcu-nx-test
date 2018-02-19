import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import MobileApplicationService from '../../../../services/MobileApplicationService';

import messages from './messages';
import settingsMessages from '../../messages';

import MobileApplicationsTable from './MobileApplicationsTable';
import { injectDrawer } from '../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { MobileApplicationResource } from '../../../../models/settings/settings';
import { Filter } from '../../Common/domain';


export interface MobileApplicationsListPageProps {
  organisationId: string;
  datamartId: string;
}



interface MobileApplicationsListPageState {
  mobileApplications: MobileApplicationResource[]
  totalMobileApplications: number;
  isFetchingMobileApplications: boolean;
  noMobileApplicationYet: boolean;
  filter: Filter;
}

type Props = MobileApplicationsListPageProps & RouteComponentProps<{ organisationId: string }> & InjectedNotificationProps & InjectDrawerProps;

class MobileApplicationsListPage extends React.Component<Props, MobileApplicationsListPageState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      mobileApplications: [],
      totalMobileApplications: 0,
      isFetchingMobileApplications: true,
      noMobileApplicationYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        name: '',
      },
    };
  }

  buildNewActionElement = (organisationId: string, datamartId: string) => {
    return (
      <Button key={messages.newMobileApplication.id} type="primary" onClick={this.onClick}>
        <FormattedMessage {...messages.newMobileApplication} />
      </Button>
    );
  }
  
  onClick = () => {
    const {
      history,
      match: {
        params: {
          organisationId
        }
      }
    } = this.props;
    history.push(`/v2/o/${organisationId}/settings/mobile_application/create`)
  }

  componentDidMount() {
    const {
      organisationId,
      datamartId,
    } = this.props;

    this.fetchMobileApplications(organisationId, datamartId, this.state.filter);
  }


  handleArchiveMobileApplication() {
    return Promise.resolve()
  }

  handleEditMobileApplication = (mobileApplication: MobileApplicationResource) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/mobile_application/${mobileApplication.id}/edit`);
  }

  handleFilterChange = (newFilter: Filter) => {
    const {
      organisationId,
      datamartId,
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchMobileApplications(organisationId, datamartId, newFilter);
  }

  /**
   * Data
   */

  fetchMobileApplications = (organisationId: string, datamartId: string, filter: Filter) => {
    const buildGetMobileApplicationsOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };

      if (filter.name) {
        return {
          ...options,
          name: filter.name,
        }
      }
      return options;
    };

    MobileApplicationService.getMobileApplications(organisationId, datamartId, buildGetMobileApplicationsOptions()).then(response => {
      this.setState({
        isFetchingMobileApplications: false,
        noMobileApplicationYet: response && response.count === 0 && !filter.name,
        mobileApplications: response.data,
        totalMobileApplications: response.count,
      });
    }).catch(error => {
      this.setState({ isFetchingMobileApplications: false });
      this.props.notifyError(error);
    });
  }

  

  render() {
    const {
      organisationId,
      datamartId,
    } = this.props;

    const {
      isFetchingMobileApplications,
      totalMobileApplications,
      mobileApplications,
      noMobileApplicationYet,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement(organisationId, datamartId);
    const buttons = [newButton];

    return (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title"><FormattedMessage {...settingsMessages.mobileApplications} /></span>
          <span className="mcs-card-button">{buttons}</span>
        </div>
        <hr className="mcs-separator" />
        <MobileApplicationsTable
          dataSource={mobileApplications}
          totalMobileApplications={totalMobileApplications}
          isFetchingMobileApplications={isFetchingMobileApplications}
          noMobileApplicationYet={noMobileApplicationYet}
          filter={filter}
          onFilterChange={this.handleFilterChange}
          onArchiveMobileApplication={this.handleArchiveMobileApplication}
          onEditMobileApplication={this.handleEditMobileApplication}
        />
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(MobileApplicationsListPage);

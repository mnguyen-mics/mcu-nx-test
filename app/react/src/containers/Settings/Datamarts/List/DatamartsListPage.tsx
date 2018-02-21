import * as React from 'react';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import DatamartService from '../../../../services/DatamartService';

import settingsMessages from '../../messages';

import DatamartsTable from './DatamartsTable';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import { Filter } from '../../Common/domain';

export interface DatamartsListPageProps {

}

interface DatamartsListPageState {
  datamarts: DatamartResource[];
  totalDatamarts: number;
  isFetchingDatamarts: boolean;
  noDatamartYet: boolean;
  filter: Filter,
}

type Props = DatamartsListPageProps & RouteComponentProps<{ organisationId: string }> & InjectedNotificationProps

class DatamartsListPage extends React.Component<Props, DatamartsListPageState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      datamarts: [],
      totalDatamarts: 0,
      isFetchingDatamarts: true,
      noDatamartYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        name: ''
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: {
          organisationId
        }
      },
    } = this.props;

    this.fetchDatamarts(organisationId, this.state.filter);
  }


  handleEditDatamart = (datamart: DatamartResource) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/datamarts/${datamart.id}/edit`);
  }

  handleFilterChange = (newFilter: Filter) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchDatamarts(organisationId, newFilter);
  }

  fetchDatamarts = (organisationId: string, filter: Filter) => {
    const buildGetDatamartsOptions = () => {
      return {
        allow_administrator: true,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
    };

    DatamartService.getDatamarts(organisationId, buildGetDatamartsOptions()).then(response => {
      this.setState({
        isFetchingDatamarts: false,
        noDatamartYet: response && response.count === 0,
        datamarts: response.data,
        totalDatamarts: response.count,
      });
    }).catch(error => {
      this.setState({ isFetchingDatamarts: false });
      this.props.notifyError(error);
    });
  }

  render() {
    const {
      isFetchingDatamarts,
      totalDatamarts,
      datamarts,
      noDatamartYet,
      filter,
    } = this.state;

    return (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title"><FormattedMessage {...settingsMessages.datamarts} /></span>
        </div>
        <hr className="mcs-separator" />
        <DatamartsTable
          dataSource={datamarts}
          totalDatamarts={totalDatamarts}
          isFetchingDatamarts={isFetchingDatamarts}
          noDatamartYet={noDatamartYet}
          filter={filter}
          onFilterChange={this.handleFilterChange}
          onEditDatamart={this.handleEditDatamart}
        />
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
)(DatamartsListPage);

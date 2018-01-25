import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withMcsRouter } from '../../Helpers';
import { ReactRouterPropTypes } from '../../../validators/proptypes';
import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';
import DatamartService from '../../../services/DatamartService';
import * as notifyActions from '../../../state/Notifications/actions';

import settingsMessages from '../messages';

import DatamartsTable from './DatamartsTable';

class DatamartsListPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      datamarts: [],
      totalDatamarts: 0,
      isFetchingDatamarts: true,
      noDatamartYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
      },
    };
    this.handleEditDatamart = this.handleEditDatamart.bind(this);
  }

  componentDidMount() {
    const {
      organisationId,
    } = this.props;

    this.fetchDatamarts(organisationId, this.state.filter);
  }


  handleEditDatamart(datamart) {
    const {
      organisationId,
      history,
    } = this.props;

    history.push(`/o${organisationId}/settings/datamarts/edit/${datamart.id}`);
  }

  fetchDatamarts(organisationId, filter) {
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

DatamartsListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: notifyActions.notifyError },
  ),
)(DatamartsListPage);

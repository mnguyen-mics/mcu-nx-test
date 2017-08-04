import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withMcsRouter } from '../../Helpers';
import { ReactRouterPropTypes } from '../../../validators/proptypes';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
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
        id: ''
      }
    };
    this.handleEditDatamart = this.handleEditDatamart.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    const {
      organisationId
    } = this.props;

    this.fetchDatamarts(organisationId, this.state.filter);
  }

  /**
   * Interaction
   */

  handleEditDatamart(datamart) {
    const {
      organisationId,
      history,
      datamartId
    } = this.props;

    history.push(`/o${organisationId}d${datamartId}/settings/datamarts/edit/${datamart.id}`);
  }

  handleFilterChange(newFilter) {
    const {
      organisationId
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchDatamarts(organisationId, newFilter);
  }

  /**
   * Data
   */

  fetchDatamarts(organisationId, filter) {
    const buildGetDatamartsOptions = () => {
      const options = {
        allow_administrator: true,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
      };

      if (filter.id) { options.id = filter.id; }
      return options;
    };

    DatamartService.getDatamarts(organisationId, buildGetDatamartsOptions()).then(response => {
      this.setState({
        isFetchingDatamarts: false,
        noDatamartYet: response && response.count === 0 && !filter.id,
        datamarts: response.data,
        totalDatamarts: response.count
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
      filter
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

DatamartsListPage.defaultProps = {
  notifyError: () => {}
};

DatamartsListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  datamartId: PropTypes.number.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: notifyActions.notifyError }
  )
)(DatamartsListPage);

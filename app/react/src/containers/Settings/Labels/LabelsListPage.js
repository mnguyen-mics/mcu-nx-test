import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button, Modal } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withMcsRouter } from '../../Helpers';
import { ReactRouterPropTypes } from '../../../validators/proptypes';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import LabelsService from '../../../services/LabelsService';
import * as notifyActions from '../../../state/Notifications/actions';

import settingsMessages from '../messages';
import messages from './messages';

import LabelsTable from './LabelsTable';

class LabelsListPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      labels: [],
      totalLabels: 0,
      isFetchingLabels: true,
      modalVisible: false,
      hasLabels: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
      },
    };
  }

  componentDidMount() {
    const {
      organisationId,
    } = this.props;

    this.fetchLabels(organisationId, this.state.filter);
  }

  /**
   * Interaction
   */

  handleEditLabels = (datamart) => {
    const {
      organisationId,
      history,
      datamartId,
    } = this.props;

    history.push(`/o${organisationId}d${datamartId}/settings/datamarts/edit/${datamart.id}`);
  }

  /**
   * Data
   */

  fetchLabels = (organisationId, filter) => {
    const buildGetLabelsOptions = () => {
      return {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
    };

    LabelsService.getLabels(organisationId, buildGetLabelsOptions()).then(response => {
      this.setState({
        isFetchingLabels: false,
        hasLabels: response && response.count === 0,
        labels: response.data,
        totalLabels: response.count,
      });
    }).catch(error => {
      this.setState({ isFetchingLabels: false });
      this.props.notifyError(error);
    });
  }

  buildNewActionElement = () => {
    return (
      <Button type="primary" htmlType="submit" onClick={() => this.setState({ modalVisible: true })}>
        <FormattedMessage {...messages.newLabel} />
      </Button>
    );
  }

  handleOk = () => {
    this.setState({ modalVisible: false });
  }

  handleCancel = () => {
    this.setState({ modalVisible: false });
  }

  render() {
    const {
      isFetchingLabels,
      totalLabels,
      labels,
      hasLabels,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement();
    const buttons = [newButton];

    return (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title"><FormattedMessage {...settingsMessages.labels} /></span>
          <span className="mcs-card-button">{buttons}</span>
        </div>
        <hr className="mcs-separator" />
        <LabelsTable
          dataSource={labels}
          totalLabels={totalLabels}
          isFetchingLabels={isFetchingLabels}
          noDatamartYet={hasLabels}
          filter={filter}
          onFilterChange={this.handleFilterChange}
          onEditDatamart={this.handleEditLabels}
        />
        <Modal
          title="Basic Modal"
          visible={this.state.modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </div>
    );
  }
}

LabelsListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  datamartId: PropTypes.number.isRequired,
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
)(LabelsListPage);

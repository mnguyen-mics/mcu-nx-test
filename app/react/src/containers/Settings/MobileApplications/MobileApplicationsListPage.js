import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { withMcsRouter } from '../../Helpers';
import { ReactRouterPropTypes } from '../../../validators/proptypes';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import MobileApplicationService from '../../../services/MobileApplicationService';
import * as notifyActions from '../../../state/Notifications/actions';

import MobileApplicationsTable from './MobileApplicationsTable';

const messages = defineMessages({
  confirmArchiveModalTitle: {
    id: 'mobile_application.archive.confirm_modal.title',
    defaultMessage: 'Are you sure you want to archive this Mobile Application?'
  },
  confirmArchiveModalContent: {
    id: 'mobile_application.archive.confirm_modal.content',
    defaultMessage: 'Archiving mobile application'
  },
  confirmArchiveModalOk: {
    id: 'mobile_application.archive.confirm_modal.ok',
    defaultMessage: 'Archive now'
  },
  confirmArchiveModalCancel: {
    id: 'mobile_application.archive.confirm_modal.cancel',
    defaultMessage: 'Cancel'
  }
});

class MobileApplicationsListPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mobileApplications: [],
      totalMobileApplications: 0,
      isFetchingMobileApplications: true,
      noMobileApplicationYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        name: ''
      }
    };
    this.handleArchiveMobileApplication = this.handleArchiveMobileApplication.bind(this);
    this.handleEditMobileApplication = this.handleEditMobileApplication.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    const {
      organisationId,
      datamartId
    } = this.props;

    this.fetchMobileApplications(organisationId, datamartId, this.state.filter);
  }

  /**
   * Interaction
   */

  handleArchiveMobileApplication(mobileApplication) {
    const { organisationId, location: { search }, intl: { formatMessage } } = this.props;

    Modal.confirm({
      title: <FormattedMessage {...messages.confirmArchiveModalTitle} />,
      content: <FormattedMessage {...messages.confirmArchiveModalContent} />,
      iconType: 'exclamation-circle',
      okText: formatMessage(messages.confirmArchiveModalOk),
      cancelText: formatMessage(messages.confirmArchiveModalCancel),
      onOk() {},
      onCancel() {},
    });
  }

  handleEditMobileApplication(mobileApplication) {
    const {
      organisationId,
      history,
      datamartId
    } = this.props;

    history.push(`/o${organisationId}d${datamartId}/settings/mobile_applications/edit/${mobileApplication.id}`);
  }

  handleFilterChange(newFilter) {
    const {
      organisationId,
      datamartId
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchMobileApplications(organisationId, datamartId, newFilter);
  }

  /**
   * Data
   */

  fetchMobileApplications(organisationId, datamartId, filter) {
    const buildGetMobileApplicationsOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
      };

      if (filter.name) { options.name = filter.name; }
      return options;
    };

    MobileApplicationService.getMobileApplications(organisationId, datamartId, buildGetMobileApplicationsOptions()).then(response => {
      this.setState({
        isFetchingMobileApplications: false,
        noMobileApplicationYet: response && response.count === 0 && !filter.name,
        mobileApplications: response.data,
        totalMobileApplications: response.count
      });
    }).catch(error => {
      this.setState({ isFetchingMobileApplications: false });
      this.props.notifyError(error);
    });
  }

  static buildNewActionElement(organisationId, datamartId) {
    return (
      <Link to={`/o${organisationId}d${datamartId}/settings/mobileapplications/new`}>
        <Button key="NEW_MOBILE_APPLICATION" type="primary" htmlType="submit">
          <FormattedMessage id="NEW_MOBILE_APPLICATION" defaultMessage="New Mobile Application" />
        </Button>
      </Link>
    );
  }

  render() {
    const {
      organisationId,
      datamartId
    } = this.props;

    const {
      isFetchingMobileApplications,
      totalMobileApplications,
      mobileApplications,
      noMobileApplicationYet,
      filter
    } = this.state;

    const newButton = MobileApplicationsListPage.buildNewActionElement(organisationId, datamartId);
    const buttons = [newButton];

    return (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title"><FormattedMessage id="MobileApplicationsListPage" defaultMessage="Mobile Applications" /></span>
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

MobileApplicationsListPage.defaultProps = {
  notifyError: () => {}
};

MobileApplicationsListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  datamartId: PropTypes.number.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: notifyActions.notifyError }
  )
)(MobileApplicationsListPage);

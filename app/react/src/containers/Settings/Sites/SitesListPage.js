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
import SiteService from '../../../services/SiteService';
import * as notifyActions from '../../../state/Notifications/actions';

import SitesTable from './SitesTable';

const messages = defineMessages({
  confirmArchiveModalTitle: {
    id: 'site.archive.confirm_modal.title',
    defaultMessage: 'Are you sure you want to archive this Site ?'
  },
  confirmArchiveModalContent: {
    id: 'site.archive.confirm_modal.content',
    defaultMessage: 'Archiving site'
  },
  confirmArchiveModalOk: {
    id: 'site.archive.confirm_modal.ok',
    defaultMessage: 'Archive now'
  },
  confirmArchiveModalCancel: {
    id: 'site.archive.confirm_modal.cancel',
    defaultMessage: 'Cancel'
  }
});

class SitesListPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sites: [],
      totalSites: 0,
      isFetchingSites: true,
      noSiteYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        name: ''
      }
    };
    this.handleArchiveSite = this.handleArchiveSite.bind(this);
    this.handleEditSite = this.handleEditSite.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    const {
      organisationId,
      datamartId
    } = this.props;

    this.fetchSites(organisationId, datamartId, this.state.filter);
  }

  /**
   * Interaction
   */

  handleArchiveSite(site) {
    const { organisationId, location: { search }, intl: { formatMessage } } = this.props;

    console.log(organisationId);
    console.log(search);
    console.log(site);

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

  handleEditSite(site) {
    const {
      organisationId,
      history,
      datamartId
    } = this.props;

    history.push(`/o${organisationId}d${datamartId}/settings/sites/edit/${site.id}`);
  }

  handleFilterChange(newFilter) {
    const {
      organisationId,
      datamartId
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchSites(organisationId, datamartId, newFilter);
  }

  /**
   * Data
   */

  fetchSites(organisationId, datamartId, filter) {
    const buildGetSitesOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
      };

      if (filter.name) { options.name = filter.name; }
      return options;
    };

    SiteService.getSites(organisationId, datamartId, buildGetSitesOptions()).then(response => {
      this.setState({
        isFetchingSites: false,
        noSiteYet: response && response.count === 0 && !filter.name,
        sites: response.data,
        totalSites: response.count
      });
    }).catch(error => {
      this.setState({ isFetchingSites: false });
      this.props.notifyError(error);
    });
  }

  static buildNewActionElement(organisationId, datamartId) {
    return (
      <Link to={`/o${organisationId}d${datamartId}/settings/sites/new`}>
        <Button key="NEW_SITE" type="primary" htmlType="submit">
          <FormattedMessage id="NEW_SITE" defaultMessage="New Site" />
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
      isFetchingSites,
      totalSites,
      sites,
      noSiteYet,
      filter
    } = this.state;

    const newButton = SitesListPage.buildNewActionElement(organisationId, datamartId);
    const buttons = [newButton];

    return (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title"><FormattedMessage id="SitesListPage" defaultMessage="Sites" /></span>
          <span className="mcs-card-button">{buttons}</span>
        </div>
        <hr className="mcs-separator" />
        <SitesTable
          dataSource={sites}
          totalSites={totalSites}
          isFetchingSites={isFetchingSites}
          noSiteYet={noSiteYet}
          filter={filter}
          onFilterChange={this.handleFilterChange}
          onArchiveSite={this.handleArchiveSite}
          onEditSite={this.handleEditSite}
        />
      </div>
    );
  }
}

SitesListPage.defaultProps = {
  notifyError: () => {}
};

SitesListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  datamartId: PropTypes.number.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: notifyActions.notifyError }
  )
)(SitesListPage);

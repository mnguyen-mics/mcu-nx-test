import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Sidebar } from '../Sidebar';
import { McsIcons } from '../../components/McsIcons';

class AudienceSidebar extends Component {

  render() {

    const {
      activeWorkspace: {
        workspaceId,
        organisationId,
        datamartId,
      },
      location: {
        pathname
      }
    } = this.props;

    const isActiveUrl = path => pathname.search(path) >= 0; // eslint-disable-line no-unused-vars

    const segmentsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/segments`; // eslint-disable-line no-undef
    // const partitionsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/partitions`; // eslint-disable-line no-undef
    // const queriesUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/queries`; // eslint-disable-line no-undef
    // const monitoringUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/monitoring`; // eslint-disable-line no-undef

    const items = [
      {
        element: <Link to={segmentsUrl}><McsIcons type="users" className="icon-sidebar" /> <FormattedMessage id="AUDIENCE_SEGMENTS" /></Link>,
        isActive: isActiveUrl('segments')
      },
      {
        element: <Link to={`${workspaceId}/datamart/partitions`}><McsIcons type="partitions" className="icon-sidebar" /> <FormattedMessage id="AUDIENCE_PARTITIONS" /></Link>,
        isActive: isActiveUrl('partitions')
      },
      {
        element: <Link to={`${workspaceId}/datamart/queries`}><McsIcons type="query" className="icon-sidebar" /> <FormattedMessage id="QUERY_TOOL" /></Link>,
        isActive: isActiveUrl('email')
      },
      {
        element: <Link to={`${workspaceId}/datamart/monitoring`}><McsIcons type="user" className="icon-sidebar" /> <FormattedMessage id="MONITORING" /></Link>,
        isActive: isActiveUrl('monitoring')
      }
    ];

    return <Sidebar items={items}>{this.props.children}</Sidebar>;
  }

}

AudienceSidebar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  activeWorkspace: state.sessionState.activeWorkspace,
});

const mapDispatchToProps = {};

AudienceSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudienceSidebar);

export default AudienceSidebar;

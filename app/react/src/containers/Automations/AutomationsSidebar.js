import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Sidebar } from '../Sidebar';

class AutomationsSidebar extends Component {

  render() {

    const {
      activeWorkspace: {
        organisationId,
        datamartId,
      },
      location: {
        pathname
      }
    } = this.props;

    const isActiveUrl = path => pathname.search(path) >= 0; // eslint-disable-line no-unused-vars

    const segmentsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/automations/list`; // eslint-disable-line no-undef
    // const partitionsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/partitions`; // eslint-disable-line no-undef
    // const queriesUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/queries`; // eslint-disable-line no-undef
    // const monitoringUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/audience/monitoring`; // eslint-disable-line no-undef

    const items = [
      {
        element: <Link to={segmentsUrl}><FormattedMessage id="AUTOMATIONS_LIST" /></Link>,
        isActive: isActiveUrl('list')
      }
    ];

    return <Sidebar items={items}>{this.props.children}</Sidebar>;
  }

}

AutomationsSidebar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  activeWorkspace: state.sessionState.activeWorkspace,
});

const mapDispatchToProps = {};

AutomationsSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(AutomationsSidebar);

export default AutomationsSidebar;

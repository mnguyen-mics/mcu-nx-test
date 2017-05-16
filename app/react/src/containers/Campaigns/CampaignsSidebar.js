import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Sidebar } from '../Sidebar';

class CampaignsSidebar extends Component {

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

    const displayCampaignUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/campaigns/display`; // eslint-disable-line no-undef
    const emailCampaignUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/campaigns/email`; // eslint-disable-line no-undef
    const goalsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/campaigns/goal`; // eslint-disable-line no-undef

    const items = [
      {
        element: <Link to={displayCampaignUrl}><FormattedMessage id="DISPLAY_CAMPAIGNS" /></Link>,
        isActive: isActiveUrl('display')
      },
      {
        element: <Link to={emailCampaignUrl}><FormattedMessage id="EMAIL_CAMPAIGNS" /></Link>,
        isActive: isActiveUrl('email')
      },
      {
        element: <Link to={goalsUrl}><FormattedMessage id="GOALS" /></Link>,
        isActive: isActiveUrl('goal')
      }
    ];

    return <Sidebar items={items}>{this.props.children}</Sidebar>;
  }

}

CampaignsSidebar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  activeWorkspace: state.sessionState.activeWorkspace,
});

const mapDispatchToProps = {};

CampaignsSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsSidebar);

export default CampaignsSidebar;

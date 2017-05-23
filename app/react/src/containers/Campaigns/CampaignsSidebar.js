import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Sidebar } from '../Sidebar';
import { Icons } from '../../components/Icons';

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
        element: <Link to={displayCampaignUrl}><Icons type="display" className="icon-sidebar" /> <FormattedMessage id="DISPLAY_CAMPAIGNS" /></Link>,
        isActive: isActiveUrl('display')
      },
      {
        element: <Link to={emailCampaignUrl}><Icons type="email" className="icon-sidebar" /> <FormattedMessage id="EMAIL_CAMPAIGNS" /></Link>,
        isActive: isActiveUrl('email')
      },
      {
<<<<<<< HEAD
        element: <Link to={`${workspaceId}/library/scenarios`}><Icons type="automation" className="icon-sidebar" /> <FormattedMessage id="SCENARIOS" /></Link>,
        isActive: isActiveUrl('scenarios')
      },
      {
        element: <Link to={goalsUrl}><Icons type="goals-rounded" className="icon-sidebar" /> <FormattedMessage id="GOALS" /></Link>,
=======
        element: <Link to={goalsUrl}><FormattedMessage id="GOALS" /></Link>,
>>>>>>> 8a5652d09517ade30cfaa8fba04fe7ba33461cb6
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

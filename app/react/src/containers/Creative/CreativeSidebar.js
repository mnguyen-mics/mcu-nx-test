import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Sidebar } from '../Sidebar';

class CreativeSidebar extends Component {

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

    const displayUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/creatives/display`; // eslint-disable-line no-undef
    const emailUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/creatives/emails`; // eslint-disable-line no-undef

    const items = [
      {
        element: <Link to={displayUrl}><FormattedMessage id="DISPLAY_ADS" /></Link>,
        isActive: isActiveUrl('display')
      },
      {
        element: <Link to={emailUrl}><FormattedMessage id="EMAILS_TEMPLATES" /></Link>,
        isActive: isActiveUrl('emails')
      }
    ];

    return <Sidebar items={items}>{this.props.children}</Sidebar>;
  }

}

CreativeSidebar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  activeWorkspace: state.sessionState.activeWorkspace,
});

const mapDispatchToProps = {};

CreativeSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreativeSidebar);

export default CreativeSidebar;

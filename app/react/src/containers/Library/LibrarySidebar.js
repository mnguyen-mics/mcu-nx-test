import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Sidebar } from '../Sidebar';

class LibrarySidebar extends Component {

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

    const placementsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/placements`; // eslint-disable-line no-undef
    const keywordsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/keywords`; // eslint-disable-line no-undef
    const bidOptimizerUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/bidoptimizer`; // eslint-disable-line no-undef
    const attributionModelUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/attributionmodel`; // eslint-disable-line no-undef
    const visitAnalyzerUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/visitanalyzer`; // eslint-disable-line no-undef
    const catalogUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/catalog`; // eslint-disable-line no-undef
    const adLayoutUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/adlayouts`; // eslint-disable-line no-undef
    const styleSheetsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/stylesheets`; // eslint-disable-line no-undef
    const assetsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/assets`; // eslint-disable-line no-undef
    const exportsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/exports`; // eslint-disable-line no-undef

    const items = [
      {
        element: <Link to={placementsUrl}><FormattedMessage id="PLACEMENT_LIST" /></Link>,
        isActive: isActiveUrl('placements')
      },
      {
        element: <Link to={keywordsUrl}><FormattedMessage id="KEYWORD_LIST" /></Link>,
        isActive: isActiveUrl('keywords')
      },
      {
        element: <Link to={bidOptimizerUrl}><FormattedMessage id="BID_OPTIMIZER" /></Link>,
        isActive: isActiveUrl('bidoptimizer')
      },
      {
        element: <Link to={attributionModelUrl}><FormattedMessage id="ATTRIBUTION_MODEL" /></Link>,
        isActive: isActiveUrl('attributionmodel')
      },
      {
        element: <Link to={visitAnalyzerUrl}><FormattedMessage id="VISIT_ANALYZER" /></Link>,
        isActive: isActiveUrl('visitanalyzer')
      },
      {
        element: <Link to={catalogUrl}><FormattedMessage id="CATALOG" /></Link>,
        isActive: isActiveUrl('catalog')
      },
      {
        element: <Link to={catalogUrl}><FormattedMessage id="AD_LAYOUTS" /></Link>,
        isActive: isActiveUrl('adlayouts')
      },
      {
        element: <Link to={adLayoutUrl}><FormattedMessage id="STYLESHEETS" /></Link>,
        isActive: isActiveUrl('stylesheets')
      },
      {
        element: <Link to={styleSheetsUrl}><FormattedMessage id="ASSETS" /></Link>,
        isActive: isActiveUrl('assets')
      },
      {
        element: <Link to={exportsUrl}><FormattedMessage id="EXPORTS" /></Link>,
        isActive: isActiveUrl('exports')
      }
    ];

    return <Sidebar items={items}>{this.props.children}</Sidebar>;
  }

}

LibrarySidebar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  activeWorkspace: state.sessionState.activeWorkspace,
});

const mapDispatchToProps = {};

LibrarySidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(LibrarySidebar);

export default LibrarySidebar;

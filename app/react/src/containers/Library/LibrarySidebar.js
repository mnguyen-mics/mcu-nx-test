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
    const bidOptimizerUrl = `/${workspaceId}/library/bidOptimizers`; // eslint-disable-line no-undef
    const attributionModelUrl = `/${workspaceId}/library/attributionmodels`; // eslint-disable-line no-undef
    const visitAnalyzerUrl = `/${workspaceId}/library/visitanalysers`; // eslint-disable-line no-undef
    const catalogUrl = `/${workspaceId}/datamart/categories/`; // eslint-disable-line no-undef
    const adLayoutUrl = `/${workspaceId}/library/adlayouts`; // eslint-disable-line no-undef
    const styleSheetsUrl = `/${workspaceId}/library/stylesheets`; // eslint-disable-line no-undef
    const assetsUrl = `${PUBLIC_URL}/o/${organisationId}${datamartId ? `/d/${datamartId}` : ''}/library/assets`; // eslint-disable-line no-undef
    const exportsUrl = `/${workspaceId}/library/exports`; // eslint-disable-line no-undef

    const itemsTop = [
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
    ];

    const itemsBottom = [
      {
        element: <Link to={adLayoutUrl}><FormattedMessage id="AD_LAYOUTS" /></Link>,
        isActive: isActiveUrl('adlayouts')
      },
      {
        element: <Link to={styleSheetsUrl}><FormattedMessage id="STYLESHEETS" /></Link>,
        isActive: isActiveUrl('stylesheets')
      },
      {
        element: <Link to={assetsUrl}><FormattedMessage id="ASSETS" /></Link>,
        isActive: isActiveUrl('assets')
      },
      {
        element: <Link to={exportsUrl}><FormattedMessage id="EXPORTS" /></Link>,
        isActive: isActiveUrl('exports')
      }
    ];

    const itemsDataMart = [
      {
        element: <Link to={catalogUrl}><FormattedMessage id="CATALOG" /></Link>,
        isActive: isActiveUrl('catalog')
      }
    ];

    const items = datamartId ? itemsTop.concat(itemsDataMart).concat(itemsBottom) : itemsTop.concat(itemsBottom);

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

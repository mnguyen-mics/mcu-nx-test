import React from 'react';
import PropTypes from 'prop-types';

import {
  MainLayout,
  EditLayout,
} from './index.ts';

import log from '../../utils/Logger';

function LayoutManager({
  layout,
  contentComponent,
  editComponent,
  actionBarComponent,
  organisationSelector,
  showOrgSelector,
}) {

  log.trace(`Render ${layout} layout with component`, contentComponent);

  switch (layout) {
    case 'main':
      return (
        <MainLayout
          contentComponent={contentComponent}
          actionBarComponent={actionBarComponent}
          organisationSelector={organisationSelector}
          showOrgSelector={showOrgSelector}
        />
      );

    case 'edit':
      return <EditLayout editComponent={editComponent} />;

    default: {
      const errMsg = `Unhandled layout ${layout}`;
      log.error(errMsg);
      throw new Error(errMsg);
    }
  }
}

LayoutManager.defaultProps = {
  contentComponent: () => <div>no content</div>,
  editComponent: () => <div>no edit</div>,
  organisationSelector: () => <div>no org selector</div>,
  showOrgSelector: false,
  actionBarComponent: null,
};

LayoutManager.propTypes = {
  layout: PropTypes.string.isRequired,
  contentComponent: PropTypes.func,
  editComponent: PropTypes.func,
  actionBarComponent: PropTypes.func,
  organisationSelector: PropTypes.func,
  showOrgSelector: PropTypes.bool,
};

export default LayoutManager;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  MainLayout,
  EditLayout
} from './';

import log from '../../utils/Logger';

class LayoutManager extends Component {

  render() {
    const {
      layout,
      contentComponent,
      editComponent,
      actionBarComponent
    } = this.props;

    log.trace(`Render ${layout} layout with component`, contentComponent);

    switch (layout) {
      case 'main':
        return (<MainLayout contentComponent={contentComponent} actionBarComponent={actionBarComponent} />);
      case 'edit':
        return (<EditLayout editComponent={editComponent} />);
      default: {
        const errMsg = `Unhandled layout ${layout}`;
        log.error(errMsg);
        throw new Error(errMsg);
      }
    }
  }
}

LayoutManager.defaultProps = {
  contentComponent: () => <div>no content</div>,
  editComponent: () => <div>no edit</div>,
  actionBarComponent: null
};

LayoutManager.propTypes = {
  layout: PropTypes.string.isRequired,
  contentComponent: PropTypes.func,
  editComponent: PropTypes.func,
  actionBarComponent: PropTypes.func
};

export default LayoutManager;

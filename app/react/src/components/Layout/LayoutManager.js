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
      actionBarComponent
    } = this.props;

    log.debug(`Render ${layout} layout with component`, contentComponent);

    switch (layout) {
      case 'main':
        return (<MainLayout contentComponent={contentComponent} actionBarComponent={actionBarComponent} />);
      case 'edit':
        return (<EditLayout contentComponent={contentComponent} />);
      default:
        throw new Error(`Unhandled layout ${layout}`);
    }
  }
}

LayoutManager.propTypes = {
  layout: PropTypes.string.isRequired,
  contentComponent: PropTypes.func.isRequired,
  actionBarComponent: PropTypes.func.isRequired
};

export default LayoutManager;

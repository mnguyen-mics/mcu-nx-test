import React, { Component } from 'react';
import lodash from 'lodash';
import { Layout } from 'antd';

import DrawerManager from './DrawerManager';

const DEFAULT_DRAWER_OPTIONS = {
  additionalProps: {},
  isModal: false,
  size: 'large',
};

const withDrawer = WrappedComponent => {
  return class extends Component {

    constructor(props) {
      super(props);

      this.state = {
        /* drawableContents shape :
         * { component // rendered component,
         *   additionalProps // props passed to component
         *   size // 'large' or 'small',
         *   isModal // true or false, whether the drawer is binded to clickOutside and Espace key
         * }
         */
        drawableContents: [],
      };
    }

    handleOpenNewDrawer = (component, options = DEFAULT_DRAWER_OPTIONS) => {
      const extendedOptions = {
        ...DEFAULT_DRAWER_OPTIONS,
        ...options,
        openNextDrawer: this.handleOpenNewDrawer,
        closeNextDrawer: this.closeForegroundDrawer,
      };

      this.setState({
        drawableContents: [
          ...this.state.drawableContents,
          { component, ...extendedOptions },
        ],
      });
    }

    closeForegroundDrawer = () => {
      this.setState({
        drawableContents: [...lodash.initial(this.state.drawableContents)],
      });
    }

    closeForegroundDrawerIfPossible = () => {
      const { drawableContents } = this.state;
      const foregroundDrawer = lodash.last(drawableContents);

      if (!foregroundDrawer.isModal) {
        this.closeForegroundDrawer();
      }
    }

    render() {
      return (
        <Layout>
          <DrawerManager
            drawableContents={this.state.drawableContents}
            onEscapeKeyDown={this.closeForegroundDrawerIfPossible}
            onClickOnBackground={this.closeForegroundDrawerIfPossible}
          />

          <WrappedComponent
            {...this.props}
            openNextDrawer={this.handleOpenNewDrawer}
            closeNextDrawer={this.closeForegroundDrawer}
          />
        </Layout>
      );
    }
  };
};

export default withDrawer;

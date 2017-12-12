import * as React from 'react';
import lodash from 'lodash';
import { Layout } from 'antd';

import DrawerManager from './DrawerManager';

const DEFAULT_DRAWER_OPTIONS: DrawableContentOptions = {
  additionalProps: {},
  isModal: false,
  size: 'large',
};

export type DrawerSize = 'large' | 'small';

export interface DrawableContentOptions<T = {}> {
  additionalProps: T;
  size?: DrawerSize;
  isModal?: boolean;
}

export interface DrawableContentProps {
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  closeNextDrawer: () => void;
}

export interface DrawableContent extends DrawableContentProps, DrawableContentOptions {
  component: React.ComponentClass<DrawableContentProps>;
}

export interface ComponentWithDrawerState {
  drawableContents: DrawableContent[];
}

export default function withDrawer<T extends {}>(
  WrappedComponent: React.ComponentClass<T & DrawableContentProps>,
): React.ComponentClass<T & DrawableContentProps> {
  class ComponentWithDrawer extends React.Component<T & DrawableContentProps, ComponentWithDrawerState> {

    constructor(props: T & DrawableContentProps) {
      super(props);
      this.state = {
        drawableContents: [],
      };
    }

    handleOpenNewDrawer = (component: React.ComponentClass<DrawableContentProps>, options: DrawableContentOptions) => {
      const extendedOptions: any = {
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

      if (foregroundDrawer && !foregroundDrawer.isModal) {
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
  }

  return ComponentWithDrawer;
}

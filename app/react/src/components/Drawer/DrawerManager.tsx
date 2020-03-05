/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import lodash from 'lodash';
import { injectDrawer, DrawableContent, DrawerSize } from './index';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { DrawerStore } from './DrawerStore';
import { InjectedDrawerProps } from './injectDrawer';

const viewportDrawerRatio = {
  large: 0.85,
  small: 0.4,
};

export interface DrawerManagerProps extends InjectedDrawerProps {
  drawableContents: DrawableContent[];
}

export interface DrawerManagerState {
  drawerMaxWidth: number;
  viewportWidth: number;
}

class DrawerManager extends React.Component<
  DrawerManagerProps,
  DrawerManagerState
> {
  drawerDiv: HTMLDivElement | null;

  constructor(props: DrawerManagerProps) {
    super(props);
    this.state = {
      drawerMaxWidth: this.getDimensions('large'),
      viewportWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentDidUpdate(previousProps: DrawerManagerProps) {
    const prevContents = previousProps.drawableContents;
    const contents = this.props.drawableContents;

    if (prevContents.length !== contents.length) {
      this.updateDimensions(contents);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  getDimensions = (size: DrawerSize) =>
    window.innerWidth * viewportDrawerRatio[size];

  getDrawerStyle(xPos: number, size: DrawerSize = 'large') {
    return {
      transform: `translate(${xPos}px, 0px)`,
      maxWidth: `${window.innerWidth * viewportDrawerRatio[size]}px`,
    };
  }

  getForegroundContentSize = (
    drawableContents: DrawableContent[],
  ): DrawerSize => {
    const foregroundContent =
      drawableContents.length > 0 &&
      drawableContents[drawableContents.length - 1];
    return foregroundContent && foregroundContent.size
      ? foregroundContent.size
      : 'large';
  };

  canProgramaticallyCloseDrawer = () => {
    const { drawableContents } = this.props;
    const last = lodash.last(drawableContents);
    return last ? !last.isModal : true;
  };

  handleOnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && this.canProgramaticallyCloseDrawer()) {
      this.props.closeNextDrawer();
    }
  };

  updateDimensions = (drawableContents: DrawableContent[]) => {
    const foregroundContentSize = this.getForegroundContentSize(
      drawableContents,
    );

    const drawerMaxWidth = this.getDimensions(foregroundContentSize);

    if (this.state.drawerMaxWidth !== drawerMaxWidth || this.state.viewportWidth !== window.innerWidth) {
      this.setState({
        drawerMaxWidth: this.getDimensions(foregroundContentSize),
        viewportWidth: window.innerWidth,
      });
    }

    // TODO focus blur issue with GoalForm
    if (this.drawerDiv) {
      this.drawerDiv.focus();
    }
  };

  handleClickOnBackground = () => {
    if (this.canProgramaticallyCloseDrawer()) {
      this.props.closeNextDrawer();
    }
  };


  generateDrawer(drawersWithOverlay: React.ReactNode[]) {
    return drawersWithOverlay.map((drawer: JSX.Element, i: number) => {
     return  React.cloneElement(drawer, { key:  i })
    });
  }


  render() {
    const { drawableContents } = this.props;
    const { drawerMaxWidth, viewportWidth } = this.state;
    const foregroundContentSize = this.getForegroundContentSize(
      drawableContents,
    );

    const drawerStyles = {
      ready: this.getDrawerStyle(viewportWidth),
      foreground: this.getDrawerStyle(
        viewportWidth - drawerMaxWidth,
        foregroundContentSize,
      ),
      background: this.getDrawerStyle(0),
    };
    // TODO fix react unique key issue
    const drawersWithOverlay: JSX.Element[] = [];

    drawableContents.forEach(
      (
        { component: WrappedComponent, additionalProps, size, ...others },
        index,
      ) => {
        // can be undefined when booting from store
        if (WrappedComponent) {
          const lastElement = index === drawableContents.length - 1;
          const displayInForeground = lastElement;
  
          drawersWithOverlay.push(
            <div
              className={'drawer-overlay'}
              onClick={this.handleClickOnBackground}
            />,
          );
  
          drawersWithOverlay.push(
            <div
              ref={div => {
                this.drawerDiv = div;
              }}
              tabIndex={0}
              className={'drawer'}
              style={
                displayInForeground
                  ? drawerStyles.foreground
                  : drawerStyles.background
              }
            >
              <WrappedComponent {...additionalProps} {...others} />
            </div>,
          );
        }
      },
    );

    drawersWithOverlay.push(<div className="drawer-overlay"  />);
    drawersWithOverlay.push(
      <div className="drawer" style={drawerStyles.ready} />,
    );

    return (
      <div onKeyDown={this.handleOnKeyDown} className="drawer-container">
        {this.generateDrawer(drawersWithOverlay)}
      </div>
    );
  }
}

const mapStatetoProps = (state: DrawerStore) => ({
  drawableContents: state.drawableContents,
});

export default compose<DrawerManagerProps, {}>(
  connect(mapStatetoProps),
  injectDrawer,
)(DrawerManager);

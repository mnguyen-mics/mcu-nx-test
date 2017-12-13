/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import { DrawableContent, DrawerSize } from './index';

const viewportDrawerRatio = {
  large: 0.85,
  small: 0.4,
};

export interface DrawerManagerProps {
  drawableContents: DrawableContent[];
  onEscapeKeyDown: () => void;
  onClickOnBackground: () => void;
}

export interface DrawerManagerState {
  drawerMaxWidth: number;
  viewportWidth: number;
}

class DrawerManager extends React.Component<DrawerManagerProps, DrawerManagerState> {

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

  componentWillReceiveProps(nextProps: DrawerManagerProps) {
    const prevContents = this.props.drawableContents;
    const nextContents = nextProps.drawableContents;

    if (prevContents.length !== nextContents.length) {
      this.updateDimensions(nextContents);
    }
  }

  componentDidUpdate() {
    // TODO focus blur issue with GoalForm
    // if (this.drawerDiv) {
    //   this.drawerDiv.focus();
    // }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  getDimensions = (size: DrawerSize) => window.innerWidth * viewportDrawerRatio[size];

  getDrawerStyle(xPos: number, size: DrawerSize = 'large') {
    return {
      transform: `translate(${xPos}px, 0px)`,
      maxWidth: `${window.innerWidth * viewportDrawerRatio[size]}px`,
    };
  }

  getForegroundContentSize = (drawableContents: DrawableContent[]): DrawerSize => {
    const foregroundContent = drawableContents.length > 0 && drawableContents[drawableContents.length - 1];
    return (foregroundContent && foregroundContent.size
      ? foregroundContent.size
      : 'large'
    );
  }

  handleOnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      this.props.onEscapeKeyDown();
    }
  }

  updateDimensions = (nextDrawableContents: DrawableContent[]) => {
    const drawableContents = (nextDrawableContents.length
      ? nextDrawableContents
      : this.props.drawableContents
    );
    const foregroundContentSize = this.getForegroundContentSize(drawableContents);

    this.setState({
      drawerMaxWidth: this.getDimensions(foregroundContentSize),
      viewportWidth: window.innerWidth,
    });
  }

  render() {
    const { drawableContents, onClickOnBackground } = this.props;
    const { drawerMaxWidth, viewportWidth } = this.state;
    const foregroundContentSize = this.getForegroundContentSize(drawableContents);

    const drawerStyles = {
      ready: this.getDrawerStyle(viewportWidth),
      foreground: this.getDrawerStyle(viewportWidth - drawerMaxWidth, foregroundContentSize),
      background: this.getDrawerStyle(0),
    };

    // TODO fix react unique key issue
    const drawersWithOverlay: JSX.Element[] = [];

    drawableContents.forEach((
      { component: WrappedComponent,
        additionalProps,
        size,
        ...others },
      index) => {
      const lastElement = index === drawableContents.length - 1;
      const displayInForeground = lastElement;

      drawersWithOverlay.push(
        <div
          className={'drawer-overlay'}
          onClick={onClickOnBackground}
        />,
      );

      drawersWithOverlay.push(
        <div
          ref={div => {
            this.drawerDiv = div;
          }}
          tabIndex={0}
          className={'drawer'}
          style={displayInForeground
            ? drawerStyles.foreground
            : drawerStyles.background
          }
        >
          <WrappedComponent {...additionalProps} {...others} />
        </div>,
      );
    });

    drawersWithOverlay.push(<div className="drawer-overlay" />);
    drawersWithOverlay.push(<div className="drawer" style={drawerStyles.ready} />);

    return (
      <div onKeyDown={this.handleOnKeyDown} className="drawer-container">
        {drawersWithOverlay.map(drawer => drawer)}
      </div>
    );
  }
}

export default DrawerManager;

/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const viewportDrawerRatio = {
  large: 0.85,
  small: 0.4,
};

class DrawerManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      drawerMaxWidth: this.getDimensions('large'),
      viewportWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillReceiveProps(nextProps) {
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

  getDimensions = (size) => window.innerWidth * viewportDrawerRatio[size]

  getDrawerStyle(xPos, size = 'large') {
    return {
      transform: `translate(${xPos}px, 0px)`,
      maxWidth: `${window.innerWidth * viewportDrawerRatio[size]}px`,
    };
  }

  getForegroundContentSize = (drawableContents) => {
    return (drawableContents && drawableContents.length
      ? drawableContents[drawableContents.length - 1].size
      : 'large'
    );
  }

  handleOnKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.props.onEscapeKeyDown();
    }
  }

  updateDimensions = (nextDrawableContents) => {
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
    const drawersWithOverlay = [];

    drawableContents.forEach(({
      component: WrappedComponent,
      additionalProps,
      size,
      ...others
    }, index) => {
      const lastElement = index === drawableContents.length - 1;
      const displayInForeground = lastElement;

      drawersWithOverlay.push(
        <div
          className={'drawer-overlay'}
          onClick={onClickOnBackground}
        />
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
        </div>
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

DrawerManager.defaultProps = {
  drawableContents: [],
};

DrawerManager.propTypes = {
  drawableContents: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.func.isRequired,
      additionalProps: PropTypes.object,
      size: PropTypes.string.isRequired,
      openNextDrawer: PropTypes.func,
      closeNextDrawer: PropTypes.func,
    }),
  ),

  onEscapeKeyDown: PropTypes.func.isRequired,
  onClickOnBackground: PropTypes.func.isRequired,
};

export default DrawerManager;

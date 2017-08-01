/* eslint-disable no-undef,jsx-a11y/no-static-element-interactions,react/no-array-index-key */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const viewportDrawerRatio = 0.75;

class DrawerManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewportWidth: window.innerWidth,
      drawerMaxWidth: window.innerWidth * viewportDrawerRatio
    };
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentDidUpdate() {
    if (this.drawerDiv) {
      this.drawerDiv.focus();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  handleOnKeyDown(event) {
    if (event.key === 'Escape') {
      this.props.onEscapeKeyDown();
    }
  }

  updateDimensions() {
    this.setState({
      viewportWidth: window.innerWidth,
      drawerMaxWidth: window.innerWidth * viewportDrawerRatio
    });
  }

  getDrawerStyle(xPos) {
    return {
      transform: `translate(${xPos}px, 0px)`,
      maxWidth: `${this.state.drawerMaxWidth}px`
    };
  }

  render() {
    const { drawableContents, onClickOnBackground } = this.props;

    const drawerStyles = {
      ready: this.getDrawerStyle(this.state.viewportWidth),
      foreground: this.getDrawerStyle(
        this.state.viewportWidth - this.state.drawerMaxWidth
      ),
      background: this.getDrawerStyle(0)
    };

    const drawersWithOverlay = drawableContents.map(({
      component: WrappedComponent,
      additionalProps,
      size,
      ...others
    }, index) => {
      const lastElement = index === drawableContents.length - 1;
      const displayInForeground = lastElement;
      return (
        <div key={index}>
          <div className={`drawer-overlay ${displayInForeground ? 'foreground' : ''}`} onClick={onClickOnBackground} />
          <div
            ref={div => {
              this.drawerDiv = div;
            }}
            tabIndex={0}
            className={`drawer ${displayInForeground ? 'foreground' : ''}`}
            style={
            displayInForeground
              ? drawerStyles.foreground
              : drawerStyles.background
          }
          >
            <WrappedComponent {...additionalProps} {...others} />
          </div>
        </div>);
    });

    drawersWithOverlay.push(
      <div key={drawableContents.length}>
        <div className="drawer-overlay" />
        <div className="drawer" style={drawerStyles.ready} />
      </div>
    );

    return (
      <div onKeyDown={this.handleOnKeyDown} className="drawer-container">
        {drawersWithOverlay.map(drawer => drawer)}
      </div>
    );
  }
}

DrawerManager.defaultProps = {
  drawableContents: []
};

DrawerManager.propTypes = {
  drawableContents: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.func.isRequired,
      additionalProps: PropTypes.object,
      size: PropTypes.string.isRequired,
      openNextDrawer: PropTypes.func,
      closeNextDrawer: PropTypes.func
    })
  ),
  onEscapeKeyDown: PropTypes.func.isRequired,
  onClickOnBackground: PropTypes.func.isRequired
};

export default DrawerManager;

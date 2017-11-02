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
      viewportWidth: window.innerWidth,
      // drawerMaxWidth: window.innerWidth * viewportDrawerRatio.length,
      drawerMaxWidth: undefined,
    };

    // this.state = {
    //   viewportWidth: window.innerWidth,
    //   drawerMaxWidth: window.innerWidth * viewportDrawerRatio.large,
    // };
  }

  componentDidMount() {
    // this.updateDimensions(); // remove???
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentDidUpdate() {
    // TODO focus blur issue with GoalForm
    // if (this.drawerDiv) {
    //   this.drawerDiv.focus();
    // }
  }

  componentWillReceiveProps(nextProps) {
    const prevSize = this.getDrawerSize(this.props.drawableContents);
    const nextSize = this.getDrawerSize(nextProps.drawableContents);

    if (prevSize !== nextSize) {
      console.log('difference, prevSize = ', prevSize, ' / nextSize = ', nextSize);
      this.updateDimensions(nextSize);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  getDrawerSize = (drawableContents) => {
    return drawableContents && drawableContents.length ? drawableContents[drawableContents.length - 1].size : 'large';
  }

  getDrawerStyle(xPos) {
    return {
      transform: `translate(${xPos}px, 0px)`,
      maxWidth: `${this.state.drawerMaxWidth}px`,
    };
  }

  handleOnKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.props.onEscapeKeyDown();
    }
  }

  updateDimensions(size) {
    const nextSize = size || this.getDrawerSize(this.props.drawableContents);

    this.setState({
      viewportWidth: window.innerWidth,
      drawerMaxWidth: window.innerWidth * viewportDrawerRatio[nextSize],
    });
  }

  render() {
    const { drawableContents, onClickOnBackground } = this.props;

    const drawerStyles = {
      ready: this.getDrawerStyle(this.state.viewportWidth),
      foreground: this.getDrawerStyle(
        this.state.viewportWidth - this.state.drawerMaxWidth,
      ),
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

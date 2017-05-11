import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import BreadcrumbBar from './BreadcrumbBar';

class Editbar extends Component {

  render() {
    const {
      onClickLeftButton,
      onClickCloseButton,
      leftButtonTextId
    } = this.props;

    return (
      <div className="mcs-editbar" >
        <BreadcrumbBar className="mcs-editbar-breadcrumb" />
        <div className="mcs-editbar-buttons">
          <button className="mcs-editbar-save-button" onClick={onClickLeftButton}> <FormattedMessage id={leftButtonTextId} /> </button>
          <button className="mcs-editbar-close-button" onClick={onClickCloseButton}>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>1CE86316-ED46-4B3B-B84B-E7EFF0596C0C</title><path d="M14.123 12.001l9.438-9.438A1.5 1.5 0 1 0 21.44.441L12 9.879 2.562.44A1.5 1.5 0 1 0 .44 2.563l9.438 9.438L.44 21.44a1.5 1.5 0 1 0 2.122 2.122l9.439-9.438 9.438 9.438a1.496 1.496 0 0 0 2.122 0 1.5 1.5 0 0 0 0-2.122L14.123 12z" fillRule="nonzero" fill="#FFF" /></svg>
            </div>
          </button>
        </div>
      </div>
    );
  }


}


Editbar.propTypes = {
  leftButtonTextId: PropTypes.string,
  onClickLeftButton: PropTypes.func,
  onClickCloseButton: PropTypes.func
};

Editbar.defaultProps = {
  leftButtonTextId: 'SAVE',
  onClickLeftButton: () => {},
  onClickCloseButton: () => {}
};
const mapStateToProps = () => ({});

const mapDispatchToProps = {
};

Editbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editbar);

export default Editbar;

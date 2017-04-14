import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import BreadcrumbBar from './BreadcrumbBar';

class Actionbar extends Component {

  constructor(props) {
    super(props);
    this.renderSecondary = this.renderSecondary.bind(this);
  }


  isSecondaryBarContent(elt) {
    return elt.props.secondary;
  }

  render() {
    const {
      secondary,
      children
    } = this.props;

    const secondaryRendering = secondary ? this.renderSecondary() : null;

    return (
      <div className="mcs-actionbar-wrapper" >

        <div className="mcs-actionbar" >
          <BreadcrumbBar className="mcs-actionbar-breadcrumb" />
          <div className="mcs-actionbar-buttons">
            {children.filter(v => !this.isSecondaryBarContent(v))}
          </div>
        </div>
        { secondaryRendering }
      </div>
    );
  }

  renderSecondary() {
    const {
      secondary,
      children
    } = this.props;

    return (
      <div className="mcs-actionbar-secondary" >
        {children.find(c => this.isSecondaryBarContent(c) && c.props.id === secondary)}
      </div>);
  }

}


Actionbar.propTypes = {
  secondary: PropTypes.string // eslint-disable-line react/require-default-props
};

const mapStateToProps = state => ({
  secondary: state.actionbarState.secondary
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Actionbar);

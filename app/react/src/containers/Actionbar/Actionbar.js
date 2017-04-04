import React, { Component, PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { PathPropTypes } from '../../validators';

class Actionbar extends Component {

  constructor(props) {
    super(props);
    this.renderSecondary = this.renderSecondary.bind(this);
  }


  isSecondaryBarContent = elt =>
      elt.type !== 'undefined' &&
      elt.type.name !== 'undefined' &&
      elt.type.name === 'SecondaryActionbar';

  buildBreadcrumbItem(elt) {
    const item = elt.url ? <Link to={elt.url}>{elt.name}</Link> : elt.name;
    return <Breadcrumb.Item>{item}</Breadcrumb.Item>;
  }

  render() {
    const {
      path,
      secondary,
      children
    } = this.props;

    const secondaryRendering = secondary ? this.renderSecondary() : null;

    return (
      <div className="mcs-actionbar-wrapper" >

        <div className="mcs-actionbar" >
          <div className="mcs-actionbar-breadcrumb">
            <Breadcrumb >
              {path.map(this.buildBreadcrumbItem)}
            </Breadcrumb>
          </div>
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
  path: PathPropTypes.isRequired,
  secondary: PropTypes.string // eslint-disable-line react/require-default-props
};

const mapStateToProps = state => ({
  path: state.actionbarState.path,
  secondary: state.actionbarState.secondary
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Actionbar);

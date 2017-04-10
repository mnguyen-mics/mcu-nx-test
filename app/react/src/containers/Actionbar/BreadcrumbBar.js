import React, { Component } from 'react';
import Link from 'react-router/lib/Link';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { PathPropTypes } from '../../validators';


class BreadcrumbBar extends Component {

  render() {
    const {
      path
    } = this.props;

    const buildItem = elt => {
      const item = elt.url ? <Link to={elt.url}>{elt.name}</Link> : elt.name;
      return <Breadcrumb.Item key={elt.name} >{item}</Breadcrumb.Item>;
    };
    const sep = <svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><title>EC88C228-76F7-4171-933A-063605048718</title><path d="M6.748 6.594l-5.28 5.16a.874.874 0 0 1-1.216 0 .827.827 0 0 1 0-1.189L4.924 6 .252 1.435a.827.827 0 0 1 0-1.189.874.874 0 0 1 1.216 0l5.28 5.16a.828.828 0 0 1 0 1.188z" fill="#AEAEAE" /></svg>;
    return (
      <Breadcrumb separator={sep} {...this.props}>
        {path.map(buildItem)}
      </Breadcrumb>);
  }
}


BreadcrumbBar.propTypes = {
  path: PathPropTypes // eslint-disable-line react/require-default-props
};

const mapStateToProps = state => ({
  path: state.actionbarState.path
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BreadcrumbBar);

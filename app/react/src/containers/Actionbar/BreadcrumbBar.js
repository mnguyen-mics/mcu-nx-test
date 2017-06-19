import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { PathPropTypes } from '../../validators/proptypes';
import { McsIcons } from '../../components/McsIcons';


class BreadcrumbBar extends Component {

  render() {
    const {
      path
    } = this.props;

    const buildItem = elt => {
      const item = elt.url ? <Link to={elt.url}>{elt.name}</Link> : elt.name;
      return <Breadcrumb.Item key={elt.name} >{item}</Breadcrumb.Item>;
    };
    const sep = <McsIcons type="chevron-right" />;
    return (
      <Breadcrumb separator={sep} {...this.props}>
        {path.map(buildItem)}
      </Breadcrumb>);
  }
}


BreadcrumbBar.propTypes = {
  path: PathPropTypes // eslint-disable-line react/require-default-props
};

export default BreadcrumbBar;

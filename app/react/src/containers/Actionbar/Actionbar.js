import React from 'react';
import { Row } from 'antd';
import BreadcrumbBar from './BreadcrumbBar';

function Actionbar(props) {

  return (
    <Row type="flex" align="middle" justify="space-between" className="mcs-actionbar">
      <BreadcrumbBar {...props} />
      <div className="left-part-margin">
        {props.children}
      </div>
    </Row>
  );
}

export default Actionbar;

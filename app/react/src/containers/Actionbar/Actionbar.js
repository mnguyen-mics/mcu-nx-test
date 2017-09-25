import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import BreadcrumbBar from './BreadcrumbBar';

function Actionbar(props) {
  return (
    <Row
      type="flex"
      align="middle"
      justify="space-between"
      className={'mcs-actionbar-edit'}
    >
      <BreadcrumbBar {...props} className={'mcs-breadcrumb-edit'} />
      <div className="left-part-margin">
        {props.children}
      </div>
    </Row>
  );
}

Actionbar.defaultProps = {
  edition: false,
};

Actionbar.propTypes = {
  edition: PropTypes.bool,
};

export default Actionbar;

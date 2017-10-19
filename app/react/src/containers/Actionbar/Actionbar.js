import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import BreadcrumbBar from './BreadcrumbBar';

function Actionbar(props) {

  const { edition } = props;

  return (
    <Row
      type="flex"
      align="middle"
      justify="space-between"
      className={edition ? 'mcs-actionbar-edit' : 'mcs-actionbar'}
    >
      <BreadcrumbBar
        {...props}
        className={edition ? 'mcs-breadcrumb-edit' : 'mcs-breadcrumb'}
      />
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

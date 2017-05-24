import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Col } from 'antd';

import { McsIcons } from '../McsIcons';


class EmptyTableView extends Component {

  render() {
    const {
      className,
      icon,
      text
    } = this.props;

    return (
      <Col span={24} className={className}>
        <div className="logo">
          <McsIcons type={icon} />
        </div>
        <FormattedMessage id={text} />
      </Col>);
  }

}

EmptyTableView.defaultProps = {
  icon: 'exclamation',
  className: 'mcs-table-view-empty'
};

EmptyTableView.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  className: PropTypes.string
};


export default EmptyTableView;

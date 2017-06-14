import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Col } from 'antd';

import { McsIcons } from '../McsIcons';


class EmptyTableView extends Component {

  render() {
    const {
      className,
      iconType,
      text
    } = this.props;

    return (
      <Col span={24} className={className}>
        <div className="logo">
          <McsIcons type={iconType} />
        </div>
        <FormattedMessage id={text} />
      </Col>);
  }

}

EmptyTableView.defaultProps = {
  iconType: 'exclamation',
  className: 'mcs-table-view-empty'
};

EmptyTableView.propTypes = {
  text: PropTypes.string.isRequired,
  iconType: PropTypes.string,
  className: PropTypes.string
};


export default EmptyTableView;

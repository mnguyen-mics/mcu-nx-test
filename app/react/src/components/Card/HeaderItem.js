import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'antd';
import { FormattedMessage } from 'react-intl';

import McsIcons from '../McsIcons';

function HeaderItem({ className, data }) {

  return (
    <Col span={6} className={className}>
      <McsIcons type={data.iconType} />
      <div className="title"><FormattedMessage id={data.translationKey} /></div>
      <div className="number">{data.number}</div>
    </Col>
  );
}

HeaderItem.propTypes = {
  className: PropTypes.string.isRequired,

  data: PropTypes.shape({
    iconType: PropTypes.string,
    translationKey: PropTypes.string,
    number: PropTypes.string,
  }).isRequired,
};

export default HeaderItem;

import * as React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import McsIcons from '../McsIcons';

interface HeaderItemProps {
  className: string;
  data: {
    iconType?: string;
    translationKey?: string;
    number?:number;
  };
}

const HeaderItem: React.SFC<HeaderItemProps> = ({className, data}) => {
  return (
    <Col span={6} className={className}>
      <McsIcons type={data.iconType} />
      <div className="title" >
        <FormattedMessage id={data.translationKey} />
      </div>
      <div className="number">{data.number}</div>
    </Col>);
};

export default HeaderItem;

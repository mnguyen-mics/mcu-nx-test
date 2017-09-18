import * as React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import McsIcons from '../McsIcons';

interface HeaderItemProps {
  className: string;
  data?: object;
  iconType?: string;
  translationKey?: string;
  number?:number;
}

const HeaderItem: React.SFC<HeaderItemProps> = props => {
  return (
    <Col span={6} className={props.className}>
    <McsIcons type={props.iconType}/>
    <div className="title"><FormattedMessage id={props.translationKey}/></div>
    <div className="number">{props.number}</div>
  </Col>);
}

export default HeaderItem;

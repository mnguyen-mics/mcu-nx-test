import * as React from 'react';
import { Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import McsIcon, { McsIconType } from '../McsIcon';

export interface HeaderItemDataProp {
  iconType: McsIconType;
  translationKey: string;
  number: number;
}
interface HeaderItemProps {
  className?: string;
  data: HeaderItemDataProp;
}

const HeaderItem: React.SFC<HeaderItemProps> = props => {
  let className = '';
  if (props.className) className = props.className;
  return (
    <Col span={6} className={className}>
      <McsIcon type={props.data.iconType} />
      <div className="title" >
        <FormattedMessage id={props.data.translationKey} />
      </div>
      <div className="number">{props.data.number}</div>
    </Col>);
};

export default HeaderItem;

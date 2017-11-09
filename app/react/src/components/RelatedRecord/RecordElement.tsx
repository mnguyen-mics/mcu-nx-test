import * as React from 'react';
import { Button, Col, Icon, Row } from 'antd';

import McsIcons, { McsIconType } from '../McsIcons';

interface RecordElementProps {
  recordIconType: McsIconType;
  title: string;
  actionButtons?: [{
    iconType: string;
    onClick: React.FormEventHandler<any>;
  }];
}

const RecordElement: React.SFC<RecordElementProps> = ({ recordIconType, title, actionButtons, children }) => {
  return (
    <Row className="related-record">
      <Col span={1}>
        <McsIcons type={recordIconType} />
      </Col>
      <Col span={7}>
        {title}
      </Col>
      <Col span={15}>
        {children}
      </Col>
      <Col span={1}>
        {actionButtons ? actionButtons.map(({ iconType, onClick }) => {
          return (
            <Button key={Math.random()} className="invisible-button" onClick={onClick}>
              <Icon type={iconType} />
            </Button>
          );
        }) : []}
      </Col>
    </Row>
  );
};

export default RecordElement;

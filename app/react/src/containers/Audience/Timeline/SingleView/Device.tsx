import * as React from 'react';
import { Row, Col, Icon } from 'antd';
import { Device, FormFactor } from '../../../../models/timeline/timeline';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

interface Props {
  vectorId: string;
  device?: Device;
}

const Device = (props: Props) => {
  const { vectorId, device } = props;

  const formFactorIcon = (f?: FormFactor) => {
    switch (f) {
      case 'TABLET':
        return <McsIcon type="tablet" />;
      case 'SMARTPHONE':
        return <McsIcon type="smartphone" />;
      case 'PERSONAL_COMPUTER':
        return <McsIcon type="laptop" />;
      default:
        return <Icon type="question" />;
    }
  };
  return device && vectorId ? (
    <Row gutter={10} key={vectorId} className="table-line border-top">
      <Col className="table-left" span={12}>
        <span style={{ float: 'left' }}>
          {formFactorIcon(device.form_factor)}
        </span>
        <span style={{ float: 'left' }}>
          {device.browser_family && <span><span className="title"> {device.browser_family}</span>
          <br /> </span>}
          <span className="subtitle"> {device.os_family}</span>
        </span>
      </Col>
      <Col className="table-right" span={12}>
        <span style={{ float: 'right' }} className="subtitle">
          {vectorId}
        </span>
      </Col>
    </Row>
  ) : null;
};

export default Device;

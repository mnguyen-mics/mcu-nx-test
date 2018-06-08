import * as React from 'react';
import { Row, Col, Alert } from 'antd';
import { McsIcon } from '../../components';
import { AlertProps } from 'antd/lib/alert';
import { McsIconType } from '../McsIcon';

interface FormAlertProps {
  message: React.ReactNode;
  iconType: McsIconType;
}

type JoinedProps = FormAlertProps & AlertProps;

class FormAlert extends React.Component<JoinedProps> {
  render() {
    const { message, iconType, type } = this.props;
    return (
      <Row>
        <Col offset={4} className="modificationWarning">
          <Row>
            <Col span={15}>
              <Alert
                message={
                  <div>
                    <McsIcon type={iconType} />
                    {message}
                  </div>
                }
                type={type ? type : 'info'}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default FormAlert;

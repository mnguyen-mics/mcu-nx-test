import * as React from 'react';

import { AuditComponentContainer } from '../../Audit';
import { Row } from 'antd';

interface AuditFormSectionProps {
  creativeId: string;
}

class AuditFormSection extends React.Component<AuditFormSectionProps> {
  render() {
    const { creativeId } = this.props;

    return (
      <Row
        align='middle'
        justify='space-between'
        className={'mcs-actionbar'}
        style={{ backgroundColor: 'white' }}
      >
        <AuditComponentContainer creativeId={creativeId} />
      </Row>
    );
  }
}

export default AuditFormSection;

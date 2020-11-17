import * as React from 'react';
import { CreativeAuditStatus } from '../../../../models/creative/CreativeResource';
import { FormattedMessage, defineMessages } from 'react-intl';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

export interface AuditStatusRendererProps {
  auditStatus?: CreativeAuditStatus;
}

const defaultAuditStatus: CreativeAuditStatus = 'NOT_AUDITED';

class AuditStatusRenderer extends React.Component<AuditStatusRendererProps> {
  render() {
    const { auditStatus } = this.props;
    const status = auditStatus || defaultAuditStatus;
    return (
      <div>
        <McsIcon
          type={auditIconConfig[status].type}
          className="m-r-10"
          style={{
            verticalAlign: 'middle',
            color: auditIconConfig[status].color,
          }}
        />
        <FormattedMessage {...creativeAuditStatusMessages[status]} />
      </div>
    );
  }
}

export default AuditStatusRenderer;

export const auditIconConfig: {
  [key in CreativeAuditStatus]: {
    type: McsIconType;
    color: string;
  }
} = {
  NOT_AUDITED: {
    type: 'close-big',
    color: '#fc3f48',
  },
  AUDIT_PENDING: {
    type: 'refresh',
    color: '#fd7c12',
  },
  AUDIT_FAILED: {
    type: 'close-big',
    color: '#fc3f48',
  },
  AUDIT_PASSED: {
    type: 'check',
    color: '#00ab67',
  },
  AUDIT_PARTIALLY_PASSED: {
    type: 'close-big',
    color: '#fd7c12',
  },
};

export const creativeAuditStatusMessages: {
  [key in CreativeAuditStatus]: FormattedMessage.MessageDescriptor
} = defineMessages({
  NOT_AUDITED: {
    id: 'creatives.audit.status.notAudited',
    defaultMessage: 'Not Audited',
  },
  AUDIT_PENDING: {
    id: 'creatives.audit.status.pending',
    defaultMessage: 'Audit Pending',
  },
  AUDIT_FAILED: {
    id: 'creatives.audit.status.failed',
    defaultMessage: 'Audit Failed',
  },
  AUDIT_PASSED: {
    id: 'creatives.audit.status.passed',
    defaultMessage: 'Audit Success',
  },
  AUDIT_PARTIALLY_PASSED: {
    id: 'creatives.audit.status.partiallypassed',
    defaultMessage: 'Audit Partially Passed',
  },
});

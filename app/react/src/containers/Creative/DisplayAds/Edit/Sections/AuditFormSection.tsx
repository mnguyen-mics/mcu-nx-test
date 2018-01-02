import * as React from 'react';

import { Card } from '../../../../../components/Card';
import { FormSection } from '../../../../../components/Form/index';
import messages from '../messages';
import AuditComponent from '../../Common/AuditComponent';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';

interface AuditFormSectionProps {
  creative: DisplayAdResource;
  mode?: string;
  refreshCreative: (organisationId: string, creativeId: string) => void;
}

class AuditFormSection extends React.Component<AuditFormSectionProps> {
  render() {
    const { creative } = this.props;

    return (
      <div>
        <FormSection
          title={messages.creativeSectionAuditTitle}
          subtitle={messages.creativeSectionAuditSubTitle}
        />
        <Card>
          <AuditComponent
          creative={creative}
          // onAuditChange={refreshCreative}
          mode="card" />
        </Card>
      </div>
    );
  }
}

export default AuditFormSection;

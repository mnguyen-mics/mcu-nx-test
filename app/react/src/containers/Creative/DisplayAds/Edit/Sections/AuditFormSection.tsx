import * as React from 'react';

import { Card } from '../../../../../components/Card';
import { FormSection } from '../../../../../components/Form/index';
import messages from '../messages';
import { AuditComponentContainer } from '../../Audit';

interface AuditFormSectionProps {
  creativeId: string;
}

class AuditFormSection extends React.Component<AuditFormSectionProps> {
  render() {
    const { creativeId } = this.props;

    return (
      <div>
        <FormSection
          title={messages.creativeSectionAuditTitle}
          subtitle={messages.creativeSectionAuditSubTitle}
        />
        <Card>
          <AuditComponentContainer creativeId={creativeId} />
        </Card>
      </div>
    );
  }
}

export default AuditFormSection;

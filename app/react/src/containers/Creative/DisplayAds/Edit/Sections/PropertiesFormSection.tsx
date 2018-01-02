import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import messages from '../messages';
import modalMessages from '../../../../../common/messages/modalMessages';
import { FormSection } from '../../../../../components/Form/index';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { PluginFieldGenerator } from '../../../../Plugin';
import { PropertyResourceShape } from '../../../../../models/plugin/index';

interface PropertiesFormSectionProps {
  rendererProperties: PropertyResourceShape[],
  rendererVersionId: string;
  creative?: DisplayAdResource;
}

type JoinedProps = PropertiesFormSectionProps &
InjectedIntlProps & 
RouteComponentProps<{ organisationId: string }>;

interface PropertiesFormSectionState {
  isLoading: boolean;
}

class PropertiesFormSection extends React.Component<
  JoinedProps,
  PropertiesFormSectionState
> {

	constructor(props: JoinedProps) {
		super(props);
		this.state = {
			isLoading: false,
		};
  }
  
  noUploadModal = (creative: DisplayAdResource) => () => {
    const { intl: { formatMessage } } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.noActionTitle),
      content:
        creative.audit_status === 'AUDIT_PASSED'
          ? formatMessage(modalMessages.noUploadMessage)
          : formatMessage(modalMessages.noUpdateMessage),
      iconType: 'exclamation-circle',
      okText: formatMessage(modalMessages.confirm),
    });
  };

  render() {
    const {
      rendererProperties,
      creative,
      match: {
        params: {
          organisationId,
        },
      },
      rendererVersionId,
    } = this.props;

    const isDisabled = creative && creative.audit_status &&
    (creative.audit_status === 'AUDIT_PASSED' || creative.audit_status === 'AUDIT_PENDING');
    return (
      <div>
        <FormSection
          title={messages.creativeSectionPropertyTitle}
          subtitle={messages.creativeSectionPropertySubTitle}
        />
        {rendererProperties &&
          rendererProperties.length &&
          rendererProperties.map(fieldDef => {
            return (
              <PluginFieldGenerator
                key={fieldDef.technical_name}
                definition={fieldDef}
                disabled={isDisabled}
                rendererVersionId={rendererVersionId}
                organisationId={organisationId}
                noUploadModal={creative ? this.noUploadModal(creative) : undefined}
              />
            );
          })}
      </div>
    );
  }
}

export default compose<JoinedProps, PropertiesFormSectionProps>(
  withRouter,
  injectIntl,
)(PropertiesFormSection);

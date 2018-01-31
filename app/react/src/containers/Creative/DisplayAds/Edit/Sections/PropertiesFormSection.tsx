import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Modal } from 'antd';
import { connect } from 'react-redux';
import { getFormInitialValues } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import messages from '../messages';
import modalMessages from '../../../../../common/messages/modalMessages';
import { FormSection } from '../../../../../components/Form/index';
import { PluginFieldGenerator } from '../../../../Plugin';
import {
  EditDisplayCreativeRouteMatchParams,
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isDisplayAdResource,
} from '../domain';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

type Props = MapStateProps &
  InjectedIntlProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

class PropertiesFormSection extends React.Component<Props> {
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
      initialValue: {
        creative,
        rendererPlugin: { current_version_id: rendererPluginVersionId },
        properties,
      },
      match: { params: { organisationId } },
    } = this.props;

    // TODO the following properties of PluginFieldGenerator should
    // not be passed directly : isDisabled, noUploadModal, plugingVersionId?, organisationId
    // because they aren't used for every property type
    // I'm sure we can find a better pattern

    let isDisabled = false;
    const additionnalProps: any = {};

    if (isDisplayAdResource(creative)) {
      isDisabled =
        creative.audit_status === 'AUDIT_PASSED' ||
        creative.audit_status === 'AUDIT_PENDING';

      additionnalProps.noUploadModal = this.noUploadModal(creative);
    }

    return (
      <div>
        <FormSection
          title={messages.creativeSectionPropertyTitle}
          subtitle={messages.creativeSectionPropertySubTitle}
        />
        {Object.keys(properties).map(key => {
          const fieldDef = properties[key]
          return (
            <PluginFieldGenerator
              key={fieldDef.technical_name}
              definition={fieldDef}
              disabled={isDisabled}
              pluginVersionId={rendererPluginVersionId}
              organisationId={organisationId}
              {...additionnalProps}
            />
          );
        })}
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  connect((state: any, ownProps: Props) => ({
    initialValue: getFormInitialValues(DISPLAY_CREATIVE_FORM)(
      state,
    ) as DisplayCreativeFormData,
  })),
)(PropertiesFormSection);

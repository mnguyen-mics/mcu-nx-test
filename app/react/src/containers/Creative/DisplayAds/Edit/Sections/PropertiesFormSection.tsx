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
import PluginSectionGenerator from '../../../../Plugin/PluginSectionGenerator';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

interface PropertiesFormSectionProps {
  small?: boolean;
  sectionTitle?: string;
}

type Props = PropertiesFormSectionProps & 
  MapStateProps &
  InjectedIntlProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

class PropertiesFormSection extends React.Component<Props> {
  noUploadModal = (creative: DisplayAdResource) => () => {
    const {
      intl: { formatMessage },
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.noActionTitle),
      content:
        creative.audit_status === 'AUDIT_PASSED'
          ? formatMessage(modalMessages.noUploadMessage)
          : formatMessage(modalMessages.noUpdateMessage),
      icon: <ExclamationCircleOutlined />,
      okText: formatMessage(modalMessages.confirm),
    });
  };

  render() {
    const {
      initialValue: {
        creative,
        rendererPlugin: { id: pluginVersionId },
        properties,
        pluginLayout
      },
      match: {
        params: { organisationId },
      },
      small
    } = this.props;

    // TODO the following properties of PluginFieldGenerator should
    // not be passed directly : isDisabled, noUploadModal, plugingVersionId?, organisationId
    // because they aren't used for every property type
    // I'm sure we can find a better pattern

    let isDisabled = false;
    const additionnalProps: any = {
      small: small
    };

    if (isDisplayAdResource(creative)) {
      isDisabled =
        creative.audit_status === 'AUDIT_PASSED' ||
        creative.audit_status === 'AUDIT_PENDING';

      additionnalProps.noUploadModal = this.noUploadModal(creative);
      additionnalProps.small = small;
    }

    if (pluginLayout === undefined) {
      return (
        <div>
          <FormSection
            title={messages.creativeSectionPropertyTitle}
            subtitle={messages.creativeSectionPropertySubTitle}
          />
          {Object.keys(properties).map(key => {
            const fieldDef = properties[key];
            return (
              <PluginFieldGenerator
                key={fieldDef.technical_name}
                definition={fieldDef}
                disabled={isDisabled}
                pluginVersionId={pluginVersionId}
                organisationId={organisationId}
                {...additionnalProps}
              />
            );
          })}
        </div>
      );
    } else {

      const propertiesToSectionGenerator: PropertyResourceShape[] = [];

      for (const propertyName in properties) {
        if (properties.hasOwnProperty(propertyName))
          propertiesToSectionGenerator.push(properties[propertyName]);
      }

      if (this.props.sectionTitle === undefined) {

        return null;

      } else {

        const possibleSections = pluginLayout.sections.filter(section => section.title === this.props.sectionTitle);

        if (possibleSections.length !== 0) {

          const chosenSection = possibleSections[0];

          return (
            <PluginSectionGenerator
              key={chosenSection.title}
              pluginLayoutSection={chosenSection}
              organisationId={organisationId}
              pluginProperties={propertiesToSectionGenerator}
              pluginVersionId={pluginVersionId}
              {...additionnalProps}
            />
          )
        }
      }
    }
    return null;
  }
}

export default compose<Props, PropertiesFormSectionProps>(
  withRouter,
  injectIntl,
  connect((state: MicsReduxState, ownProps: Props) => ({
    initialValue: getFormInitialValues(DISPLAY_CREATIVE_FORM)(
      state,
    ) as DisplayCreativeFormData,
  })),
)(PropertiesFormSection);

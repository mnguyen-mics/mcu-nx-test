import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { Form, InjectedFormProps, reduxForm, Fields } from 'redux-form';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import { BasicProps } from 'antd/lib/layout/layout';
import { PlacementDescriptorResource } from '../../../../models/placement/PlacementDescriptorResource';
import { injectDrawer } from '../../../../components/Drawer/index';
import {
  FormInput,
  FormSection,
  withValidators,
  FormInputField,
} from '../../../../components/Form';
import DefaultSelect from '../../../../components/Form/FormSelect/DefaultSelect';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const FORM_ID = 'placementDescriptorForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const messages = defineMessages({
  addPlacementDescriptor: {
    id: 'placement.placementDescriptor.edit.actionbar.add',
    defaultMessage: 'Add',
  },
  editPlacementDescriptor: {
    id: 'placement.placementDescriptor.edit.actionbar.editPlacementDescriptor',
    defaultMessage: 'Edit {name}',
  },
  newPlacementDescriptor: {
    id: 'placement.placementDescriptor.edit.actionbar.newPlacementDescriptor',
    defaultMessage: 'New Placement Descriptor',
  },
  generalInfos: {
    id: 'placement.placementDescriptor.edit.generalSection.title',
    defaultMessage: 'General Informations',
  },
  generalInfosSubtitle: {
    id: 'placement.placementDescriptor.edit.generalSection.subtitle',
    defaultMessage: 'Edit placement descriptor',
  },
  labelValuePlacementDescriptor: {
    id: 'placement.placementDescriptor.edit.label.value',
    defaultMessage: 'Value',
  },
  labelTypePlacementDescriptor: {
    id: 'placement.placementDescriptor.edit.label.type',
    defaultMessage: 'Type',
  },
  labelHolderPlacementDescriptor: {
    id: 'placement.placementDescriptor.edit.label.holder',
    defaultMessage: 'Holder',
  },
  websiteValueTooltip: {
    id: 'placement.placementDescriptor.edit.tooltip.website.value',
    defaultMessage:
      'Please add the webdomain you want to target such as example.com.',
  },
  mobileValueTooltip: {
    id: 'placement.placementDescriptor.edit.tooltip.mobile.value',
    defaultMessage: 'Please input the ID of the mobile app your are targeting.',
  },
  websiteTypeTooltip: {
    id: 'placement.placementDescriptor.edit.tooltip.website.type',
    defaultMessage:
      'Pattern will allow you to target or exclude domains or subdomains (for instance example.com will target all pages on this domain) Exact URL allows your to target or exclude a single URL (for instance example.com will target only the root page of this domain)',
  },
  mobileTypeTooltip: {
    id: 'placement.placementDescriptor.edit.tooltip.mobile.type',
    defaultMessage:
      'Exact application ID will target or exclude the application id entered above.',
  },
  savingInProgress: {
    id: 'placement.placementDescriptor.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});

const placementDescriptorTypeMessagesMap: {
  [propertyName: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  EXACT_URL: {
    id: 'edit.placement.descriptor.form.option.exactUrl',
    defaultMessage: 'Exact URL',
  },
  EXACT_APPLICATION_ID: {
    id: 'edit.placement.descriptor.form.option.exactAppId',
    defaultMessage: 'Exact Application Id',
  },
  PATTERN: {
    id: 'edit.placement.descriptor.form.option.pattern',
    defaultMessage: 'Pattern',
  },
});

const placementDescriptorTypes: string[] = [
  'EXACT_URL',
  'EXACT_APPLICATION_ID',
  'PATTERN',
];

export interface PlacementDescriptorFormProps {
  initialValues?: Partial<PlacementDescriptorResource>;
  onSave: (formData: Partial<PlacementDescriptorResource>) => void;
  actionBarButtonText: string;
  close: () => void;
}

type JoinedProps = PlacementDescriptorFormProps &
  InjectedDrawerProps &
  InjectedFormProps<PlacementDescriptorResource, PlacementDescriptorFormProps> &
  InjectedIntlProps &
  ValidatorProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; placementListId: string }>;

class PlacementDescriptorForm extends React.Component<JoinedProps> {
  typeAvailableOptionsArray = [];

  constructor(props: JoinedProps) {
    super(props);
  }

  getAvailableTypeOptions = (value: string) => {
    const { intl } = this.props;
    return placementDescriptorTypes.map(placementDescriptorType => {
      return {
        title: intl.formatMessage(
          placementDescriptorTypeMessagesMap[placementDescriptorType],
        ),
        value: placementDescriptorType,
        disabled:
          (placementDescriptorType === 'EXACT_APPLICATION_ID' &&
            value === 'WEB_BROWSER') ||
          (placementDescriptorType !== 'EXACT_APPLICATION_ID' &&
            value === 'APPLICATION'),
      };
    });
  };

  renderFields = (fields: any) => {
    const { intl } = this.props;
    return (
      <div>
        <DefaultSelect
          formItemProps={{
            label: intl.formatMessage(messages.labelTypePlacementDescriptor),
            required: true,
          }}
          options={this.getAvailableTypeOptions(
            fields.placement_holder.input.value,
          )}
          helpToolTipProps={{
            title:
              this.props.initialValues.placement_holder === 'WEB_BROWSER'
                ? intl.formatMessage(messages.websiteTypeTooltip)
                : intl.formatMessage(messages.mobileTypeTooltip),
          }}
          {...fields.descriptor_type}
          input={{
            ...fields.descriptor_type.input,
          }}
        />
        <DefaultSelect
          formItemProps={{
            label: intl.formatMessage(messages.labelHolderPlacementDescriptor),
            required: true,
          }}
          {...fields.placement_holder}
          disabled={true}
        />
      </div>
    );
  };

  render() {
    const {
      intl,
      initialValues,
      handleSubmit,
      onSave,
      fieldValidators: { isRequired },
    } = this.props;

    const placementDescriptorName =
      initialValues && initialValues.id
        ? intl.formatMessage(messages.editPlacementDescriptor, {
            name: this.props.initialValues!.value
              ? this.props.initialValues!.value
              : this.props.initialValues!.id,
          })
        : intl.formatMessage(messages.newPlacementDescriptor);

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [
        {
          name: placementDescriptorName,
        },
      ],
      message: messages.addPlacementDescriptor,
      onClose: this.props.closeNextDrawer,
    };
    const sideBarProps: SidebarWrapperProps = {
      items: [
        {
          sectionId: 'general',
          title: messages.generalInfos,
        },
      ],
      scrollId: FORM_ID,
    };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(onSave)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div id="general">
                <FormSection
                  subtitle={messages.generalInfosSubtitle}
                  title={messages.generalInfos}
                />

                <div>
                  <FormInputField
                    name="value"
                    component={FormInput}
                    validate={[isRequired]}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.labelValuePlacementDescriptor,
                      ),
                      required: true,
                    }}
                    inputProps={{
                      placeholder:
                        initialValues.placement_holder === 'WEB_BROWSER'
                          ? 'www.website-example.com'
                          : 'Application ID',
                    }}
                    helpToolTipProps={{
                      title:
                        this.props.initialValues.placement_holder ===
                        'WEB_BROWSER'
                          ? intl.formatMessage(messages.websiteValueTooltip)
                          : intl.formatMessage(messages.mobileValueTooltip),
                    }}
                  />
                  <Fields
                    names={['descriptor_type', 'placement_holder']}
                    component={this.renderFields}
                  />
                </div>
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, PlacementDescriptorFormProps>(
  injectIntl,
  injectDrawer,
  withValidators,
  withRouter,
  injectNotifications,
  reduxForm<PlacementDescriptorResource, PlacementDescriptorFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(PlacementDescriptorForm);

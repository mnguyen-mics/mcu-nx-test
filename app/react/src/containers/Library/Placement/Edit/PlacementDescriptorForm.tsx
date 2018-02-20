import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { Form, InjectedFormProps, reduxForm } from 'redux-form';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';

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
  FormSelectField,
  withValidators,
  FormInputField,
} from '../../../../components/Form';
import DefaultSelect from '../../../../components/Form/FormSelect/DefaultSelect';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const FORM_ID = 'placementDescriptorForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const messages = defineMessages({
  addPlacementDescriptor: {
    id: 'edit.placement.list.edit.placementDescriptor.add',
    defaultMessage: 'Add',
  },
  editPlacementDescriptor: {
    id: 'edit.placement.list.edit.placementDescriptor.edit',
    defaultMessage: 'Edit {name}',
  },
  placements: {
    id: 'edit.placement.list.placements',
    defaultMessage: 'Placements',
  },
  newPlacementDescriptor: {
    id: 'new.placement.descriptor',
    defaultMessage: 'New Placement Descriptor',
  },
  generalInfos: {
    id: 'edit.placement.descriptor.general.section.title',
    defaultMessage: 'General Informations',
  },
  generalInfosSubtitle: {
    id: 'edit.placement.descriptor.general.section.subtitle',
    defaultMessage: 'Edit placement descriptor',
  },
  labelValuePlacementDescriptor: {
    id: 'edit.placement.descriptor.label.value',
    defaultMessage: 'Value',
  },
  labelTypePlacementDescriptor: {
    id: 'edit.placement.descriptor.label.type',
    defaultMessage: 'Type',
  },
  labelHolderPlacementDescriptor: {
    id: 'edit.placement.descriptor.label.holder',
    defaultMessage: 'Holder',
  },
  tootltipPlacementDescriptor: {
    id: 'edit.placement.descriptor.tooltip',
    defaultMessage: 'Lorem Ipsum',
  },
  exactUrl: {
    id: 'edit.placement.descriptor.select.type.option.exactUrl',
    defaultMessage: 'Exact URL',
  },
  exactApplicationId: {
    id: 'edit.placement.descriptor.select.type.option.exactApplicatinoId',
    defaultMessage: 'Exact Application Id',
  },
  exactPattern: {
    id: 'edit.placement.descriptor.select.type.option.pattern',
    defaultMessage: 'Pattern',
  },
  application: {
    id: 'edit.placement.descriptor.select.holder.option.application',
    defaultMessage: 'Application',
  },
  webBrowser: {
    id: 'edit.placement.descriptor.select.type.holder.webBrowser',
    defaultMessage: 'Web Browser',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
});

export interface PlacementDescriptorFormProps {
  initialValues?: Partial<PlacementDescriptorResource>;
  onSave: (formData: Partial<PlacementDescriptorResource>) => void;
  actionBarButtonText: string;
  close: () => void;
}

type JoinedProps = PlacementDescriptorFormProps &
  InjectDrawerProps &
  InjectedFormProps<PlacementDescriptorResource, PlacementDescriptorFormProps> &
  InjectedIntlProps &
  ValidatorProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; placementListId: string }>;

class PlacementDescriptorForm extends React.Component<JoinedProps> {
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
                      placeholder: intl.formatMessage(
                        messages.labelValuePlacementDescriptor,
                      ),
                    }}
                    helpToolTipProps={{
                      title: intl.formatMessage(
                        messages.tootltipPlacementDescriptor,
                      ),
                    }}
                  />
                  <FormSelectField
                    name="descriptor_type"
                    component={DefaultSelect}
                    validate={[isRequired]}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.labelTypePlacementDescriptor,
                      ),
                      required: true,
                    }}
                    options={[
                      {
                        title: intl.formatMessage(messages.exactUrl),
                        value: 'EXACT_URL',
                      },
                      {
                        title: intl.formatMessage(messages.exactApplicationId),
                        value: 'EXACT_APPLICATION_ID',
                      },
                      {
                        title: intl.formatMessage(messages.exactPattern),
                        value: 'PATTERN',
                      },
                    ]}
                    helpToolTipProps={{
                      title: intl.formatMessage(
                        messages.tootltipPlacementDescriptor,
                      ),
                    }}
                  />
                  <FormSelectField
                    name="placement_holder"
                    component={DefaultSelect}
                    validate={[isRequired]}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.labelHolderPlacementDescriptor,
                      ),
                      required: true,
                    }}
                    options={[
                      {
                        title: intl.formatMessage(messages.application),
                        value: 'APPLICATION',
                      },
                      {
                        title: intl.formatMessage(messages.webBrowser),
                        value: 'WEB_BROWSER',
                      },
                    ]}
                    helpToolTipProps={{
                      title: intl.formatMessage(
                        messages.tootltipPlacementDescriptor,
                      ),
                    }}
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

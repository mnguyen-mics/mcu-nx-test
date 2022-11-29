import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { OfferType } from './EditOfferPage';
import { Layout } from 'antd';
import { FormLayoutActionbar, ScrollspySider } from '../../../../components/Layout';
import {
  Form,
  InjectedFormProps,
  reduxForm,
  ConfigProps,
  FieldArray,
  GenericFieldArray,
  Field,
} from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { FormLayoutActionbarProps } from '../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { SidebarWrapperProps } from '../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../utils/FormHelper';
import { Omit } from '../../../../utils/Types';
import { OfferFormData } from '../domain';
import {
  FormSection,
  FormInputField,
  FormInput,
  FormSelectField,
  DefaultSelect,
} from '../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../components/Form/withValidators';
import ServiceItemsFormSection, {
  ServiceItemsFormSectionProps,
} from './sections/ServiceItemsFormSection';

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;

export interface OfferFormProps extends Omit<ConfigProps<OfferFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  offerType: OfferType;
  goToOfferTypeSelection?: () => void;
}

const ServiceItemsFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ServiceItemsFormSectionProps
>;

type Props = InjectedFormProps<OfferFormData, OfferFormProps> &
  RouteComponentProps<{ organisationId: string; offerId?: string }> &
  OfferFormProps &
  ValidatorProps &
  WrappedComponentProps;

export const FORM_ID = 'offerForm';

class CreateOfferForm extends React.Component<Props> {
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      offerType,
      goToOfferTypeSelection,
      close,
      change,
      fieldValidators: { isRequired },
      intl: { formatMessage },
      match: {
        params: { offerId },
      },
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveOffer,
      onClose: close,
    };

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.generalInformation,
      component: (
        <div>
          <FormSection
            subtitle={messages.sectionNewOfferSubtitle}
            title={messages.sectionNewOfferTitle}
          />

          <div>
            <FormInputField
              name='offer.name'
              component={FormInput}
              validate={[isRequired]}
              formItemProps={{
                label: formatMessage(messages.sectionNewOfferNameLabel),
                required: true,
              }}
              inputProps={{
                disabled: offerId !== undefined,
                placeholder: formatMessage(messages.sectionNewOfferNamePlaceholder),
              }}
            />
          </div>
        </div>
      ),
    });
    if (offerType === OfferType.Automatic) {
      const optionsAutomaticOn = [
        {
          value: 'AUDIENCE_SEGMENT',
          title: 'AUDIENCE_SEGMENT',
        },
      ];

      sections.push({
        id: 'automaticOn',
        title: messages.automaticOn,
        component: (
          <div>
            <FormSection
              subtitle={messages.sectionServiceTypeSubtitle}
              title={messages.sectionServiceTypeTitle}
            />

            <div>
              <FormSelectField
                name='offer.automatic_on'
                component={DefaultSelect}
                validate={[isRequired]}
                formItemProps={{
                  label: formatMessage(messages.sectionNewOfferAutomaticOnLabel),
                }}
                disabled={offerId !== undefined}
                options={optionsAutomaticOn}
              />
            </div>
          </div>
        ),
      });
    } else {
      sections.push({
        id: 'serviceItems',
        title: messages.serviceItemsSection,
        component: (
          <ServiceItemsFieldArray
            name='serviceConditionFields'
            component={ServiceItemsFormSection}
            {...genericFieldArrayProps}
          />
        ),
      });
    }

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: FORM_ID,
    };

    if (goToOfferTypeSelection) {
      sideBarProps.items.unshift({
        sectionId: 'type',
        title: messages.offerFormTypeSelection,
        onClick: goToOfferTypeSelection,
        type: 'validated',
      });
    }

    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      );
    });

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, OfferFormProps>(
  injectIntl,
  withValidators,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(CreateOfferForm);

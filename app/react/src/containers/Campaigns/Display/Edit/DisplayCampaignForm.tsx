import * as React from 'react';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  GenericFieldArray,
  Field,
  FieldArray,
} from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Path } from '../../../../components/ActionBar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import messages from './messages';
import { DisplayCampaignFormData } from './domain';
import { Omit } from '../../../../utils/Types';
import GeneralFormSection from './Sections/Programmatic/GeneralFormSection';
import { McsFormSection } from '../../../../utils/FormHelper';
import GoalFormSection, { GoalFormSectionProps } from './Sections/Programmatic/GoalFormSection';
import AdGroupFormSection, {
  AdGroupFormSectionProps,
} from './Sections/Programmatic/AdGroupFormSection';
import * as SessionSelectors from '../../../../redux/Session/selectors';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

export const GoalFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  GoalFormSectionProps
>;

const AdGroupFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AdGroupFormSectionProps
>;

export interface DisplayCampaignFormProps
  extends Omit<ConfigProps<DisplayCampaignFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = InjectedFormProps<
  DisplayCampaignFormData,
  DisplayCampaignFormProps
> &
  DisplayCampaignFormProps &
  MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

export const FORM_ID = 'campaignForm';

class DisplayCampaignForm extends React.Component<Props> {
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      change,
      match: { params: { organisationId } },
      hasDatamarts,
    } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveAdGroup,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.sectionTitle1,
      component: <GeneralFormSection />,
    });

    if (hasDatamarts(organisationId)) {
      sections.push({
        id: 'goals',
        title: messages.sectionTitle2,
        component: (
          <GoalFieldArray
            name="goalFields"
            component={GoalFormSection}
            {...genericFieldArrayProps}
          />
        ),
      });
    }

    sections.push({
      id: 'adGroups',
      title: messages.sectionTitle3,
      component: (
        <AdGroupFieldArray
          name="adGroupFields"
          component={AdGroupFormSection}
          {...genericFieldArrayProps}
        />
      ),
    });

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: FORM_ID,
    };

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
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, DisplayCampaignFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect((state: MicsReduxState) => ({ hasDatamarts: SessionSelectors.hasDatamarts(state) })),
)(DisplayCampaignForm);

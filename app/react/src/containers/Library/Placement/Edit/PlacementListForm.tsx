import * as React from 'react';
import { Layout } from 'antd';
import { compose } from 'recompose';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  FieldArray,
  GenericFieldArray,
  Field,
} from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import { PlacementListFormData } from './domain';
import {
  McsFormSection,
} from '../../../../utils/FormHelper';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import GeneralFormSection from './Sections/GeneralFormSection';
import PlacementsFormSection, { PlacementsFormSectionProps } from './Sections/PlacementsFormSection';
import { Omit } from '../../../../utils/Types';
import { PlacementList } from '../../../../models/placementList/PlacementList';

export const FORM_ID = 'placementListForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const PlacementDescriptorFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  PlacementsFormSectionProps
>;

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'general',
    defaultMessage: 'General Informations',
  },
  sectionTitlePlacements: {
    id: 'placements',
    defaultMessage: 'Placements',
  },
  savePlacementList: {
    id: 'save.placement.list',
    defaultMessage: 'Save',
  },
  editPlacementList: {
    id: 'edit.placement.list',
    defaultMessage: 'Edit {name}',
  },
  newPlacementList: {
    id: 'new.placement.list',
    defaultMessage: 'New Placement List',
  },
  placements: {
    id: 'edit.placement.list.placements',
    defaultMessage: 'Placements',
  },
});

interface PlacementListFormProps
  extends Omit<ConfigProps<PlacementListFormData>, 'form'> {
  onClose: () => void;
  onSave: (formData: Partial<PlacementList>) => void;
  breadCrumbPaths: Path[];
}

interface PlacementListFormState {}

type Props = InjectedFormProps<PlacementListFormData, PlacementListFormProps> &
  PlacementListFormProps &
  RouteComponentProps<{ organisationId: string; placementListId: string }> &
  InjectedIntlProps;

class PlacementListForm extends React.Component<Props, PlacementListFormState> {

  constructor(props: Props) {
    super(props)
  }

  buildFormSections = () => {
    const sections: McsFormSection[] = [];
    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };
    const placements = {
      id: 'placements',
      title: messages.sectionTitlePlacements,
      component: (
        <PlacementDescriptorFieldArray
          name="placementDescriptorList"
          component={PlacementsFormSection}
          formChange={this.props.change}
          rerenderOnEveryChange={true}
        />
      ),
    };
    sections.push(general);
    sections.push(placements);
    return sections;
  };

  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: this.props.breadCrumbPaths,
      message: messages.savePlacementList,
      onClose: this.props.onClose,
    };
    const sections = this.buildFormSections();
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
            onSubmit={handleSubmit(onSave) as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div className="placement-list-form">{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
  
}

export default compose<Props, PlacementListFormProps>(
  withRouter,
  injectIntl,
  reduxForm<PlacementListFormData, PlacementListFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(PlacementListForm);

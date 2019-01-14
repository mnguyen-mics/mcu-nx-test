import * as React from 'react';
import { Omit, connect } from 'react-redux';
import {
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  getFormValues,
} from 'redux-form';
import { Path } from '../../../../../components/ActionBar';
import { Layout, Form } from 'antd';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { McsFormSection } from '../../../../../utils/FormHelper';
import { AutomationNodeFormData, FORM_ID } from './domain';
import GeneralFormSection from './GeneralFormSection';
import { ScenarioNodeShape } from '../../../../../models/automations/automations';
import DisplayCampaignFormSection from './DisplayCampaignFormSection';
import DeviceFormSection from '../../../../Campaigns/Display/Edit/AdGroup/sections/DeviceFormSection';
import { AdFieldArray, BidOptimizerFieldArray, InventoryCatalogFieldArray, LocationTargetingFieldArray } from '../../../../Campaigns/Display/Edit/AdGroup/AdGroupForm';
import { LocationTargetingFormSection } from '../../../../Campaigns/Display/Edit/AdGroup/sections/Location';
import { InventoryCatalogFormSection } from '../../../../Campaigns/Display/Edit/AdGroup/sections/InventoryCatalog';
import AdFormSection from '../../../../Campaigns/Display/Edit/AdGroup/sections/AdFormSection';
import { BidOptimizerFormSection } from '../../../../Campaigns/Display/Edit/AdGroup/sections';

const { Content } = Layout;

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.form.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.edition.form.general.title',
    defaultMessage: 'General Informations',
  },
  sectionDisplayCampaignTitle: {
    id: 'automation.builder.node.edition.form.display.title',
    defaultMessage: 'Modify the parameters of the display campaign',
  },
});

export interface AutomationNodeFormProps
  extends Omit<ConfigProps<AutomationNodeFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  node: ScenarioNodeShape;
}

interface MapStateToProps {
  formValues: AutomationNodeFormData;
}

type Props = InjectedFormProps<
  AutomationNodeFormData,
  AutomationNodeFormProps
> &
  AutomationNodeFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class AutomationNodeForm extends React.Component<Props> {
  buildFormSections = () => {
    const { node } = this.props;

    const sections: McsFormSection[] = [];

    const general = {
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: (
        <GeneralFormSection initialValues={this.props.initialValues} />
      ),
    };

    const displayCampaignSection = {
      id: 'displayCampaign',
      title: messages.sectionGeneralTitle,
      component: (
        <DisplayCampaignFormSection initialValues={this.props.initialValues} />
      ),
    };

    const location = {
      id: 'location',
      title: messages.sectionTitleLocationTargeting,
      component: (
        <LocationTargetingFieldArray
          name="locationFields"
          component={LocationTargetingFormSection}
          {...genericFieldArrayProps}
        />
      ),
    };
    const device = {
      id: 'device',
      title: messages.sectionTitleDevice,
      component: (
        <DeviceFormSection
          formChange={this.props.change}
          initialValues={this.props.initialValues.adGroup}
        />
      ),
    };
    const placementList = {
      id: 'placementList',
      title: messages.sectionTitlePlacement,
      component: (
        <InventoryCatalogFieldArray
          name="inventoryCatalFields"
          component={InventoryCatalogFormSection}
          {...genericFieldArrayProps}
        />
      ),
    };

    const displayAd = {
      id: 'display',
      title: messages.sectionTitleAds,
      component: (
        <AdFieldArray
          name="adFields"
          component={AdFormSection}
          {...genericFieldArrayProps}
        />
      ),
    };

    const bidOptimizer = {
      id: 'bidOptimizer',
      title: messages.sectionTitleOptimizer,
      component: (
        <BidOptimizerFieldArray
          name="bidOptimizerFields"
          component={BidOptimizerFormSection}
          {...genericFieldArrayProps}
        />
      ),
    };

    console.log(node)

    if(node.type==="DISPLAY_CAMPAIGN") {
      console.log(true);
      sections.push(displayCampaignSection);
    }else sections.push(general);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
    };

    const sections = this.buildFormSections();

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
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container automation-form"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AutomationNodeFormProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AutomationNodeForm);

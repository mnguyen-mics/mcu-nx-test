import * as React from 'react';
import {
  Form,
  reduxForm,
  ConfigProps,
  InjectedFormProps,
} from 'redux-form';
import { connect } from 'react-redux';
import { InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import { compose } from 'recompose';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { Omit } from '../../../../utils/Types';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import withValidators, {
  ValidatorProps,
} from '../../../../components/Form/withValidators';
import messages from './messages';
import withNormalizer, {
  NormalizerProps,
} from '../../../../components/Form/withNormalizer';
import {
  AudienceSegmentFormData,
  SegmentTypeFormLoader
} from './domain'
import {
  FeedType
} from "../../../../models/audiencesegment/";
import * as FeatureSelectors from '../../../../state/Features/selectors';


import GeneralFormSection from './sections/GeneralFormSection'
import { PixelSection } from './sections/pixel'

import { McsFormSection } from '../../../../utils/FormHelper';

const FORM_ID = 'audienceSegmentForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
  >;

export interface AudienceSegmentFormProps extends Omit<ConfigProps<AudienceSegmentFormData>, 'form'> {
  close: () => void;
  onSubmit: (audienceSegmentFormData: AudienceSegmentFormData) => void;
  audienceSegmentFormData: AudienceSegmentFormData;
  datamartToken: string,
  segmentType: SegmentTypeFormLoader;
  feedType?: FeedType;
  segmentCreation: boolean
}

type Props = InjectedFormProps<AudienceSegmentFormProps> &
  AudienceSegmentFormProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;


class EditAudienceSegmentForm extends React.Component<Props> {

  
  getSegmentType = () => {
    const {
      segmentType,
    } = this.props;

    return segmentType;
  }

  renderPropertiesField = () => {
    const {
      segmentType,
      datamartToken
    } = this.props;

    switch(segmentType) {
      case 'USER_LIST':
        return <div>USER LIST</div>;
      case 'USER_PIXEL':
        return <PixelSection datamartToken={datamartToken} />;
      case 'USER_QUERY':
        return <div>USER_QUERY</div>;
      default:
        return <div>Not Supported</div>;
    }

  }

  render() {

    const {
      handleSubmit, close,
      segmentType,
      segmentCreation,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [],
      message: messages.audienceSegmentSaveButton,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: '',
      title: messages.audienceSegmentSiderMenuSemgnetType,
      component: null
    })
    sections.push({
      id: 'general',
      title: messages.audienceSegmentSectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    if (!(segmentCreation && segmentType === 'USER_PIXEL')) {
      sections.push({
        id: 'properties',
        title: messages.audienceSegmentSiderMenuProperties,
        component: this.renderPropertiesField()
      });
    }
    

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: FORM_ID,
    };

    const renderedSections = sections.map((section, index) => {
      return section.component ? (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      ) : null;
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
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              { renderedSections }
              
            </Content>
          </Form>
        </Layout>
      </Layout>

    )
  }
}

export default compose<Props, AudienceSegmentFormProps>(
  withRouter,
  withValidators,
  withNormalizer,
  reduxForm<AudienceSegmentFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(state => ({
    hasFeature: FeatureSelectors.hasFeature(state),
  }))
)(EditAudienceSegmentForm);

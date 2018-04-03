import * as React from 'react';
import {
  Form,
  reduxForm,
  ConfigProps,
  InjectedFormProps,
  GenericFieldArray,
  FieldArray,
  Field,
} from 'redux-form';
import { connect } from 'react-redux';
import { InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
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
  SegmentTypeFormLoader,
  EditAudienceSegmentParam
} from './domain'
import {
  FeedType
} from "../../../../models/audiencesegment/";
import * as FeatureSelectors from '../../../../state/Features/selectors';


import GeneralFormSection from './Sections/GeneralFormSection'
import SelectorQL from './Sections/query/SelectorQL';
import AudienceExternalFeedSection, { AudienceExternalFeedSectionProps } from './Sections/AudienceExternalFeedSection'
import AudienceTagFeedSection, { AudienceTagFeedSectionProps } from './Sections/AudienceTagFeedSection'
import { PixelSection } from './Sections/pixel'

import { McsFormSection } from '../../../../utils/FormHelper';
import { QueryLanguage } from '../../../../models/datamart/DatamartResource';
import { Datamart } from '../../../../models/organisation/organisation';
import { FormSection, FieldCtor } from '../../../../components/Form';

import OTQLInputEditor, { OTQLInputEditorProps } from './Sections/query/OTQL'

const FORM_ID = 'audienceSegmentForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
  >;

const AudienceExternalFeedField = FieldArray as new () => GenericFieldArray<Field, AudienceExternalFeedSectionProps>;
const AudienceTagFeedField = FieldArray as new () => GenericFieldArray<Field, AudienceTagFeedSectionProps>;

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field;

export interface AudienceSegmentFormProps extends Omit<ConfigProps<AudienceSegmentFormData>, 'form'> {
  close: () => void;
  onSubmit: (audienceSegmentFormData: AudienceSegmentFormData) => void;
  audienceSegmentFormData: AudienceSegmentFormData;
  datamart: Datamart,
  segmentType: SegmentTypeFormLoader;
  feedType?: FeedType;
  segmentCreation: boolean;
  queryContainer: any;
  queryLanguage: QueryLanguage;
}

type Props = InjectedFormProps<AudienceSegmentFormProps> &
  AudienceSegmentFormProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<EditAudienceSegmentParam>;


class EditAudienceSegmentForm extends React.Component<Props> {

  generateUserQueryTemplate = (renderedSection: JSX.Element) => {
    return (
      <div>
        <FormSection
          title={messages.audienceSegmentSectionQueryTitle}
          subtitle={messages.audienceSegmentSectionQuerySubTitle}
        />
        {renderedSection}
      </div>
    )
  }

  renderPropertiesField = () => {
    const {
      segmentType,
      datamart,
      queryLanguage,
      match: {
        params: {
          organisationId
        }
      },
      intl,
    } = this.props;
    switch(segmentType) {
      case 'USER_LIST':
        return null;
      case 'USER_PIXEL':
        return <PixelSection datamartToken={datamart.token} userListTechName={this.props.audienceSegmentFormData.audienceSegment.technical_name}/>;
      case 'USER_QUERY':
    return queryLanguage === 'OTQL' ? 
      this.generateUserQueryTemplate(<FormOTQL
        name={'query.query_text'}
        component={OTQLInputEditor}
        formItemProps={{
          label: intl.formatMessage(messages.audienceSegmentSectionQueryTitle),
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.audienceSegmentCreationUserQueryFieldHelper),
        }}
      />) :
      this.generateUserQueryTemplate(<SelectorQL datamartId={datamart.id} organisationId={organisationId} queryContainer={this.props.queryContainer} />);
      default:
        return <div>Not Supported</div>;
    }

  }

  render() {

    const {
      handleSubmit, close,
      segmentType,
      segmentCreation,
      change,
    } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [],
      message: messages.audienceSegmentSaveButton,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.audienceSegmentSectionGeneralTitle,
      component: <GeneralFormSection
        segmentCreation={segmentCreation}
        segmentType={segmentType as any}
      />,
    });

    if (!(segmentCreation && segmentType === 'USER_PIXEL')) {
      sections.push({
        id: 'properties',
        title: messages.audienceSegmentSiderMenuProperties,
        component: this.renderPropertiesField()
      });
    }
    
    if (!segmentCreation) {
      sections.push({
        id: 'audienceExternalFeed',
        title: messages.sectionAudienceExternalFeedTitle,
        component: <AudienceExternalFeedField
          name={"audienceExternalFeeds"}
          component={AudienceExternalFeedSection}
          {...genericFieldArrayProps}
        />,
      });

      sections.push({
        id: 'audienceTagFeed',
        title: messages.sectionAudienceExternalFeedTitle,
        component: <AudienceTagFeedField
          name={"audienceTagFeeds"}
          component={AudienceTagFeedSection}
          {...genericFieldArrayProps}
        />,
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
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
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

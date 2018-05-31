import * as React from 'react';
import {
  Form,
  reduxForm,
  ConfigProps,
  InjectedFormProps,
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
  EditAudienceSegmentParam,
  SegmentType,
} from './domain';
import { FeedType } from '../../../../models/audiencesegment/';
import * as FeatureSelectors from '../../../../state/Features/selectors';

import GeneralFormSection from './Sections/GeneralFormSection';
import SelectorQL from './Sections/query/SelectorQL';
import { PixelSection } from './Sections/pixel';
import { UserListSection } from './Sections/list';

import { McsFormSection } from '../../../../utils/FormHelper';
import {
  QueryLanguage,
  DatamartResource,
} from '../../../../models/datamart/DatamartResource';
import { FormSection, FieldCtor } from '../../../../components/Form';
import { Path } from '../../../../components/ActionBar';
import OTQLInputEditor, { OTQLInputEditorProps } from './Sections/query/OTQL';
import JSONQL, { JSONQLInputEditorProps } from './Sections/query/JSONQL';

const FORM_ID = 'audienceSegmentForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field;
const FormJSONQL: FieldCtor<JSONQLInputEditorProps> = Field;

export interface AudienceSegmentFormProps
  extends Omit<ConfigProps<AudienceSegmentFormData>, 'form'> {
  close: () => void;
  onSubmit: (audienceSegmentFormData: AudienceSegmentFormData) => void;
  breadCrumbPaths: Path[];
  audienceSegmentFormData: AudienceSegmentFormData;
  datamart?: DatamartResource;
  feedType?: FeedType;
  segmentCreation: boolean;
  queryContainer: any;
  queryLanguage?: QueryLanguage;
  segmentType?: SegmentType;
  goToSegmentTypeSelection?: () => void;
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
    );
  };

  renderPropertiesField = () => {
    const {
      datamart,
      queryLanguage,
      match: {
        params: { organisationId },
      },
      intl,
      initialValues,
      segmentType,
      audienceSegmentFormData,
    } = this.props;
    const type = segmentType
      ? segmentType
      : initialValues && initialValues.audienceSegment
        ? initialValues.audienceSegment.type
        : undefined;
    const datamartId = datamart
      ? datamart.id
      : audienceSegmentFormData.audienceSegment.datamart_id;

    switch (type) {
      case 'USER_LIST':
        return (
          <UserListSection
            segmentId={audienceSegmentFormData.audienceSegment.id as string}
          />
        );
      case 'USER_PIXEL':
        return (
          datamart && (
            <PixelSection
              datamartToken={datamart.token}
              userListTechName={
                this.props.audienceSegmentFormData.audienceSegment
                  .technical_name
              }
            />
          )
        );
      case 'USER_QUERY':
        return queryLanguage === 'OTQL'
          ? this.generateUserQueryTemplate(
              <FormOTQL
                name={'query.query_text'}
                component={OTQLInputEditor}
                formItemProps={{
                  label: intl.formatMessage(
                    messages.audienceSegmentSectionQueryTitle,
                  ),
                }}
                helpToolTipProps={{
                  title: intl.formatMessage(
                    messages.audienceSegmentCreationUserQueryFieldHelper,
                  ),
                }}
              />,
            )
          : queryLanguage === 'JSON_OTQL'
            ? this.generateUserQueryTemplate(
                <FormJSONQL
                  name={'query.query_text'}
                  component={JSONQL}
                  inputProps={{
                    datamartId: datamartId!,
                  }}
                />,
              )
            : this.generateUserQueryTemplate(
                <SelectorQL
                  datamartId={datamartId!}
                  organisationId={organisationId}
                  queryContainer={this.props.queryContainer}
                />,
              );
      default:
        return <div>Not Supported</div>;
    }
  };

  render() {
    const {
      handleSubmit,
      close,
      segmentType,
      segmentCreation,
      breadCrumbPaths,
      datamart,
      initialValues,
      goToSegmentTypeSelection,
    } = this.props;

    const type = segmentType
      ? segmentType
      : initialValues && initialValues.audienceSegment
        ? initialValues.audienceSegment.type
        : undefined;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.audienceSegmentSaveButton,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.audienceSegmentSectionGeneralTitle,
      component: (
        <GeneralFormSection
          segmentCreation={segmentCreation}
          segmentType={type as any}
          datamart={datamart}
        />
      ),
    });
    if (!(segmentCreation && (type === 'USER_PIXEL' || type === 'USER_LIST'))) {
      sections.push({
        id: 'properties',
        title:
          type === 'USER_PIXEL'
            ? messages.audienceSegmentSiderMenuProperties
            : type === 'USER_QUERY'
              ? messages.audienceSegmentSectionQueryTitle
              : messages.audienceSegmentSiderMenuImport,
        component: this.renderPropertiesField(),
      });
    }

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: FORM_ID,
    };

    if (goToSegmentTypeSelection) {
      sideBarProps.items.unshift({
        sectionId: 'type',
        title: messages.audienceSegmentSiderMenuType,
        onClick: goToSegmentTypeSelection,
        type: 'validated',
      });
    }

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
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
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
  })),
)(EditAudienceSegmentForm);

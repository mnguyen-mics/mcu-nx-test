import * as React from 'react';
import {
  Form,
  reduxForm,
  ConfigProps,
  InjectedFormProps,
  Field,
  GenericField,
  FieldArray,
  GenericFieldArray,
} from 'redux-form';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Layout, Alert } from 'antd';
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
import { AudienceSegmentFormData } from './domain';
import {
  FeedType,
  AudienceSegmentType,
  UserListSegment,
} from '../../../../models/audiencesegment/';
import * as FeatureSelectors from '../../../../redux/Features/selectors';
import GeneralFormSection from './Sections/GeneralFormSection';
import { UserListSection } from './Sections/list';
import { McsFormSection } from '../../../../utils/FormHelper';
import {
  QueryLanguage,
  DatamartResource,
} from '../../../../models/datamart/DatamartResource';
import { FormSection, FieldCtor } from '../../../../components/Form';
import FormCodeSnippet from '../../../../components/Form/FormCodeSnippet';
import OTQLInputEditor, { OTQLInputEditorProps } from './Sections/query/OTQL';
import { Path } from '../../../../components/ActionBar';
import JSONQL, { JSONQLInputEditorProps } from './Sections/query/JSONQL';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { ProcessingSelectionResource } from '../../../../models/processing';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import ProcessingActivitiesFormSection, {
  ProcessingActivitiesFormSectionProps,
} from '../../../Settings/DatamartSettings/Common/ProcessingActivitiesFormSection';

export const FORM_ID = 'audienceSegmentForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field as new () => GenericField<
  OTQLInputEditorProps
>;
const FormJSONQL: FieldCtor<JSONQLInputEditorProps> = Field as new () => GenericField<
  JSONQLInputEditorProps
>;

const ProcessingActivitiesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ProcessingActivitiesFormSectionProps
>;

export interface AudienceSegmentFormProps
  extends Omit<ConfigProps<AudienceSegmentFormData>, 'form'> {
  close: () => void;
  onSubmit: (audienceSegmentFormData: AudienceSegmentFormData) => void;
  breadCrumbPaths: Path[];
  audienceSegmentFormData: AudienceSegmentFormData;
  datamart?: DatamartResource;
  feedType?: FeedType;
  segmentCreation: boolean;
  queryLanguage?: QueryLanguage;
  segmentType?: AudienceSegmentType;
  goToSegmentTypeSelection?: () => void;
  initialProcessingSelectionsForWarning?: ProcessingSelectionResource[];
}

type Props = InjectedFormProps<AudienceSegmentFormProps> &
  AudienceSegmentFormProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  ValidatorProps &
  NormalizerProps;

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
        return initialValues &&
          initialValues.audienceSegment &&
          (initialValues.audienceSegment as UserListSegment).feed_type ===
            'TAG' ? (
          this.generateUserQueryTemplate(
            <FormJSONQL
              name={'query.query_text'}
              component={JSONQL}
              inputProps={{
                datamartId: datamartId!,
                context: 'GOALS',
                isEdge: (initialValues.audienceSegment as UserListSegment).subtype === "EDGE",
              }}
            />,
          )
        ) : (
          <UserListSection
            segmentId={audienceSegmentFormData.audienceSegment.id as string}
          />
        );
      case 'USER_PIXEL':
        return datamart &&
          audienceSegmentFormData.audienceSegment.technical_name ? (
          <FormCodeSnippet
            language="html"
            codeSnippet={`<img style="display:none" src="https://events.mediarithmics.com/v1/user_lists/pixel?$dat_token=${
              datamart.token
            }&$segtn=${encodeURIComponent(
              audienceSegmentFormData.audienceSegment.technical_name,
            )}" />`}
            copyToClipboard={true}
          />
        ) : (
          <Alert
            message={intl.formatMessage(
              messages.configureAudienceSegmentTechnicalName,
            )}
            type="warning"
          />
        );
      case 'USER_QUERY':
        return queryLanguage === 'OTQL' ? (
          this.generateUserQueryTemplate(
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
              datamartId={datamartId!}
            />,
          )
        ) : queryLanguage === 'JSON_OTQL' ? (
          this.generateUserQueryTemplate(
            <FormJSONQL
              name={'query.query_text'}
              component={JSONQL}
              inputProps={{
                datamartId: datamartId!,
                context: 'GOALS',
              }}
            />,
          )
        ) : (
          <Alert
            message={intl.formatMessage(messages.noMoreSupported)}
            type="warning"
          />
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
      change,
      hasFeature,
      initialProcessingSelectionsForWarning,
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

    if (hasFeature('datamart-user_choices') && type === 'USER_QUERY') {
      const genericFieldArrayProps = {
        formChange: change,
        rerenderOnEveryChange: true,
      };

      sections.push({
        id: 'processingActivities',
        title: messages.sectionProcessingActivitiesTitle,
        component: (
          <ProcessingActivitiesFieldArray
            name="processingActivities"
            component={ProcessingActivitiesFormSection}
            initialProcessingSelectionsForWarning={
              initialProcessingSelectionsForWarning
            }
            {...genericFieldArrayProps}
          />
        ),
      });
    }

    if (
      (!(segmentCreation && (type === 'USER_PIXEL' || type === 'USER_LIST')) ||
        (type === 'USER_LIST' &&
          initialValues &&
          initialValues.audienceSegment &&
          (initialValues.audienceSegment as UserListSegment).feed_type ===
            'TAG')) &&
      !(
        type === 'USER_LIST' &&
        initialValues &&
        initialValues.audienceSegment &&
        (initialValues.audienceSegment as UserListSegment).feed_type ===
          'SCENARIO'
      )
    ) {
      sections.push({
        id: 'properties',
        title:
          type === 'USER_PIXEL'
            ? messages.audienceSegmentSiderMenuProperties
            : type === 'USER_QUERY' ||
              (type === 'USER_LIST' &&
                initialValues &&
                initialValues.feedType === 'TAG')
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
  injectIntl,
  injectFeatures,
  withValidators,
  withNormalizer,
  reduxForm<AudienceSegmentFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect((state: MicsReduxState) => ({
    hasFeature: FeatureSelectors.hasFeature(state),
  })),
)(EditAudienceSegmentForm);

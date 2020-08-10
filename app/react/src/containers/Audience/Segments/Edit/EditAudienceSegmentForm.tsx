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
  getFormValues,
} from 'redux-form';
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
import { ProcessingSelectionResource } from '../../../../models/processing';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import ProcessingActivitiesFormSection, {
  ProcessingActivitiesFormSectionProps,
} from '../../../Settings/DatamartSettings/Common/ProcessingActivitiesFormSection';
import { isPartialUserListSegment } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { IQueryService } from '../../../../services/QueryService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { connect } from 'react-redux';

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

interface MapStateToProps {
  formValues: AudienceSegmentFormData;
}

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
  MapStateToProps &
  NormalizerProps;

class EditAudienceSegmentForm extends React.Component<Props> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

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
                isEdge:
                  (initialValues.audienceSegment as UserListSegment).subtype ===
                  'EDGE',
                queryHasChanged: this.hasQueryChanged(),
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
                queryHasChanged: this.hasQueryChanged(),
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

  hasQueryChanged = () => {
    const { formValues, initialValues } = this.props;

    return (
      (formValues.query &&
        initialValues.query &&
        formValues.query.query_text !== initialValues.query.query_text) ||
      (formValues.query &&
        !!formValues.query.query_text &&
        !initialValues.query)
    );
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
      audienceSegmentFormData,
      queryLanguage,
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

    const query = audienceSegmentFormData.query;
    if (
      type === 'USER_QUERY' &&
      queryLanguage === 'JSON_OTQL' &&
      datamart &&
      query
    ) {
      actionBarProps.convert2Otql = () => {
        return this._queryService.convertJsonOtql2Otql(datamart.id, query);
      };
    }

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

    const audienceSegment = audienceSegmentFormData.audienceSegment;

    const isUserQuery = type === 'USER_QUERY';

    const isUserList = isPartialUserListSegment(audienceSegment);

    if (hasFeature('datamart-user_choices') && (isUserQuery || isUserList)) {
      const genericFieldArrayProps = {
        formChange: change,
        rerenderOnEveryChange: true,
      };

      const isEdge =
        isPartialUserListSegment(audienceSegment) &&
        audienceSegment.subtype === 'EDGE';

      const processingAssociatedType = isEdge ? 'SEGMENT-EDGE' : 'SEGMENT';

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
            processingsAssociatedType={processingAssociatedType}
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
  connect(state => ({
    formValues: getFormValues(FORM_ID)(state),
  })),
)(EditAudienceSegmentForm);

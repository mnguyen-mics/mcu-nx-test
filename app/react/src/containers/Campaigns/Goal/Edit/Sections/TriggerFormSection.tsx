import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Row, Col, Alert } from 'antd';
import { FormSection } from '../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import OTQLInputEditor, {
  OTQLInputEditorProps,
} from '../../../../Audience/Segments/Edit/Sections/query/OTQL';
import { FieldCtor } from '../../../../../components/Form/index';
import { Field, getFormValues, GenericField } from 'redux-form';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { GoalFormData, isExistingGoal } from '../domain';
import FormCodeSnippet from '../../../../../components/Form/FormCodeSnippet';
import { FORM_ID } from '../GoalForm';
import { connect } from 'react-redux';
import JSONQL, {
  JSONQLInputEditorProps,
} from '../../../../Audience/Segments/Edit/Sections/query/JSONQL';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';

const FormJSONQL: FieldCtor<JSONQLInputEditorProps> = Field as new () => GenericField<JSONQLInputEditorProps>;
const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field as new () => GenericField<OTQLInputEditorProps>;

const messages = defineMessages({
  sectionSubtitle1: {
    id: 'goalEditor.section.trigger.subtitle1',
    defaultMessage: 'Conversion tracking through a trigger',
  },
  sectionTitle1: {
    id: 'goalEditor.section.trigger.subtitle2',
    defaultMessage: 'Trigger',
  },
  triggerPixelHelpTooltip: {
    id: 'goalEditor.section.trigger.pixel.modal.title',
    defaultMessage: 'Pixel for goal. Use this pixel url tracking to capture a conversion goal.',
  },
  audienceSegmentSectionQueryTitle: {
    id: 'edit.goal.form.section.query.title',
    defaultMessage: 'User Query',
  },
  audienceSegmentCreationUserQueryFieldHelper: {
    id: 'edit.goal.form.section.general.field.query.helper',
    defaultMessage:
      'Start your query with "SELECT \\{ id \\} FROM UserPoint WHERE" and add your conditions after the WHERE clause.',
  },
  newGoalPixelSection: {
    id: 'edit.goal.form.section.pixel.newGoal',
    defaultMessage: 'Please save your goal to generate your pixel code.',
  },
  goalAlreadyHasQueryTrigger: {
    id: 'edit.goal.form.section.pixel.goal.has.query.trigger',
    defaultMessage:
      "You can't trigger via pixel because your goal already has a trigger via query.",
  },
  configureDatamartToken: {
    id: 'edit.goal.form.section.pixel.configureDatamartToken',
    defaultMessage: 'The datamart token needs to be configured on the datamart.',
  },
  noMoreSupported: {
    id: 'edit.goal.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});

interface MapStateToProps {
  formValues: GoalFormData;
}

interface TriggerFormSectionProps extends ReduxFormChangeProps {
  initialValues: Partial<GoalFormData>;
  datamart: DatamartResource;
}

type Props = TriggerFormSectionProps & InjectedIntlProps & ValidatorProps & MapStateToProps;

class TriggerFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  renderQueryField = () => {
    const { datamart, intl } = this.props;

    const otqlForm = (
      <FormOTQL
        name={'query.query_text'}
        component={OTQLInputEditor}
        formItemProps={{
          label: intl.formatMessage(messages.audienceSegmentSectionQueryTitle),
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.audienceSegmentCreationUserQueryFieldHelper),
        }}
        datamartId={datamart.id!}
      />
    );

    const jsonOTQLForm = (
      <FormJSONQL
        name={'query.query_text'}
        component={JSONQL}
        inputProps={{
          datamartId: datamart.id!,
          isTrigger: true,
          context: 'GOALS',
          queryHasChanged: this.hasQueryChanged(),
        }}
      />
    );

    const noMoreSupportedComponent = (
      <Alert message={intl.formatMessage(messages.noMoreSupported)} type='warning' />
    );

    switch (this.props.formValues.queryLanguage) {
      case 'SELECTORQL':
        return noMoreSupportedComponent;
      case 'OTQL':
        return otqlForm;
      case 'JSON_OTQL':
        return jsonOTQLForm;
    }
  };

  hasQueryChanged = () => {
    const { formValues, initialValues } = this.props;

    return (
      (formValues.query &&
        initialValues.query &&
        formValues.query.query_text !== initialValues.query.query_text) ||
      (formValues.query && !!formValues.query.query_text && !initialValues.query)
    );
  };

  displayPixelSection = () => {
    const {
      intl: { formatMessage },
      datamart,
    } = this.props;
    return (
      <div>
        {isExistingGoal(this.props.formValues.goal) ? (
          datamart.token ? (
            <FormCodeSnippet
              language='html'
              codeSnippet={`<img style="display:none" src="https://events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=${datamart.token}&$goal_id=${this.props.formValues.goal.id}" />`}
              copyToClipboard={true}
              helpToolTipProps={{
                title: formatMessage(messages.triggerPixelHelpTooltip),
              }}
            />
          ) : (
            <Alert message={formatMessage(messages.configureDatamartToken)} type='warning' />
          )
        ) : (
          <Alert message={formatMessage(messages.newGoalPixelSection)} type='warning' />
        )}
      </div>
    );
  };

  render() {
    const pixelSectionVisible = this.props.formValues.triggerType === 'PIXEL';

    return (
      <div>
        <FormSection subtitle={messages.sectionSubtitle1} title={messages.sectionTitle1} />
        <Row>
          <Col span={24}>
            {pixelSectionVisible ? this.displayPixelSection() : this.renderQueryField()}
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<Props, TriggerFormSectionProps>(
  injectIntl,
  withValidators,
  connect(state => ({
    formValues: getFormValues(FORM_ID)(state),
  })),
)(TriggerFormSection);

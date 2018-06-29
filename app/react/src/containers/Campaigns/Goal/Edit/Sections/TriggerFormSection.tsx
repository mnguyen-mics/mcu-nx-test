import * as React from 'react';
import { compose } from 'recompose';
import _ from 'lodash';
import cuid from 'cuid';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Button, Row, Col, Alert } from 'antd';
import {
  FormSection,
  FormRadioGroupField,
  FormRadioGroup,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import {
  injectDatamart,
  InjectedDatamartProps,
} from '../../../../Datamart/index';
import OTQLInputEditor, {
  OTQLInputEditorProps,
} from '../../../../Audience/Segments/Edit/Sections/query/OTQL';
import { FieldCtor } from '../../../../../components/Form/index';
import SelectorQL from '../../../../../containers/Audience/Segments/Edit/Sections/query/SelectorQL';
import SelectorQLReadOnly from '../../../../../containers/Audience/Segments/Edit/Sections/query/SelectorQLReadOnly';
import { Field, getFormValues } from 'redux-form';
import { RouteComponentProps } from 'react-router';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { GoalFormData, isExistingGoal } from '../domain';
import FormCodeSnippet from '../../../../../components/Form/FormCodeSnippet';
import { FORM_ID } from '../GoalForm';
import { connect } from 'react-redux';

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field;

const messages = defineMessages({
  sectionSubtitle1: {
    id: 'goalEditor.section.trigger.subtitle1',
    defaultMessage: 'Conversion tracking through a trigger',
  },
  sectionTitle1: {
    id: 'goalEditor.section.trigger.subtitle2',
    defaultMessage: 'Trigger',
  },
  formCheckBoxText1: {
    id: 'goalEditor.section.trigger.formcheckbox.query',
    defaultMessage: 'Trigger via query',
  },
  formCheckBoxText2: {
    id: 'goalEditor.section.trigger.formcheckbox.pixel',
    defaultMessage: 'Trigger via pixel',
  },
  triggerPixelHelpTooltip: {
    id: 'goalEditor.section.trigger.pixel.modal.title',
    defaultMessage:
      'Pixel for goal. Use this pixel url tracking to capture a conversion goal.',
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
});

interface MapStateToProps {
  formValues: GoalFormData;
}

interface State {
  editQueryMode: boolean;
  queryContainer: any;
  queryContainerCopy: any;
}

interface TriggerFormSectionProps extends ReduxFormChangeProps {
  initialValues: Partial<GoalFormData>;
}

type Props = TriggerFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  MapStateToProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }>;

class TriggerFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editQueryMode: false,
      queryContainer: this.props.initialValues.queryContainer,
      queryContainerCopy: undefined,
    };
  }

  renderQueryField = () => {
    const {
      datamart,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const { editQueryMode } = this.state;

    return this.props.initialValues.queryLanguage === 'OTQL' ? (
      <FormOTQL
        name={'query.query_text'}
        component={OTQLInputEditor}
        formItemProps={{
          label: intl.formatMessage(messages.audienceSegmentSectionQueryTitle),
        }}
        helpToolTipProps={{
          title: intl.formatMessage(
            messages.audienceSegmentCreationUserQueryFieldHelper,
          ),
        }}
      />
    ) : editQueryMode ? (
      <SelectorQL
        datamartId={datamart.id}
        organisationId={organisationId}
        queryContainer={this.state.queryContainerCopy}
      />
    ) : (
      <SelectorQLReadOnly queryContainer={this.state.queryContainer} />
    );
  };

  updateQueryContainerAndCloseEditMode = () => {
    this.setState(
      prevState => {
        return {
          ...prevState,
          queryContainer: prevState.queryContainerCopy,
          editQueryMode: false,
        };
      },
      () => {
        this.props.formChange('queryContainer', this.state.queryContainer);
      },
    );
  };

  switchEditMode = () => {
    this.setState({
      editQueryMode: !this.state.editQueryMode,
      queryContainerCopy: _.clone(this.state.queryContainer),
    });
  };

  closeEditMode = () => {
    this.setState({
      editQueryMode: false,
    });
  };

  displayPixelSection = () => {
    const {
      intl: { formatMessage },
      datamart,
    } = this.props;
    return (
      <div>
        {isExistingGoal(this.props.formValues.goal) ? (
          <FormCodeSnippet
            language="html"
            codeSnippet={`<img style="display:none" src="https://events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=${
              datamart.token
            }&$goal_id=${this.props.formValues.goal.id}" />`}
            copyToClipboard={true}
            helpToolTipProps={{
              title: formatMessage(messages.triggerPixelHelpTooltip),
            }}
          />
        ) : (
          <Alert
            message={formatMessage(messages.newGoalPixelSection)}
            type="warning"
          />
        )}
      </div>
    );
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const radioOptions = [
      {
        title: formatMessage(messages.formCheckBoxText1),
        value: 'QUERY',
        id: cuid(),
      },
      {
        title: formatMessage(messages.formCheckBoxText2),
        value: 'PIXEL',
        id: cuid(),
      },
    ];

    const pixelSectionVisible = this.props.formValues.triggerMode === 'PIXEL';

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />
        {!isExistingGoal(this.props.formValues.goal) && (
          <Row style={{ paddingBottom: '24px' }}>
            <Col span={24}>
              <FormRadioGroupField
                name="triggerMode"
                component={FormRadioGroup}
                elements={radioOptions}
              />
            </Col>
          </Row>
        )}
        <Row>
          <Col span={24}>
            {pixelSectionVisible
              ? this.displayPixelSection()
              : this.renderQueryField()}
            <br />
            <div style={{ float: 'right' }}>
              {!pixelSectionVisible &&
                this.props.formValues.queryLanguage !== 'OTQL' &&
                (this.state.editQueryMode ? (
                  <div>
                    <Button
                      onClick={this.updateQueryContainerAndCloseEditMode}
                      type="primary"
                    >
                      <FormattedMessage
                        id="edit.goal.form.section.trigger.updateQueryContainer.ok"
                        defaultMessage="Ok"
                      />
                    </Button>
                    <Button onClick={this.closeEditMode} type="danger">
                      <FormattedMessage
                        id="edit.goal.form.section.trigger.updateQueryContainer.cancel"
                        defaultMessage="Cancel"
                      />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={this.switchEditMode}>
                    <FormattedMessage
                      id="edit.goal.form.section.trigger.button.trigger"
                      defaultMessage="Edit trigger"
                    />
                  </Button>
                ))}
            </div>
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
  injectDatamart,
)(TriggerFormSection);

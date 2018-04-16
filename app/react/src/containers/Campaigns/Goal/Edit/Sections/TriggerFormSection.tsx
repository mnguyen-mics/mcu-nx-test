import * as React from 'react';
import { compose } from 'recompose';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Radio, Button, Row, Col, message } from 'antd';
import { FormSection } from '../../../../../components/Form';
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
import { Field } from 'redux-form';
import { RouteComponentProps } from 'react-router';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { GoalFormData } from '../domain';
import PixelSection from '../../../../../components/PixelSection';

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
  triggerPixelModalTitle: {
    id: 'goalEditor.section.trigger.pixel.modal.title',
    defaultMessage: 'Pixel for goal',
  },
  triggerPixelModalMessage: {
    id: 'goalEditor.section.trigger.pixel.modal.message',
    defaultMessage:
      'Use this pixel url tracking to capture a conversion goal :',
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

interface State {
  pixelSectionVisible: boolean;
  editQueryMode: boolean;
  queryContainer: any;
  queryContainerCopy: any;
}

interface TriggerFormSectionProps extends ReduxFormChangeProps {
  initialValues: Partial<GoalFormData>;
  goalId?: string;
}

type Props = TriggerFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string; goalId: string }>;

class TriggerFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pixelSectionVisible:
        this.props.initialValues.triggerMode !== 'QUERY' ||
        (!!this.props.initialValues.goal &&
          !this.props.initialValues.goal.new_query_id),
      editQueryMode: false,
      queryContainer: this.props.initialValues.queryContainer,
      queryContainerCopy: this.props.initialValues.queryContainer.copy(),
    };
  }

  renderPropertiesField = () => {
    const {
      datamart,
      match: { params: { organisationId } },
      intl,
    } = this.props;

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
    ) : (
      <SelectorQL
        datamartId={datamart.id}
        organisationId={organisationId}
        queryContainer={this.state.queryContainerCopy}
      />
    );
  };

  renderPropertiesFieldReadOnly = () => {
    const { intl } = this.props;

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
    ) : (
      <SelectorQLReadOnly
        queryContainer={this.props.initialValues.queryContainer}
      />
    );
  };

  toggleSections = () => {
    if (
      this.props.initialValues.goal &&
      this.props.initialValues.goal.new_query_id
    ) {
      message.error(
        this.props.intl.formatMessage(messages.goalAlreadyHasQueryTrigger),
      );
    } else {
      this.setState({
        pixelSectionVisible: !this.state.pixelSectionVisible,
      });
      const newTriggerMode = this.state.pixelSectionVisible ? 'QUERY' : 'PIXEL';
      this.props.formChange('triggerMode', newTriggerMode);
    }
  };

  switchEditMode = () => {
    this.setState({
      editQueryMode: !this.state.editQueryMode,
      queryContainer: this.state.queryContainerCopy,
      queryContainerCopy: this.state.queryContainer,
    });
  };

  onClickCancel = () => {
    this.setState({
      editQueryMode: false,
    });
  }

  closeEditMode = () => {
    this.setState({
      editQueryMode: false,
    });
  };

  displayPixelSection = () => {
    const {
      intl: { formatMessage },
      match: { params: { goalId } },
      datamart,
    } = this.props;
    return (
      <div>
        {goalId || this.props.goalId ? (
          <div>
            {formatMessage(messages.triggerPixelModalTitle)}
            <br />
            {formatMessage(messages.triggerPixelModalMessage)}
            <br />
            <br />
            <PixelSection
              datamartToken={datamart.token}
              goalId={goalId || this.props.goalId}
            />
          </div>
        ) : (
          formatMessage(messages.newGoalPixelSection)
        )}
      </div>
    );
  };

  render() {
    const { intl: { formatMessage } } = this.props;
    const updateQueryContainerAndCloseEditMode = () => {
      this.setState(prevState => {
        return {
          ...prevState,
          queryContainer: prevState.queryContainerCopy.copy(),
        };
      });
      this.closeEditMode();
    };

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />
        <Row style={{ paddingBottom: '24px' }}>
          <Col span={24}>
            <Radio
              checked={!this.state.pixelSectionVisible}
              onChange={this.toggleSections}
            >
              {formatMessage(messages.formCheckBoxText1)}
            </Radio>
            <Radio
              checked={this.state.pixelSectionVisible}
              onChange={this.toggleSections}
              disabled={
                !!this.props.initialValues.goal &&
                !!this.props.initialValues.goal.new_query_id
              }
            >
              {formatMessage(messages.formCheckBoxText2)}
            </Radio>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {!this.state.pixelSectionVisible
              ? this.state.editQueryMode
                ? this.renderPropertiesField()
                : this.renderPropertiesFieldReadOnly()
              : this.displayPixelSection()}
            <br />
            <div style={{ float: 'right' }}>
              {!this.state.pixelSectionVisible ? (
                this.state.editQueryMode ? (
                  <div>
                    <Button
                      onClick={updateQueryContainerAndCloseEditMode}
                      type="primary"
                    >
                      <FormattedMessage
                        id="edit.goal.form.section.trigger.updateQueryContainer.ok"
                        defaultMessage="Ok"
                      />
                    </Button>
                    <Button onClick={this.onClickCancel} type="danger">
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
                )
              ) : (
                undefined
              )}
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
  injectDatamart,
)(TriggerFormSection);

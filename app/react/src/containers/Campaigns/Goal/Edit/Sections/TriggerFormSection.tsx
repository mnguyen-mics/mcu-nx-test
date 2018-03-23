import * as React from 'react';
import { compose } from 'recompose';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Checkbox, Button, Row, Col } from 'antd';
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
      pixelSectionVisible: this.props.initialValues.triggerMode !== 'QUERY',
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
    this.setState({
      pixelSectionVisible: !this.state.pixelSectionVisible,
    });
    const newTriggerMode = this.state.pixelSectionVisible ? 'QUERY' : 'PIXEL';
    this.props.formChange('triggerMode', newTriggerMode);
  };

  switchEditMode = () => {
    this.setState({
      editQueryMode: !this.state.editQueryMode,
      queryContainer: this.state.queryContainerCopy,
      queryContainerCopy: this.state.queryContainer,
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
      match: { params: { goalId } },
    } = this.props;
    return (
      <div>
        <p>{formatMessage(messages.triggerPixelModalTitle)}</p>
        <p>{formatMessage(messages.triggerPixelModalMessage)} : </p>
        <p>
          {' '}
          {`<img src='//events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=meddf17&$goal_id=${goalId ||
            this.props.goalId}' />`}
        </p>
      </div>
    );
  };

  render() {
    const {
      intl: { formatMessage },
      match: { params: { goalId } },
    } = this.props;
    const updateQueryContainerAndCloseEditMode = () => {
      this.setState(prevState => {
        return {
          ...prevState,
          queryContainer: prevState.queryContainerCopy.copy(),
        };
      });
      this.closeEditMode();
    };

    const isGoalId = goalId || this.props.goalId;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />
        <Row>
          <Col span={4}>
            <Checkbox
              checked={!this.state.pixelSectionVisible}
              onChange={isGoalId ? this.toggleSections : undefined}
            >
              {formatMessage(messages.formCheckBoxText1)}
            </Checkbox>
            {isGoalId && (
              <div>
                <br />
                <Checkbox
                  checked={this.state.pixelSectionVisible}
                  onChange={this.toggleSections}
                >
                  {formatMessage(messages.formCheckBoxText2)}
                </Checkbox>
              </div>
            )}
          </Col>
          <Col span={20}>
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
                    <Button onClick={this.switchEditMode} type="danger">
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

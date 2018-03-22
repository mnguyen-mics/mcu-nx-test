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
import { QueryLanguage } from '../../../../../models/datamart/DatamartResource';
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
  displaySection: boolean;
  editQueryMode: boolean;
  queryContainer: any;
}

interface TriggerFormSectionProps {
  queryObject: {
    queryContainer?: any;
    queryContainerCopy?: any;
    queryLanguage?: QueryLanguage;
    updateQueryContainer: () => void;
  };
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
      displaySection: false,
      editQueryMode: false,
      queryContainer: this.props.queryObject.queryContainer,
    };
  }

  renderPropertiesField = () => {
    const {
      datamart,
      queryObject: { queryContainerCopy, queryLanguage },
      match: { params: { organisationId } },
      intl,
    } = this.props;

    return queryLanguage === 'OTQL' ? (
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
        queryContainer={queryContainerCopy}
      />
    );
  };

  renderPropertiesFieldReadOnly = () => {
    const { queryObject: { queryContainer, queryLanguage }, intl } = this.props;

    return queryLanguage === 'OTQL' ? (
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
      <SelectorQLReadOnly queryContainer={queryContainer} />
    );
  };

  toggleSections = () => {
    this.setState({
      displaySection: !this.state.displaySection,
    });
  };

  switchEditMode = () => {
    this.setState({
      editQueryMode: !this.state.editQueryMode,
      queryContainer: this.props.queryObject.queryContainerCopy,
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
          {`<img src='//events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=meddf17&$goal_id=${goalId || this.props.goalId}' />`}
        </p>
      </div>
    );
  };

  render() {
    const {
      intl: { formatMessage },
      match: { params: { goalId } },
      queryObject: { updateQueryContainer },
    } = this.props;
    const updateQueryContainerAndCloseEditMode = () => {
      updateQueryContainer();
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
              checked={!this.state.displaySection}
              onChange={isGoalId ? this.toggleSections : undefined}
            >
              {formatMessage(messages.formCheckBoxText1)}
            </Checkbox>
            {isGoalId && (
              <div>
                <br />
                <Checkbox
                  checked={this.state.displaySection}
                  onChange={this.toggleSections}
                >
                  {formatMessage(messages.formCheckBoxText2)}
                </Checkbox>
              </div>
            )}
          </Col>
          <Col span={20}>
            {!this.state.displaySection
              ? this.state.editQueryMode
                ? this.renderPropertiesField()
                : this.renderPropertiesFieldReadOnly()
              : this.displayPixelSection()}
            <br />
            <div style={{ float: 'right' }}>
              {!this.state.displaySection ? (
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

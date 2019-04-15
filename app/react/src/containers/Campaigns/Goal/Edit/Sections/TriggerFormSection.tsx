import * as React from 'react';
import { compose } from 'recompose';
import _ from 'lodash';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Button, Row, Col, Alert } from 'antd';
import {
  FormSection,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import OTQLInputEditor, {
  OTQLInputEditorProps,
} from '../../../../Audience/Segments/Edit/Sections/query/OTQL';
import { FieldCtor } from '../../../../../components/Form/index';
import SelectorQL from '../../../../../containers/Audience/Segments/Edit/Sections/query/SelectorQL';
import SelectorQLReadOnly from '../../../../../containers/Audience/Segments/Edit/Sections/query/SelectorQLReadOnly';
import { Field, getFormValues, GenericField } from 'redux-form';
import { RouteComponentProps, withRouter } from 'react-router';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { GoalFormData, isExistingGoal } from '../domain';
import FormCodeSnippet from '../../../../../components/Form/FormCodeSnippet';
import { FORM_ID } from '../GoalForm';
import { connect } from 'react-redux';
import JSONQL, { JSONQLInputEditorProps } from '../../../../Audience/Segments/Edit/Sections/query/JSONQL';
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
  configureDatamartToken: {
    id: 'edit.goal.form.section.pixel.configureDatamartToken',
    defaultMessage: 'The datamart token needs to be configured on the datamart.'
  }
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
  datamart: DatamartResource;
}

type Props = TriggerFormSectionProps &
InjectedIntlProps &
ValidatorProps &
MapStateToProps &
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

    const otqlForm = 
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
        datamartId={datamart.id!}
      />
    
    const jsonOTQLForm = 
      <FormJSONQL
        name={'query.query_text'}
        component={JSONQL}
        inputProps={{
          datamartId: datamart.id!,
          isTrigger: true,
          context: 'GOALS',
        }}
      />
    
    const selectorQLForm = editQueryMode ?
      <SelectorQL
        datamartId={datamart.id}
        organisationId={organisationId}
        queryContainer={this.state.queryContainerCopy}
      /> : <SelectorQLReadOnly queryContainer={this.state.queryContainer} />

    switch (this.props.formValues.queryLanguage) {
      case 'SELECTORQL': return selectorQLForm;
      case 'OTQL': return otqlForm;
      case 'JSON_OTQL': return jsonOTQLForm;
    }    
      
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
        {isExistingGoal(this.props.formValues.goal) ?
          (datamart.token ?
            (
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
            ) :
            (
              <Alert
                message={formatMessage(messages.configureDatamartToken)}
                type="warning"
              />
            )
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
    
    const pixelSectionVisible = this.props.formValues.triggerType === 'PIXEL';
    
    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />
        <Row>
          <Col span={24}>
            {pixelSectionVisible
              ? this.displayPixelSection()
              : this.renderQueryField()}
            <br />
            <div style={{ float: 'right' }}>
              {!pixelSectionVisible &&
                this.props.formValues.queryLanguage === 'SELECTORQL' &&
                (this.state.editQueryMode ? (
                  <div>
                    <Button
                      onClick={this.updateQueryContainerAndCloseEditMode}
                      type="primary"
                    >
                      <FormattedMessage
                        id="goal.edit.triggerSection.updateQueryContainer.ok"
                        defaultMessage="Ok"
                      />
                    </Button>
                    <Button onClick={this.closeEditMode} type="danger">
                      <FormattedMessage
                        id="goal.edit.triggerSection.updateQueryContainer.cancel"
                        defaultMessage="Cancel"
                      />
                    </Button>
                  </div>
                ) : (
                    <Button onClick={this.switchEditMode}>
                      <FormattedMessage
                        id="goal.edit.triggerSection.updateQueryContainer.editTrigger"
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
  withRouter,
  withValidators,
  connect(state => ({
    formValues: getFormValues(FORM_ID)(state),
  })),
)(TriggerFormSection);
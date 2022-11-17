import React from 'react';
import { compose } from 'recompose';
import { Layout, message } from 'antd';
import { Form } from '@ant-design/compatible';
import { change, reduxForm, getFormValues } from 'redux-form';
import { injectIntl, WrappedComponentProps, defineMessages, FormattedMessage } from 'react-intl';
import { FormSection, withValidators } from '../../../components/Form';
import { ValidatorProps } from '../../../components/Form/withValidators';
import { WizardValidObjectTypeField, getValidObjectType, getEventsNames } from './domain';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { connect, DispatchProp } from 'react-redux';
import {
  QueryDocument,
  ObjectNode,
  FieldNode,
} from '../../../models/datamart/graphdb/QueryDocument';
import { ScenarioExitConditionFormResource } from '../../../models/automations/automations';
import { Loading } from '../../../components';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../components/Layout/FormLayoutActionbar';
import { QueryLanguage } from '../../../models/datamart/DatamartResource';
import { FormSearchObjectField } from '../../Audience/AdvancedSegmentBuilder/Edit/Sections/Field/FieldNodeForm';
import FormSearchObject from '../../../components/Form/FormSelect/FormSearchObject';
import { IQueryService } from '../../../services/QueryService';

const FORM_ID = 'scenarioExitConditionForm';

export interface ScenarioExitConditionAutomationFormProps {
  exitCondition: ScenarioExitConditionFormResource;
  close: () => void;
  disabled: boolean;
}

interface MapStateToProps {
  formValues: {
    datamart_id: string;
    query_language: QueryLanguage;
    query_text: string;
  };
}

type State = {
  queryText: string;
  isLoading: boolean;
  validObjectType?: WizardValidObjectTypeField;
};

type Props = ScenarioExitConditionAutomationFormProps &
  WrappedComponentProps &
  ValidatorProps &
  DispatchProp<any> &
  MapStateToProps &
  InjectedNotificationProps;

class ScenarioExitConditionAutomationForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);

    let events: string[] = [];
    if (props.exitCondition.formData.query_text) {
      const query = JSON.parse(props.exitCondition.formData.query_text) as QueryDocument;
      const where: ObjectNode | undefined = query.where ? (query.where as ObjectNode) : undefined;
      const expressions: FieldNode | undefined = where
        ? (where.expressions[0] as FieldNode)
        : undefined;
      events = expressions && expressions.comparison ? expressions.comparison.values : [];

      if (this.props.dispatch) this.props.dispatch(change(FORM_ID, 'events', events));
    }

    this.state = {
      queryText: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      intl: { formatMessage },
      formValues: { datamart_id },
      notifyError,
    } = this.props;

    if (dispatch) dispatch(change(FORM_ID, 'query_language', 'JSON_OTQL'));

    getValidObjectType(datamart_id, this._runtimeSchemaService)
      .then(validObjectType => {
        if (!validObjectType || !validObjectType.objectTypeQueryName) {
          message.warning(formatMessage(messages.schemaNotSuitableForAction));
          return;
        }
        this.setState({
          validObjectType,
          isLoading: false,
        });
      })
      .catch(error => notifyError(error));
  }

  onEventsChange = (event?: any, newValue?: any, previousValue?: any) => {
    const { validObjectType } = this.state;

    if (!validObjectType || !validObjectType.objectTypeQueryName) return;

    const query: QueryDocument = {
      from: 'UserPoint',
      operations: [
        {
          directives: [],
          selections: [{ name: 'id' }],
        },
      ],
      where: {
        boolean_operator: 'OR',
        field: validObjectType.objectTypeQueryName,
        type: 'OBJECT',
        expressions: [
          {
            type: 'FIELD',
            field: validObjectType.fieldName,
            comparison: {
              type: 'STRING',
              operator: 'EQ',
              values: newValue,
            },
          },
        ],
      },
    };

    if (this.props.dispatch)
      this.props.dispatch(change(FORM_ID, 'query_text', JSON.stringify(query)));
  };

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      close,
      disabled,
      formValues: { datamart_id },
    } = this.props;

    const { isLoading, validObjectType } = this.state;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: [formatMessage(messages.title)],
      message: messages.save,
      onClose: close,
      disabled: disabled || isLoading,
    };

    const fetchListMethod = (k: string) => {
      return getEventsNames(datamart_id, validObjectType!, this._queryService);
    };
    const fetchSingleMethod = (event: string) => {
      return Promise.resolve({ key: event, label: event, value: event });
    };

    return (
      <Layout className='mcs-reactToEventAutomation edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-content mcs-legacy_form_container'}>
          {isLoading ? (
            <Loading isFullScreen={true} />
          ) : (
            <Form
              id={FORM_ID}
              className='edit-layout mcs-content-container mcs-form-container'
              layout={'vertical'}
            >
              <div className='mcs-exitConditionAutomation_description'>
                <FormSection title={messages.descriptionTitle} />
                <div className='mcs-exitConditionAutomation_descriptionSubtitle'>
                  <FormattedMessage {...messages.descriptionSubtitle} />
                </div>
                <div className='mcs-exitConditionAutomation_descriptionSubtitle'>
                  <FormattedMessage {...messages.descriptionSubtitleExplanation} />
                </div>
              </div>
              <FormSection title={messages.configurationTitle} />
              <div className='mcs-reactToEventAutomation_chooseEventNameContainer'>
                <FormSearchObjectField
                  name={'events'}
                  component={FormSearchObject}
                  onChange={this.onEventsChange}
                  fetchListMethod={fetchListMethod}
                  fetchSingleMethod={fetchSingleMethod}
                  formItemProps={{
                    label: formatMessage(messages.eventName),
                    required: true,
                  }}
                  helpToolTipProps={{
                    title: formatMessage(messages.eventNameHelp),
                  }}
                  small={true}
                  validate={isRequired}
                  selectProps={{
                    mode: 'tags',
                    disabled: disabled,
                  }}
                  loadOnlyOnce={true}
                />
              </div>
            </Form>
          )}
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ScenarioExitConditionAutomationFormProps>(
  injectIntl,
  withValidators,
  injectNotifications,
  reduxForm<{}, ScenarioExitConditionAutomationFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(ScenarioExitConditionAutomationForm);

const messages = defineMessages({
  title: {
    id: 'automation.builder.node.scenarioExitConditionForm.title',
    defaultMessage: 'Exit condition',
  },
  save: {
    id: 'automation.builder.node.scenarioExitConditionForm.save.button',
    defaultMessage: 'Update',
  },
  eventName: {
    id: 'automation.builder.node.scenarioExitConditionForm.eventName',
    defaultMessage: 'Event names',
  },
  eventNameHelp: {
    id: 'automation.builder.node.scenarioExitConditionForm.eventNameHelp',
    defaultMessage:
      'When receiving one of these events, the user will instantly leave the automation.',
  },
  schemaNotSuitableForAction: {
    id: 'automation.builder.node.scenarioExitConditionForm.schemaNotSuitableForAction',
    defaultMessage: 'Schema is not suitable for this action.',
  },
  descriptionTitle: {
    id: 'automation.builder.node.scenarioExitConditionForm.description.title',
    defaultMessage: 'Description',
  },
  descriptionSubtitle: {
    id: 'automation.builder.node.scenarioExitConditionForm.description.subtitle',
    defaultMessage:
      'If you add an exit condition, users will leave the automation as soon as this condition is met.',
  },
  descriptionSubtitleExplanation: {
    id: 'automation.builder.node.scenarioExitConditionForm.description.subtitle.explanation',
    defaultMessage: `For instance, if you plan to send an email to all users who've added an item to their cart but have not completed a transaction,
    you could set a "transaction confirmed" event as an exit condition. This way, if a "transaction confirmed" event is received,
    the users will leave the automation and not receive an email.`,
  },
  configurationTitle: {
    id: 'automation.builder.node.scenarioExitConditionForm.configuration.title',
    defaultMessage: 'Configuration',
  },
});

import React from 'react';
import { compose } from 'recompose';
import { Layout, message, Radio } from 'antd';
import { Form } from '@ant-design/compatible';
import cuid from 'cuid';
import {
  change,
  reduxForm,
  getFormValues,
  FieldArray,
  GenericFieldArray,
  Field,
  InjectedFormProps,
} from 'redux-form';
import { injectIntl, WrappedComponentProps, defineMessages, FormattedMessage } from 'react-intl';
import {
  withValidators,
  FormSection,
  FormCheckboxGroupField,
  FormCheckboxGroup,
} from '../../../../../../components/Form';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import {
  WizardValidObjectTypeField,
  getValidObjectTypesForWizardReactToEvent,
  getValidFieldsForWizardReactToEvent,
  wizardValidObjectTypes,
  getEventsNames,
  getDatamartPredefinedEventNames,
  PredefinedEventNames,
  predefinedEventNames,
  StorylineNodeModel,
} from './../../../domain';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { connect, DispatchProp } from 'react-redux';
import {
  QueryDocument,
  ObjectNode,
  FieldNode,
  isObjectNode,
  isFieldNode,
  ObjectTreeExpressionNodeShape,
  QueryBooleanOperator,
} from '../../../../../../models/datamart/graphdb/QueryDocument';
import { Loading } from '../../../../../../components';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { reducePromises } from '../../../../../../utils/PromiseHelper';
import { IRuntimeSchemaService } from '../../../../../../services/RuntimeSchemaService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import { QueryLanguage } from '../../../../../../models/datamart/DatamartResource';
import { FormSearchObjectField } from '../../../../../Audience/AdvancedSegmentBuilder/Edit/Sections/Field/FieldNodeForm';
import FormSearchObject from '../../../../../../components/Form/FormSelect/FormSearchObject';
import { IQueryService } from '../../../../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import { QueryInputAutomationFormData } from './../../../AutomationNode/Edit/domain';
import { QueryInputNodeResource } from '../../../../../../models/automations/automations';
import EventPropertyFormSection, {
  EventPropertyFormSectionProps,
} from './EventPropertyFormSection';

export const FORM_ID = 'reactToEventForm';

const EventProperFormFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  EventPropertyFormSectionProps
>;

export interface ReactToEventAutomationFormProps {
  storylineNodeModel: StorylineNodeModel;
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  disabled: boolean;
  initialValues: QueryInputAutomationFormData;
}

interface ReactToEventAutomationFormData {
  datamart_id: string;
  query_language: QueryLanguage;
  query_text: string;
  events: string[];
  eventPropertyFormSection?: Array<{
    value: string;
    expression: ObjectTreeExpressionNodeShape;
  }>;
  standardEventNames: PredefinedEventNames[];
}

interface MapStateToProps {
  formValues: ReactToEventAutomationFormData;
}

type State = {
  formMode: 'REACT_TO_EVENT_STANDARD' | 'REACT_TO_EVENT_ADVANCED';
  isLoading: boolean;
  validObjectType?: WizardValidObjectTypeField;
  objectType?: ObjectLikeTypeInfoResource;
  objectTypes: ObjectLikeTypeInfoResource[];
  standardEventNames: PredefinedEventNames[];
  runtimeSchemaId?: string;
  standardEventsQueryText: string;
  advancedQueryText: string;
  booleanOperator: QueryBooleanOperator;
};

type Props = ReactToEventAutomationFormProps &
  InjectedFormProps<ReactToEventAutomationFormData, ReactToEventAutomationFormProps> &
  WrappedComponentProps &
  ValidatorProps &
  DispatchProp<any> &
  MapStateToProps &
  InjectedNotificationProps;

class ReactToEventAutomationForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  _isMounted = false;

  constructor(props: Props) {
    super(props);

    const { storylineNodeModel: storylineNodeModel, dispatch } = this.props;

    const node = storylineNodeModel.node as QueryInputNodeResource;
    const {
      formData: { query_text, uiCreationMode },
    } = node;

    if (query_text && dispatch) {
      dispatch(change(FORM_ID, 'query_text', query_text));
    } else {
      const query: QueryDocument = {
        from: 'UserPoint',
        operations: [
          {
            directives: [],
            selections: [{ name: 'id' }],
          },
        ],
        where: {
          type: 'OBJECT',
          expressions: [],
          field: '',
          boolean_operator: 'AND',
        },
      };
      if (dispatch) {
        dispatch(change(FORM_ID, 'query_text', JSON.stringify(query)));
      }
    }

    if (dispatch) dispatch(change(FORM_ID, 'uiCreationMode', uiCreationMode));

    this.state = {
      formMode: uiCreationMode,
      isLoading: true,
      objectTypes: [],
      standardEventNames: [],
      standardEventsQueryText: query_text || '',
      advancedQueryText: query_text || '',
      booleanOperator: 'AND',
    };
  }

  componentDidMount() {
    const {
      dispatch,
      intl: { formatMessage },
      storylineNodeModel: storylineNodeModel,
      initialValues,
    } = this.props;

    const node = storylineNodeModel.node as QueryInputNodeResource;
    const {
      formData: { query_text, datamart_id },
    } = node;

    this._isMounted = true;

    if (dispatch) dispatch(change(FORM_ID, 'query_language', 'JSON_OTQL'));

    this.getValidObjectType()
      .then(validObjectType => {
        if (!validObjectType || !validObjectType.objectTypeQueryName) {
          message.warning(formatMessage(messages.schemaNotSuitableForAction));
          return;
        }

        if (query_text) {
          const query = JSON.parse(query_text);
          let events: string[] = [];
          let eventPropertyFormSection = [];

          this.setState({
            booleanOperator: query.where.boolean_operator,
          });

          if (query.where && isObjectNode(query.where) && query.where.expressions) {
            const expressionEventNames = query.where.expressions.filter((expression: FieldNode) => {
              if (isFieldNode(expression)) return expression.field === validObjectType.fieldName;
              return true;
            });

            if (expressionEventNames.length > 0) events = expressionEventNames[0].comparison.values;

            eventPropertyFormSection = query.where.expressions
              .filter((expression: FieldNode) => {
                if (isFieldNode(expression)) return expression.field !== validObjectType.fieldName;
                return true;
              })
              .map((expression: ObjectNode | FieldNode) => {
                const generateValue = (n: ObjectNode | FieldNode): string => {
                  if (isFieldNode(n)) return n.field;
                  return `${n.field} ${generateValue(n.expressions[0] as ObjectNode | FieldNode)}`;
                };
                return {
                  expression: expression,
                  value: generateValue(expression),
                  key: cuid(),
                };
              });
          }

          if (dispatch) {
            dispatch(change(FORM_ID, 'events', events));
            dispatch(change(FORM_ID, 'eventPropertyFormSection', eventPropertyFormSection));
            dispatch(
              change(
                FORM_ID,
                'standardEventNames',
                predefinedEventNames.filter(e => events.includes(e)),
              ),
            );
          }
        }

        this.setState({
          validObjectType,
        });

        const datamartId = datamart_id ? datamart_id : initialValues.datamart_id!;
        return getDatamartPredefinedEventNames(
          datamartId,
          validObjectType!,
          this._queryService,
        ).then(eventNames => {
          this.setState({ standardEventNames: eventNames });
        });
      })
      .then(() => this.setState({ isLoading: false }));
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      formValues: { eventPropertyFormSection, query_text, events, standardEventNames },
      dispatch,
    } = this.props;

    const { formMode, validObjectType } = this.state;

    if (validObjectType && query_text) {
      const newQuery = JSON.parse(query_text);
      newQuery.where.expressions = [];

      newQuery.where.expressions.push({
        type: 'FIELD',
        field: validObjectType.fieldName,
        comparison: {
          type: 'STRING',
          operator: 'EQ',
          values: formMode === 'REACT_TO_EVENT_ADVANCED' ? events : standardEventNames,
        },
      });

      if (formMode === 'REACT_TO_EVENT_ADVANCED' && eventPropertyFormSection) {
        eventPropertyFormSection.map(eventProperty => {
          if (eventProperty.expression) {
            const hasValues = (tree: ObjectTreeExpressionNodeShape): boolean => {
              if (tree.type === 'FIELD') return !!tree.comparison?.values?.[0];
              return hasValues(tree.expressions[0]);
            };

            if (hasValues(eventProperty.expression))
              newQuery.where.expressions.push(eventProperty.expression);
          }
        });
      }

      const newQueryText = JSON.stringify(newQuery);
      if (query_text !== newQueryText && dispatch)
        dispatch(change(FORM_ID, 'query_text', newQueryText));
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getValidObjectType = (): Promise<WizardValidObjectTypeField | undefined> => {
    const { notifyError, storylineNodeModel, initialValues } = this.props;

    const node = storylineNodeModel.node as QueryInputNodeResource;

    const datamartId = node.formData.datamart_id
      ? node.formData.datamart_id
      : initialValues.datamart_id!;

    return this._runtimeSchemaService
      .getRuntimeSchemas(datamartId)
      .then(({ data: schemas }) => {
        const runtimeSchema = schemas.find(schema => schema.status === 'LIVE');

        if (!runtimeSchema) return;

        this.setState({ runtimeSchemaId: runtimeSchema.id });

        return this._runtimeSchemaService
          .getObjectTypesDeep(datamartId, runtimeSchema.id)
          .then(({ data: objectTypes }) => {
            return reducePromises(
              getValidObjectTypesForWizardReactToEvent(objectTypes).map(validObjectType => {
                return this._runtimeSchemaService
                  .getFields(datamartId, runtimeSchema.id, validObjectType.id)
                  .then(({ data: fields }) => {
                    return {
                      objectType: validObjectType,
                      validFields: getValidFieldsForWizardReactToEvent(validObjectType, fields),
                    };
                  });
              }),
            ).then(validObjectTypes => {
              /*
              Here we need to find a WizardValidObjectTypeField
              For each WizardValidObjectTypeField we check if we have an objectType with 
              the same WizardValidObjectTypeField.objectTypeName in validObjectTypes and if 
              its fields contain at least one with the WizardValidObjectTypeField.fieldName.
              */
              const wizardValidObjectTypesFiltered = wizardValidObjectTypes.find(
                automationWizardValidObjectType =>
                  !!validObjectTypes.find(
                    validObjectType =>
                      validObjectType.objectType.name ===
                        automationWizardValidObjectType.objectTypeName &&
                      !!validObjectType.validFields.find(
                        of => of.name === automationWizardValidObjectType.fieldName,
                      ),
                  ),
              );

              if (!wizardValidObjectTypesFiltered) return;

              /*
              We need the ObjectType UserPoint as it refers to our valid object type, 
              thus we can have its usable name to use in a query.
              For example: ActivityEvent => activity_events
              */
              const userPointObjectType = objectTypes.find(o => o.name === 'UserPoint');

              if (userPointObjectType) {
                const field = userPointObjectType.fields.find(
                  f =>
                    f.field_type.match(/\w+/)![0] === wizardValidObjectTypesFiltered.objectTypeName,
                );

                if (field) {
                  this.setState({
                    objectType: objectTypes.find(
                      ot => ot.name === wizardValidObjectTypesFiltered.objectTypeName,
                    ),
                    objectTypes,
                  });
                  return {
                    ...wizardValidObjectTypesFiltered,
                    objectTypeQueryName: field ? field.name : undefined,
                  };
                } else return;
              } else return;
            });
          });
      })
      .catch(error => {
        notifyError(error);
        return undefined;
      });
  };

  onEventsChange = (event?: any, newValue?: any, previousValue?: any) => {
    const {
      formValues: { query_text },
    } = this.props;
    const { formMode, validObjectType, booleanOperator } = this.state;

    if (!validObjectType || !validObjectType.objectTypeQueryName) return;

    const query = JSON.parse(query_text);
    let where: ObjectNode = query.where;

    if (where && isObjectNode(where)) {
      const extractExpressions = where.expressions.filter(expression => {
        if (isFieldNode(expression)) return expression.field !== validObjectType.fieldName;
        return true;
      }) as ObjectTreeExpressionNodeShape[];

      where = {
        boolean_operator: booleanOperator,
        field: validObjectType.objectTypeQueryName,
        type: 'OBJECT',
        expressions: extractExpressions,
      };

      where.expressions.push({
        type: 'FIELD',
        field: validObjectType.fieldName,
        comparison: {
          type: 'STRING',
          operator: 'EQ',
          values: newValue,
        },
      });

      query.where = where;

      const newQueryText = JSON.stringify(query);

      formMode === 'REACT_TO_EVENT_STANDARD'
        ? this.setState({ standardEventsQueryText: newQueryText })
        : this.setState({ advancedQueryText: newQueryText });

      if (this.props.dispatch) this.props.dispatch(change(FORM_ID, 'query_text', newQueryText));
    }
  };

  onBooleanOperatorChange = () => {
    const {
      formValues: { query_text },
    } = this.props;

    const { booleanOperator } = this.state;

    const newBooleanOperator = booleanOperator === 'AND' ? 'OR' : 'AND';

    if (this.props.dispatch) {
      const query = JSON.parse(query_text);
      query.where.boolean_operator = newBooleanOperator;
      const newQueryText = JSON.stringify(query);
      this.props.dispatch(change(FORM_ID, 'query_text', newQueryText));
    }

    this.setState({
      booleanOperator: newBooleanOperator,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      close,
      disabled,
      breadCrumbPaths,
      storylineNodeModel: storylineNodeModel,
      initialValues,
      dispatch,
      change: injectedFormPropsChange,
    } = this.props;

    const {
      formMode,
      isLoading,
      validObjectType,
      runtimeSchemaId,
      standardEventNames,
      advancedQueryText,
      standardEventsQueryText,
      booleanOperator,
      objectType,
      objectTypes,
    } = this.state;

    const node = storylineNodeModel.node as QueryInputNodeResource;

    const datamartId = node.formData.datamart_id
      ? node.formData.datamart_id
      : initialValues.datamart_id!;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.save,
      onClose: close,
      disabled: disabled || isLoading,
    };

    const fetchListMethod = (k: string) => {
      return getEventsNames(datamartId, validObjectType!, this._queryService);
    };
    const fetchSingleMethod = (event: string) => {
      return Promise.resolve({ key: event, label: event, value: event });
    };

    const switchMode = () => {
      if (formMode === 'REACT_TO_EVENT_STANDARD')
        this.setState({ formMode: 'REACT_TO_EVENT_ADVANCED' }, () => {
          if (dispatch) {
            dispatch(change(FORM_ID, 'uiCreationMode', 'REACT_TO_EVENT_ADVANCED'));
            if (standardEventsQueryText)
              dispatch(change(FORM_ID, 'query_text', advancedQueryText || standardEventsQueryText));
          }
        });
      else
        this.setState({ formMode: 'REACT_TO_EVENT_STANDARD' }, () => {
          if (dispatch) {
            dispatch(change(FORM_ID, 'uiCreationMode', 'REACT_TO_EVENT_STANDARD'));
            if (standardEventsQueryText)
              dispatch(change(FORM_ID, 'query_text', standardEventsQueryText));
          }
        });
    };

    return (
      <Layout className='mcs-reactToEventAutomation edit-layout mcs-legacy_form_container'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-content'}>
          <Form
            id={FORM_ID}
            className='mcs-reactToEventAutomation_form edit-layout mcs-content-container mcs-form-container'
            layout={'vertical'}
          >
            <FormSection
              title={messages.reactToEventFormSectionTitle}
              subtitle={messages.reactToEventFormSectionSubtitle}
            />
            <FormSection
              title={messages.reactToEventFormSectionConfigurationTitle}
              subtitle={messages.reactToEventFormSectionConfigurationSubtitle}
            />
            <Radio.Group
              className='mcs-reactToEventAutomation_buttonSwitchMode'
              defaultValue={formMode}
              onChange={switchMode}
              buttonStyle='solid'
              disabled={isLoading}
            >
              <Radio.Button
                className='mcs-reactToEventAutomation_buttonSwitchMode_reactToEventStandard'
                value='REACT_TO_EVENT_STANDARD'
              >
                {formatMessage(messages.standardEvents)}
              </Radio.Button>
              <Radio.Button
                className='mcs-reactToEventAutomation_buttonSwitchMode_reactToEventAdvanced'
                value='REACT_TO_EVENT_ADVANCED'
              >
                {formatMessage(messages.advanced)}
              </Radio.Button>
            </Radio.Group>

            {formMode === 'REACT_TO_EVENT_STANDARD' ? (
              <div className='mcs-reactToEventAutomation_standardEventsForm'>
                {isLoading ? (
                  <Loading isFullScreen={true} />
                ) : standardEventNames.length > 0 ? (
                  <FormCheckboxGroupField
                    name='standardEventNames'
                    className='mcs-reactToEventAutomation_standardEventsForm-options'
                    component={FormCheckboxGroup}
                    disabled={disabled}
                    validate={isRequired}
                    onChange={this.onEventsChange}
                    options={standardEventNames.sort().map(eventName => {
                      return {
                        label: formatMessage(messages[eventName]),
                        value: eventName,
                      };
                    })}
                  />
                ) : (
                  <FormattedMessage {...messages.noStandardEvents} />
                )}
              </div>
            ) : (
              <div className='mcs-reactToEventAutomation_advancedForm'>
                {runtimeSchemaId && validObjectType ? (
                  <div>
                    <div className='mcs-reactToEventAutomation_chooseEventNameContainer'>
                      <FormSearchObjectField
                        name='events'
                        component={FormSearchObject}
                        onChange={this.onEventsChange}
                        fetchListMethod={fetchListMethod}
                        fetchSingleMethod={fetchSingleMethod}
                        formItemProps={{
                          label: formatMessage(messages.eventName),
                          required: true,
                        }}
                        small={true}
                        validate={isRequired}
                        selectProps={{
                          mode: 'tags',
                          disabled,
                        }}
                        loadOnlyOnce={true}
                      />
                    </div>
                    <hr />
                    {objectType && (
                      <EventProperFormFieldArray
                        name='eventPropertyFormSection'
                        component={EventPropertyFormSection}
                        formId={FORM_ID}
                        sourceObjectType={objectType}
                        objectTypes={objectTypes}
                        datamartId={datamartId}
                        runtimeSchemaId={runtimeSchemaId}
                        title={messages.propertyFilterSectionTitle}
                        subtitle={messages.propertyFilterSectionSubtitle}
                        booleanOperator={booleanOperator}
                        onBooleanOperatorChange={this.onBooleanOperatorChange}
                        formChange={injectedFormPropsChange}
                        filterOutFields={
                          validObjectType?.fieldName ? [validObjectType.fieldName] : []
                        }
                        disabled={disabled}
                      />
                    )}
                  </div>
                ) : (
                  <Loading isFullScreen={true} />
                )}
              </div>
            )}
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ReactToEventAutomationFormProps>(
  injectIntl,
  withValidators,
  injectNotifications,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(ReactToEventAutomationForm);

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.reactToEventForm.save.button',
    defaultMessage: 'Update',
  },
  reactToEventFormSectionTitle: {
    id: 'automation.builder.node.reactToEventForm.event.title',
    defaultMessage: 'Description',
  },
  reactToEventFormSectionSubtitle: {
    id: 'automation.builder.node.reactToEventForm.event.subtitle',
    defaultMessage: 'This is the starting point for your automation.',
  },
  reactToEventFormSectionConfigurationTitle: {
    id: 'automation.builder.node.reactToEventForm.event.configuration.title',
    defaultMessage: 'Configuration',
  },
  reactToEventFormSectionConfigurationSubtitle: {
    id: 'automation.builder.node.reactToEventForm.event.configuration.subtitle',
    defaultMessage:
      "Define which events will cause a user to enter this automation. Standard events will appear if you've used mediarithmics predefined event names in your integration. Otherwise, use the advanced tab.",
  },
  standardEvents: {
    id: 'automation.builder.node.reactToEventForm.formMode.standardEvents',
    defaultMessage: 'STANDARD EVENTS',
  },
  advanced: {
    id: 'automation.builder.node.reactToEventForm.formMode.advanced',
    defaultMessage: 'ADVANCED',
  },
  propertyFilterSectionTitle: {
    id: 'automation.builder.node.reactToEventForm.propertyFilter.title',
    defaultMessage: 'Event property filters',
  },
  propertyFilterSectionSubtitle: {
    id: 'automation.builder.node.reactToEventForm.propertyFilter.subtitle',
    defaultMessage: 'Filter Events based on Properties',
  },
  eventName: {
    id: 'automation.builder.node.reactToEventForm.eventName',
    defaultMessage: 'Event names',
  },
  schemaNotSuitableForAction: {
    id: 'automation.builder.node.reactToEventForm.schemaNotSuitableForAction',
    defaultMessage: 'Schema is not suitable for this action.',
  },
  noStandardEvents: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.noStandardEvents',
    defaultMessage:
      'You have no standard events in your datamart. For more options, please switch to the "Advanced" mode above.',
  },
  $home_view: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.homeView',
    defaultMessage: 'When the user views the site home page',
  },
  $item_list_view: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.itemListView',
    defaultMessage:
      'When the user views a list of products in a category page or in a search results page',
  },
  $item_view: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.itemView',
    defaultMessage: 'When the user views a product page',
  },
  $basket_view: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.basketView',
    defaultMessage: 'When the user views the basket page',
  },
  $transaction_confirmed: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.transactionConfirmed',
    defaultMessage: 'When the user views the transaction confirmation page',
  },
  $conversion: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.conversion',
    defaultMessage: 'When the user has completed a Goal',
  },
  $ad_click: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.adClick',
    defaultMessage: 'When the user clicked on an Ad',
  },
  $ad_view: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.adView',
    defaultMessage: 'When the user views an Ad',
  },
  $email_click: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.emailClick',
    defaultMessage: 'When the user clicks in an Email',
  },
  $email_view: {
    id: 'automation.builder.node.reactToEventForm.standardEventsForm.predefinedMessage.emailView',
    defaultMessage: 'When the user opened an Email',
  },
});

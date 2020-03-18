import React from "react";
import { compose } from "recompose";
import { Form, Layout, message } from "antd";
import { change, reduxForm, getFormValues } from "redux-form";
import { Path } from "../../../../../../components/ActionBar";
import { injectIntl, InjectedIntlProps, defineMessages } from "react-intl";
import { withValidators } from "../../../../../../components/Form";
import { ValidatorProps } from "../../../../../../components/Form/withValidators";
import { WizardValidObjectTypeField, getValidObjectTypesForWizardReactToEvent, getValidFieldsForWizardReactToEvent, wizardValidObjectTypes } from "../../../domain";
import { MicsReduxState } from "../../../../../../utils/ReduxHelper";
import { connect, DispatchProp } from "react-redux";
import { QueryDocument, ObjectNode, FieldNode } from "../../../../../../models/datamart/graphdb/QueryDocument";
import { QueryInputNodeResource } from "../../../../../../models/automations/automations";
import { Loading } from "../../../../../../components";
import injectNotifications, { InjectedNotificationProps } from "../../../../../Notifications/injectNotifications";
import { reducePromises } from "../../../../../../utils/PromiseHelper";
import { IRuntimeSchemaService } from "../../../../../../services/RuntimeSchemaService";
import { TYPES } from "../../../../../../constants/types";
import { lazyInject } from "../../../../../../config/inversify.config";
import FormLayoutActionbar, { FormLayoutActionbarProps } from "../../../../../../components/Layout/FormLayoutActionbar";
import { QueryLanguage } from "../../../../../../models/datamart/DatamartResource";
import { FormSearchObjectField } from "../../../../../QueryTool/JSONOTQL/Edit/Sections/Field/FieldNodeForm";
import FormSearchObject from "../../../../../../components/Form/FormSelect/FormSearchObject";
import { IQueryService } from "../../../../../../services/QueryService";
import { isAggregateResult } from "../../../../../../models/datamart/graphdb/OTQLResult";
import { LabeledValue } from "antd/lib/select";

const FORM_ID = 'reactToEventForm';

export interface ReactToEventAutomationFormProps {
  node: QueryInputNodeResource;
  close: () => void;
  breadCrumbPaths: Path[];
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
}

type Props = ReactToEventAutomationFormProps 
& InjectedIntlProps 
& ValidatorProps
& DispatchProp<any>
& MapStateToProps
& InjectedNotificationProps;

class ReactToEventAutomationForm extends React.Component<Props, State> {

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;
  
  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);

    let events: string[] = [];
    if (props.node.formData.query_text) {
      const query = JSON.parse(props.node.formData.query_text) as QueryDocument;
      const where: ObjectNode | undefined = query.where ? query.where as ObjectNode : undefined;
      const expressions: FieldNode | undefined = where ? where.expressions[0] as FieldNode : undefined;
      events = (expressions && expressions.comparison) ? expressions.comparison.values : [];

      if (this.props.dispatch)
        this.props.dispatch(change(FORM_ID, 'events', events))
    }

    this.state = {
      queryText: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      intl: {
        formatMessage,
      }
    } = this.props;

    if (dispatch)
      dispatch(change(FORM_ID, 'query_language', 'JSON_OTQL'))

    this.getValidObjectType().then(validObjectType => {
      if(!validObjectType || !validObjectType.objectTypeQueryName) {
        message.warning(formatMessage(messages.schemaNotSuitableForAction));
        return;
      }
      this.setState({
        validObjectType,
        isLoading: false,
      })
    });
  }

  getValidObjectType = (): Promise<WizardValidObjectTypeField | undefined> => {
    const {
      notifyError,
      formValues: { datamart_id }
    } = this.props;

    return this._runtimeSchemaService.getRuntimeSchemas(datamart_id)
    .then(({ data: schemas }) => {
      const runtimeSchema = schemas.find(
        schema => schema.status === 'LIVE',
      );

      if (!runtimeSchema) return;

      return this._runtimeSchemaService.getObjectTypes(
        datamart_id,
        runtimeSchema.id,
      ).then(({ data: objectTypes }) => {
        return reducePromises(
          getValidObjectTypesForWizardReactToEvent(objectTypes).map(validObjectType => {
            return this._runtimeSchemaService.getFields(
              datamart_id,
              runtimeSchema.id, 
              validObjectType.id,
            ).then(({ data: fields }) => {
              return { objectType: validObjectType, validFields: getValidFieldsForWizardReactToEvent(validObjectType, fields)};
            });
          })
        )
        .then(validObjectTypes => {
          /*
          Here we need to find a WizardValidObjectTypeField
          For each WizardValidObjectTypeField we check if we have an objectType with 
          the same WizardValidObjectTypeField.objectTypeName in validObjectTypes and if 
          its fields contain at least one with the WizardValidObjectTypeField.fieldName.
          */
          const wizardValidObjectTypesFitlered = wizardValidObjectTypes.find(
            automationWizardValidObjectType =>
            !!validObjectTypes.find(validObjectType =>
              validObjectType.objectType.name === automationWizardValidObjectType.objectTypeName &&
              !!validObjectType.validFields.find(of => of.name === automationWizardValidObjectType.fieldName),
            ),
          );
          
          if(!wizardValidObjectTypesFitlered) return;

          /*
          We need to fetch the ObjectType UserPoint as it refers to our valid object type, 
          thus we can have its usable name to use in a query.
          For example: ActivityEvent => activity_events
          */
          const userPointObjectType = objectTypes.find(o => o.name === 'UserPoint');

          if(userPointObjectType) {
            return this._runtimeSchemaService.getFields(
              datamart_id,
              runtimeSchema.id,
              userPointObjectType.id,
            ).then(upFields => {
              const field = upFields.data.find(
                f => f.field_type.match(/\w+/)![0] === wizardValidObjectTypesFitlered.objectTypeName
              );

              if(field)
                return {
                  ...wizardValidObjectTypesFitlered,
                  objectTypeQueryName: field ? field.name : undefined
                };

              return;
            });
          } else return;
        });
      });
    })
    .catch(error => {
      notifyError(error);
      return undefined;
    });
  }

  onEventsChange = (event?: any, newValue?: any, previousValue?: any) => {
    const { validObjectType } = this.state;

    if (!validObjectType || !validObjectType.objectTypeQueryName)
      return;

    const query: QueryDocument = {
      from: 'UserPoint',
      operations: [{
        directives: [],
        selections: [{ name: 'id' }]
      }],
      where: {
        boolean_operator: 'OR',
        field: validObjectType.objectTypeQueryName,
        type: 'OBJECT',
        expressions: [{
          type: 'FIELD',
          field: validObjectType.fieldName,
          comparison: {
            type: 'STRING',
            operator: 'EQ',
            values: newValue
          }
        }]
      }
    };

    if (this.props.dispatch)
      this.props.dispatch(change(FORM_ID, 'query_text', JSON.stringify(query)))
  }

  getEventsNames = (validObjectType: WizardValidObjectTypeField): Promise<LabeledValue[]> => {
    const { formValues: { datamart_id } } = this.props;

    if (!validObjectType || !validObjectType.objectTypeQueryName)
      return Promise.resolve([]);

    const query: QueryDocument = {
      from: 'UserPoint',
      operations: [{
        selections: [{
          name: validObjectType.objectTypeQueryName,
          selections: [{
            name: validObjectType.fieldName,
            directives: [{name: 'map'}]
          }] }]
      }],
    };

    return this._queryService.runJSONOTQLQuery(
      datamart_id,
      query,
      { use_cache: true }
    ).then(oTQLDataResponse => {
      if (isAggregateResult(oTQLDataResponse.data.rows)) {
        return oTQLDataResponse.data.rows[0]
      } else {
        throw new Error('err')
      }
    })
    .then(oTQLAggregationResult => {
      return oTQLAggregationResult.aggregations.buckets[0]
    })
    .then(oTQLBuckets => {
      return oTQLBuckets.buckets.map(({ key }) => ({key: key, label: key}))
    })
    .catch(() => { return [] })
  }

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: {
        isRequired,
      },
      close,
      disabled,
      breadCrumbPaths,
    } = this.props;

    const {
      isLoading,
      validObjectType
    } = this.state;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
      disabled: !disabled && isLoading,
    };

    const fetchListMethod = (k: string) => {return this.getEventsNames(validObjectType!)}
    const fetchSingleMethod = (event: string) => {return Promise.resolve({key: event, label: event})}

    return (
      <Layout className="mcs-reactToEventAutomation edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-content'}>
          {isLoading
            ? <Loading className="loading-full-screen" />
            : <Form 
            id={FORM_ID}
            className="edit-layout mcs-content-container mcs-form-container"
            layout={'vertical'}
          >
            <div className="mcs-reactToEventAutomation_chooseEventNameContainer">
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
                }}
                loadOnlyOnce={true}
              />
            </div>
          </Form>
          }
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
  reduxForm<{}, ReactToEventAutomationFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(ReactToEventAutomationForm);

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.reactToEventForm.save.button',
    defaultMessage: 'Update',
  },
  eventName: {
    id: 'automation.builder.node.reactToEventForm.eventName',
    defaultMessage: 'Event names',
  },
  eventNameHelp: {
    id: 'automation.builder.node.reactToEventForm.eventNameHelp',
    defaultMessage: 'The event names that will trigger the Automation. When receiving one of these events, the user will enter the automation.',
  },
  schemaNotSuitableForAction: {
    id: 'automation.builder.node.reactToEventForm.schemaNotSuitableForAction',
    defaultMessage: 'Schema is not suitable for this actions.',
  }
});
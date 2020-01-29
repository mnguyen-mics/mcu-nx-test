import React from "react";
import { compose } from "recompose";
import { Layout, message } from "antd";
import { Form, reduxForm, getFormValues } from "redux-form";
import { ActionBarProps } from "../../../components/ActionBar";
import { injectIntl, InjectedIntlProps, defineMessages } from "react-intl";
import { withValidators, FormMultiTagField } from "../../../components/Form";
import { ValidatorProps } from "../../../components/Form/withValidators";
import FormMultiTag from "../../../components/Form/FormSelect/FormMultiTag";
import AutomationActionBar from "./ActionBar/AutomationActionBar";
import { beginNode, WizardValidObjectTypeField, getValidObjectTypesForWizardReactToEvent, getValidFieldsForWizardReactToEvent, wizardValidObjectTypes } from "./domain";
import { AutomationFormData } from "../Edit/domain";
import { MicsReduxState } from "../../../utils/ReduxHelper";
import { connect } from "react-redux";
import { QueryDocument } from "../../../models/datamart/graphdb/QueryDocument";
import { QueryInputNodeResource } from "../../../models/automations/automations";
import RuntimeSchemaService from "../../../services/RuntimeSchemaService";
import { Loading } from "../../../components";
import injectNotifications, { InjectedNotificationProps } from "../../Notifications/injectNotifications";
import { reducePromises } from "../../../utils/PromiseHelper";

const FORM_ID = 'wizardReactToEventForm';

export interface AutomationWizardReactToEventProps {
  actionBarProps: ActionBarProps;
  datamartId: string;
  automationFormData?: Partial<AutomationFormData>;
  loading: boolean;
  saveAutomation: (formData: Partial<AutomationFormData>) => void;
}

interface MapStateToProps {
  formValues: {
    events: string[];
  };
}

type Props = AutomationWizardReactToEventProps 
& InjectedIntlProps 
& ValidatorProps
& MapStateToProps
& InjectedNotificationProps;

class AutomationWizardReactToEvent extends React.Component<Props, {}> {

  getValidObjectType = (): Promise<WizardValidObjectTypeField | undefined> => {
    const {
      datamartId,
      notifyError,
    } = this.props;

    return RuntimeSchemaService.getRuntimeSchemas(datamartId)
    .then(({ data: schemas }) => {
      const runtimeSchema = schemas.find(
        schema => schema.status === 'LIVE',
      );

      if (!runtimeSchema) return;

      return RuntimeSchemaService.getObjectTypes(
        datamartId,
        runtimeSchema.id,
      ).then(({ data: objectTypes }) => {
        return reducePromises(
          getValidObjectTypesForWizardReactToEvent(objectTypes).map(validObjectType => {
            return RuntimeSchemaService.getFields(
              datamartId,
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
            return RuntimeSchemaService.getFields(
              datamartId,
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

  handleSubmit = (formData: Partial<AutomationFormData>) => {
    const {
      saveAutomation,
      formValues,
      datamartId,
      intl: {
        formatMessage,
      },
    } = this.props;

    this.getValidObjectType()
    .then(objectType => {
      if(!objectType || !objectType.objectTypeQueryName) {
        message.warning(formatMessage(messages.schemaNotSuitableForAction));
        return;
      }

      const query: QueryDocument = {
        from: 'UserPoint',
        operations: [{
          directives: [],
          selections: [{ name: 'id' }]
        }],
        where: {
          boolean_operator: 'OR',
          field: objectType.objectTypeQueryName,
          type: 'OBJECT',
          expressions: [{
            type: 'FIELD',
            field: objectType.fieldName,
            comparison: {
              type: 'STRING',
              operator: 'EQ',
              values: formValues.events
            }
          }]
        }
      };
  
      const node: QueryInputNodeResource = {
        ...beginNode as QueryInputNodeResource,
        formData: {
          datamart_id: datamartId,
          query_language: 'JSON_OTQL',
          query_text: JSON.stringify(query)
        } 
      };
  
      saveAutomation({
        ...formData,
        automationTreeData: formData.automationTreeData ? {
          ...formData.automationTreeData,
          node: node
        } : undefined
      });
    });
  }

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: {
        isRequired
      },
      automationFormData,
      datamartId,
      loading,
    } = this.props;

    if (loading)
      return <Loading className="loading-full-screen" />;

    return (
      <Layout className="mcs-automationWizard edit-layout">
        <AutomationActionBar 
          automationData={{
            ...automationFormData,
            automation:
              automationFormData && automationFormData.automation
                ? {
                    ...automationFormData.automation,
                    datamart_id: datamartId,
                  }
                : undefined,
          }}
          saveOrUpdate={this.handleSubmit}
        />
        <Layout className={'ant-layout-content'}>
          <Form 
            id={FORM_ID}
            className="edit-layout mcs-content-container mcs-form-container"
          >
            <div className="mcs-automationWizard_chooseEventNameContainer">
              <FormMultiTagField
                name={'events'}
                component={FormMultiTag}
                formItemProps={{
                  label: formatMessage(messages.eventName),
                  required: true,
                }}
                helpToolTipProps={{
                  title: formatMessage(messages.eventNameHelp),
                }}
                small={false}
                validate={isRequired}
              />
            </div>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AutomationWizardReactToEventProps>(
  injectIntl,
  withValidators,
  injectNotifications,
  reduxForm<{}, AutomationWizardReactToEventProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AutomationWizardReactToEvent);

const messages = defineMessages({
  save: {
    id: 'automations.wizardReactToEvent.save',
    defaultMessage: 'Save scenario'
  },
  eventName: {
    id: 'automations.wizardReactToEvent.eventName',
    defaultMessage: 'Event name equals',
  },
  eventNameHelp: {
    id: 'automations.wizardReactToEvent.eventNameHelp',
    defaultMessage: 'The event names that will trigger the scenario.',
  },
  schemaNotSuitableForAction: {
    id: 'automations.wizardReactToEvent.schemaNotSuitableForAction',
    defaultMessage: 'Schema is not suitable for this actions.',
  }
});
import queryString from 'query-string';
import * as React from 'react';
import { message, Layout } from 'antd';
import { WrappedComponentProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  UserProfileResource,
  UserWorkspaceResource,
} from '../../../models/directory/UserProfileResource';
import AutomationBuilderContainer from './AutomationBuilderContainer';
import { DatamartSelector } from '../../Datamart';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import {
  AutomationFormData,
  INITIAL_AUTOMATION_DATA,
  generateInitialAutomationData,
} from '../Edit/domain';

import { IAutomationFormService } from '../Edit/AutomationFormService';
import AutomationTemplateSelector from './AutomationTemplateSelector';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { Loading } from '../../../components';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import {
  wizardValidObjectTypes,
  getValidObjectTypesForWizardReactToEvent,
  getValidFieldsForWizardReactToEvent,
} from './domain';
import { reducePromises } from '../../../utils/PromiseHelper';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { FormLayoutActionbarProps } from '../../../components/Layout/FormLayoutActionbar';

export interface AutomationBuilderPageRouteParams {
  organisationId: string;
  automationId?: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

export type AutomationSelectedType = 'REACT_TO_EVENT' | 'ON_SEGMENT_ENTRY' | 'ON_SEGMENT_EXIT';

interface State {
  isLoading: boolean;
  automationFormData: AutomationFormData;
  isCheckingReactToEventAvailable: boolean;
  disableReactToEvent: boolean;
  type?: AutomationSelectedType;
}

type Props = RouteComponentProps<AutomationBuilderPageRouteParams> &
  MapStateToProps &
  InjectedNotificationProps &
  WrappedComponentProps &
  InjectedFeaturesProps;

class AutomationBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      isCheckingReactToEventAvailable: false,
      automationFormData: INITIAL_AUTOMATION_DATA,
      disableReactToEvent: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    if (automationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService.loadInitialAutomationValues(automationId).then(res => {
        this.setState({
          automationFormData: res,
          isLoading: false,
        });
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      location,
      match: {
        params: { automationId },
      },
    } = this.props;
    const {
      location: prevLocation,
      match: {
        params: { automationId: prevAutomationId },
      },
    } = prevProps;

    if (
      queryString.parse(location.search).datamartId !==
      queryString.parse(prevLocation.search).datamartId
    )
      this.checkReactToEvent();

    if (!automationId && automationId !== prevAutomationId) {
      this.setState({
        automationFormData: INITIAL_AUTOMATION_DATA,
      });
    } else if (automationId && automationId !== prevAutomationId) {
      this.setState({
        isLoading: true,
      });

      this._automationFormService.loadInitialAutomationValues(automationId).then(res => {
        this.setState({
          automationFormData: res,
          isLoading: false,
        });
      });
    }
  }

  checkReactToEvent = () => {
    const { notifyError } = this.props;

    this.setState({
      disableReactToEvent: true,
      isCheckingReactToEventAvailable: true,
    });

    const selectedDatamart = this.getSelectedDatamart();

    if (!selectedDatamart) return;

    this._runtimeSchemaService
      .getRuntimeSchemas(selectedDatamart.id)
      .then(schemasResponse => {
        const runtimeSchema = schemasResponse.data.find(schema => schema.status === 'LIVE');

        if (!runtimeSchema) return;

        return this._runtimeSchemaService
          .getObjectTypes(selectedDatamart.id, runtimeSchema.id)
          .then(({ data: objectTypes }) => {
            return reducePromises(
              getValidObjectTypesForWizardReactToEvent(objectTypes).map(validObjectType => {
                return this._runtimeSchemaService
                  .getFields(selectedDatamart.id, runtimeSchema.id, validObjectType.id)
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
              const validResult = wizardValidObjectTypes.find(
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

              if (validResult) {
                this.setState({
                  disableReactToEvent: false,
                  isCheckingReactToEventAvailable: false,
                });
              }
            });
          });
      })
      .then(() => {
        this.setState({ isCheckingReactToEventAvailable: false });
      })
      .catch(error => {
        notifyError(error);
        this.setState({ isCheckingReactToEventAvailable: false });
      });
  };

  saveAutomation = (formData: AutomationFormData) => {
    const {
      intl,
      notifyError,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { automationFormData } = this.state;

    const hideSaveInProgress = message.loading(intl.formatMessage(messages.savingInProgress), 0);
    this.setState({
      isLoading: true,
    });

    this._automationFormService
      .validateAutomation(formData.automationTreeData)
      .then(() =>
        this._automationFormService
          .saveOrCreateAutomation(organisationId, formData, automationFormData)
          .then(automation => {
            hideSaveInProgress();
            this.setState({ isLoading: false });
            this.redirect(automation.data.id);
            message.success(intl.formatMessage(messages.automationSaved));
          })
          .catch(err => {
            this.setState({ isLoading: false });
            notifyError(err);
            hideSaveInProgress();
          }),
      )
      .catch(err => {
        this.setState({ isLoading: false });
        message.error(intl.formatMessage(err));
        hideSaveInProgress();
      });
  };

  redirect = (automationId?: string) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = automationId
      ? `/v2/o/${organisationId}/automations/${automationId}`
      : `/v2/o/${organisationId}/automations`;

    return history.push(url);
  };

  hasSelectedType = (type: AutomationSelectedType) => {
    const newInitialValues = generateInitialAutomationData(type);
    this.setState({ type, automationFormData: newInitialValues });
  };

  getSelectedDatamart = (): DatamartResource | undefined => {
    const { location, connectedUser } = this.props;

    let selectedDatamart: DatamartResource | undefined;

    const orgWp = connectedUser.workspaces.find(
      (w: UserWorkspaceResource) => w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (orgWp !== undefined && orgWp.datamarts && orgWp.datamarts.length === 1) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString && orgWp !== undefined) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }

    return selectedDatamart;
  };

  render() {
    const { location, intl, history } = this.props;

    const {
      automationFormData,
      isLoading,
      type,
      disableReactToEvent,
      isCheckingReactToEventAvailable,
    } = this.state;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      this.setState({ type: undefined }, () => {
        history.push({
          pathname: location.pathname,
          search: queryString.stringify({ datamartId: selection.id }),
        });
      });
    };

    const selectedDatamart = this.getSelectedDatamart();

    const actionBarProps: FormLayoutActionbarProps = {
      pathItems: [
        <span className='mcs-pathItem' key='1'>
          {intl.formatMessage(messages.automationBuilder)}
        </span>,
      ],
    };

    if (!selectedDatamart) {
      return (
        <DatamartSelector
          onSelect={handleOnSelectDatamart}
          actionbarProps={actionBarProps}
          isMainlayout={true}
        />
      );
    }

    if (!type) {
      if (isCheckingReactToEventAvailable)
        return (
          <Layout>
            <Actionbar {...actionBarProps} />
            <Loading isFullScreen={false} />
          </Layout>
        );

      return (
        <AutomationTemplateSelector
          onSelectTemplate={this.hasSelectedType}
          disableReactToEvent={disableReactToEvent}
          actionbarProps={actionBarProps}
        />
      );
    }

    return (
      <AutomationBuilderContainer
        datamartId={selectedDatamart.id}
        automationFormData={automationFormData}
        saveOrUpdate={this.saveAutomation}
        loading={isLoading}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(AutomationBuilderPage);

export const messages = defineMessages({
  newAutomation: {
    id: 'automation.builder.page.actionbar.new.automation',
    defaultMessage: 'New Automation',
  },
  automationBuilder: {
    id: 'automation.builder.page.actionbar.title',
    defaultMessage: 'Automation Builder',
  },
  savingInProgress: {
    id: 'automation.builder.page.actionbar.save.in.progress',
    defaultMessage: 'Saving in progress',
  },
  automationSaved: {
    id: 'automation.builder.page.automation.saved',
    defaultMessage: 'Automation Saved',
  },
  saveAutomation: {
    id: 'automation.builder.page.actionBar.save',
    defaultMessage: 'Save',
  },
  updateAutomation: {
    id: 'automation.builder.page.actionBar.update',
    defaultMessage: 'Update',
  },
  editAutomation: {
    id: 'automation.builder.page.actionBar.edit',
    defaultMessage: 'Edit',
  },
});

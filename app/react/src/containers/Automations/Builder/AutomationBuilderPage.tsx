import queryString from 'query-string';
import * as React from 'react';
import { message } from 'antd';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
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
import { AutomationFormData, INITIAL_AUTOMATION_DATA, generateInitialAutomationData } from '../Edit/domain';

import { IAutomationFormService } from '../Edit/AutomationFormService';
import AutomationTemplateSelector from './AutomationTemplateSelector';
import { QueryInputEvaluationMode, QueryInputEvaluationPeriodUnit } from '../../../models/automations/automations';
import { MicsReduxState } from '../../../utils/ReduxHelper';

export interface AutomationBuilderPageRouteParams {
  organisationId: string;
  automationId?: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface State {
  isLoading: boolean;
  automationFormData: AutomationFormData;
  type?: 'LIVE' | 'PERIODIC';
}

type Props = RouteComponentProps<AutomationBuilderPageRouteParams> &
  MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps;

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

class AutomationBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      automationFormData: INITIAL_AUTOMATION_DATA,
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
      this._automationFormService
        .loadInitialAutomationValues(automationId, 'v201709')
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    const {
      match: {
        params: { automationId: prevAutomationId },
      },
    } = prevProps;
    if (!automationId && automationId !== prevAutomationId) {
      this.setState({
        automationFormData: INITIAL_AUTOMATION_DATA,
      });
    } else if (automationId && automationId !== prevAutomationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService
        .loadInitialAutomationValues(automationId, 'v201709')
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  saveAutomation = (formData: AutomationFormData) => {
    const {
      intl,
      notifyError,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      automationFormData
    } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );
    this.setState({
      isLoading: true,
    });

    this._automationFormService
      .saveOrCreateAutomation(organisationId, 'v201709', formData, automationFormData)
      .then((automation) => {
        hideSaveInProgress();
        this.setState({ isLoading: false });
        this.redirect(automation.data.id);
        message.success(intl.formatMessage(messages.automationSaved));
      })
      .catch(err => {
        this.setState({ isLoading: false });
        notifyError(err);
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

    const url = automationId ? `/v2/o/${organisationId}/automations/${automationId}` : `/v2/o/${organisationId}/automations`;

    return history.push(url);
  };

  hasSelectedType = (type: QueryInputEvaluationMode, n?: number, p?: QueryInputEvaluationPeriodUnit) => {
    const newInitialValues = generateInitialAutomationData(type, n, p)
    this.setState({ type, automationFormData: newInitialValues })
  }

  render() {
    const {
      connectedUser,
      location,
      intl,
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { automationFormData, isLoading, type } = this.state;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      if (selection.storage_model_version === 'v201506') {
        history.push(
          `/v2/o/${organisationId}/automation-builder-old?datamartId=${
            selection.id
         }`,
        );
      } else {
        history.push({
          pathname: location.pathname,
          search: queryString.stringify({ datamartId: selection.id }),
        });
      }
    };

    let selectedDatamart: DatamartResource | undefined;

    const orgWp = connectedUser.workspaces.find(
      (w: UserWorkspaceResource) =>
        w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (
      orgWp !== undefined &&
      orgWp.datamarts &&
      orgWp.datamarts.length === 1
    ) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString && orgWp !== undefined) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }

    if (!selectedDatamart) {
      return (<DatamartSelector
        onSelectDatamart={handleOnSelectDatamart}
        actionbarProps={{
          paths: [
            {
              name: intl.formatMessage(messages.automationBuilder),
            },
          ],
        }}
      />)
    }

    if (!type) {
      return (
        <AutomationTemplateSelector
          onSelectTemplate={this.hasSelectedType}
          actionbarProps={{
            paths: [
              {
                name: intl.formatMessage(messages.automationBuilder),
              },
            ],
          }}
        />
      )
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
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(AutomationBuilderPage);

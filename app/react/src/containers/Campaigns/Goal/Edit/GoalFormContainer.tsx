import * as React from 'react';
import { compose } from 'recompose';
import { InjectedFormProps, ConfigProps } from 'redux-form';
import { GoalFormData, INITIAL_GOAL_FORM_DATA, isGoalResource } from './domain';
import GoalForm, { GoalFormProps, FORM_ID } from './GoalForm';
import DatamartService from '../../../../services/DatamartService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartResource, QueryLanguage } from '../../../../models/datamart/DatamartResource';
import { Omit } from '../../../../utils/Types';
import { Path } from '../../../../components/ActionBar';
import { EditContentLayout } from '../../../../components/Layout';
import DatamartSelector from '../../../../containers/Audience/Common/DatamartSelector';
import {
  injectWorkspace,
  InjectedWorkspaceProps,
} from '../../../Datamart/index';
import { Loading } from '../../../../components';
import GoalTriggerTypeSelector from '../Common/GoalTriggerTypeSelector';
import { GoalTriggerType } from '../../../../models/goal/GoalResource';

export interface GoalFormContainerProps
  extends Omit<ConfigProps<GoalFormData>, 'form'> {
  save?: (goalFormData: GoalFormData) => void;
  close: () => void;
  breadCrumbPaths: Path[];
}

type Props = GoalFormContainerProps &
  InjectedFormProps<GoalFormData, GoalFormContainerProps> &
  GoalFormProps &
  InjectedWorkspaceProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; goalId: string }>;

interface State {
  selectedDatamart?: DatamartResource;
  initialValues: Partial<GoalFormData>;
  loading: boolean;
  showTriggerTypeSelector: boolean;
}

class GoalFormContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedDatamart: undefined,
      initialValues: this.props.match.params.goalId ? this.props.initialValues : INITIAL_GOAL_FORM_DATA,
      loading: false,
      showTriggerTypeSelector: true,
    };
  }

  componentDidMount() {
    const { initialValues, workspace } = this.props;

    if (initialValues.goal && isGoalResource(initialValues.goal)) {
      this.setState({ loading: true });
      DatamartService.getDatamart(initialValues.goal.datamart_id)
        .then(resp => {          
          this.setState({ 
            loading: false, 
            showTriggerTypeSelector: false,
            selectedDatamart: resp.data,
           });
        })
        .catch(err => {
          this.props.notifyError(err);
          this.setState({ loading: false });
        });
    } else if (workspace.datamarts.length === 1) {
      this.onDatamartSelect(workspace.datamarts[0].datamart_resource);
    }
  }

  onDatamartSelect = (datamart: DatamartResource) => {
    const { initialValues } = this.props;
    const QueryContainer = (window as any).angular
      .element(document.body)
      .injector()
      .get('core/datamart/queries/QueryContainer');
    const defQuery = new QueryContainer(datamart.id);
    this.setState({
      selectedDatamart: datamart,
      initialValues: {
        ...initialValues,
        goal: {
          ...INITIAL_GOAL_FORM_DATA.goal,
          datamart_id: datamart.id,
        },
        attributionModels: initialValues.attributionModels,        
        queryContainer: defQuery,
      },
    });
  };

  handleTriggerTypeSelect = (triggerType: GoalTriggerType, queryLanguage?: QueryLanguage) => {
    this.setState((prevState) => ({
      ...prevState,
      showTriggerTypeSelector: false,
      initialValues: {
        ...prevState.initialValues,
        triggerType: triggerType,
        queryLanguage,
      }
    }));
  }

  render() {
    const {
      save,
      close,
      onSubmitFail,
      breadCrumbPaths,
      onSubmit,
    } = this.props;

    const { selectedDatamart, initialValues, loading, showTriggerTypeSelector } = this.state;

    if (loading) return <Loading className="loading-full-screen" />;

    const resetTriggerType = () => {
      this.setState({ showTriggerTypeSelector: true });
    }

    return (!showTriggerTypeSelector && selectedDatamart) ? (
      <GoalForm
        initialValues={initialValues}
        onSubmit={save ? save : onSubmit}
        close={close}
        breadCrumbPaths={breadCrumbPaths}
        onSubmitFail={onSubmitFail}
        datamart={selectedDatamart}
        goToTriggerTypeSelection={resetTriggerType}
      />
    ) : (
      <EditContentLayout
        paths={breadCrumbPaths}
        formId={FORM_ID}
        onClose={close}
      >
        { showTriggerTypeSelector && selectedDatamart ? 
          <GoalTriggerTypeSelector onSelect={this.handleTriggerTypeSelect} datamart={selectedDatamart} />
          : <DatamartSelector onSelect={this.onDatamartSelect} />
        }
        
      </EditContentLayout>
    );
  }
}

export default compose<Props, GoalFormContainerProps>(
  injectNotifications,
  withRouter,
  injectWorkspace,
)(GoalFormContainer);

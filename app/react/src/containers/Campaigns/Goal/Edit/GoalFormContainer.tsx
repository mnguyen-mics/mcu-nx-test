import * as React from 'react';
import { compose } from 'recompose';
import { InjectedFormProps, ConfigProps } from 'redux-form';
import { GoalFormData, INITIAL_GOAL_FORM_DATA, isGoalResource } from './domain';
import GoalForm, { GoalFormProps, FORM_ID } from './GoalForm';
import { IDatamartService } from '../../../../services/DatamartService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  DatamartResource,
  QueryLanguage,
} from '../../../../models/datamart/DatamartResource';
import { Omit } from '../../../../utils/Types';
import { Path } from '../../../../components/ActionBar';
import { EditContentLayout } from '../../../../components/Layout';
import DatamartSelector from '../../../../containers/Datamart/DatamartSelector';
import {
  injectWorkspace,
  InjectedWorkspaceProps,
} from '../../../Datamart/index';
import { Loading } from '../../../../components';
import GoalTriggerTypeSelector from '../Common/GoalTriggerTypeSelector';
import { GoalTriggerType } from '../../../../models/goal/GoalResource';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';

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
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedDatamart: undefined,
      initialValues: this.props.match.params.goalId
        ? this.props.initialValues
        : INITIAL_GOAL_FORM_DATA,
      loading: false,
      showTriggerTypeSelector: true,
    };
  }

  componentDidMount() {
    const { initialValues, workspace } = this.props;

    if (initialValues.goal && isGoalResource(initialValues.goal)) {
      this.setState({ loading: true });
      this._datamartService
        .getDatamart(initialValues.goal.datamart_id)
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
      this.onDatamartSelect(workspace.datamarts[0]);
    }
  }

  onDatamartSelect = (datamart: DatamartResource) => {
    const { initialValues } = this.props;
    this.setState({
      selectedDatamart: datamart,
      initialValues: {
        ...initialValues,
        goal: {
          ...INITIAL_GOAL_FORM_DATA.goal,
          datamart_id: datamart.id,
        },
        attributionModels: initialValues.attributionModels,
      },
    });
  };

  handleTriggerTypeSelect = (
    triggerType: GoalTriggerType,
    queryLanguage?: QueryLanguage,
  ) => {
    this.setState(prevState => ({
      ...prevState,
      showTriggerTypeSelector: false,
      initialValues: {
        ...prevState.initialValues,
        triggerType: triggerType,
        queryLanguage,
      },
    }));
  };

  render() {
    const { save, close, onSubmitFail, breadCrumbPaths, onSubmit } = this.props;

    const {
      selectedDatamart,
      initialValues,
      loading,
      showTriggerTypeSelector,
    } = this.state;

    if (loading) return <Loading className="loading-full-screen" />;

    const resetTriggerType = () => {
      this.setState({ showTriggerTypeSelector: true });
    };

    return !showTriggerTypeSelector && selectedDatamart ? (
      <GoalForm
        initialValues={initialValues}
        onSubmit={save ? save : onSubmit}
        close={close}
        breadCrumbPaths={breadCrumbPaths}
        onSubmitFail={onSubmitFail}
        datamart={selectedDatamart}
        goToTriggerTypeSelection={resetTriggerType}
      />
    ) : showTriggerTypeSelector && selectedDatamart ? (
      <EditContentLayout
        paths={breadCrumbPaths}
        formId={FORM_ID}
        onClose={close}
      >
        (
        <GoalTriggerTypeSelector
          onSelect={this.handleTriggerTypeSelect}
          datamart={selectedDatamart}
        />
      </EditContentLayout>
    ) : (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        actionbarProps={{
          onClose: close,
          paths: breadCrumbPaths,
        }}
      />
    );
  }
}

export default compose<Props, GoalFormContainerProps>(
  injectNotifications,
  withRouter,
  injectWorkspace,
)(GoalFormContainer);

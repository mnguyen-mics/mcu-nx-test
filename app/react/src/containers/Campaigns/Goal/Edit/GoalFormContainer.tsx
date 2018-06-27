import * as React from 'react';
import { compose } from 'recompose';
import { InjectedFormProps, ConfigProps } from 'redux-form';
import { GoalFormData, INITIAL_GOAL_FORM_DATA } from './domain';
import GoalForm, { GoalFormProps, FORM_ID } from './GoalForm';
import DatamartService from '../../../../services/DatamartService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import { Omit } from '../../../../utils/Types';
import { Path } from '../../../../components/ActionBar';
import { EditContentLayout } from '../../../../components/Layout';
import DatamartSelector from '../../../../containers/Audience/Common/DatamartSelector';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../Datamart/index';

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
  goalFormData: Partial<GoalFormData>;
}

class GoalFormContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedDatamart: undefined,
      goalFormData: INITIAL_GOAL_FORM_DATA,
    };
  }

  componentDidMount() {
    const { initialValues, workspace } = this.props;

    if (initialValues.goal && initialValues.goal.datamart_id) {
      DatamartService.getDatamart(initialValues.goal.datamart_id)
        .then(resp => {
          this.onDatamartSelect(resp.data);
        })
        .catch(err => {
          this.props.notifyError(err);
        });
    } else if(workspace.datamarts.length === 1) {
      this.onDatamartSelect(workspace.datamarts[0]);
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
      goalFormData: {
        goal: {
          ...initialValues.goal,
          datamart_id: datamart.id,
        },
        attributionModels: initialValues.attributionModels,
        queryLanguage:
          datamart.storage_model_version === 'v201506' ? 'SELECTORQL' : 'OTQL',
        queryContainer: defQuery,
      },
    });
  };

  render() {
    const {
      initialValues,
      save,
      close,
      onSubmitFail,
      breadCrumbPaths,
      onSubmit,
      workspace
    } = this.props;

    const { selectedDatamart, goalFormData } = this.state;

    const isDatamartId =
      initialValues && initialValues.goal && initialValues.goal.datamart_id;

    const formValues = isDatamartId ? initialValues : goalFormData;

    return isDatamartId || workspace.datamarts.length === 1 || selectedDatamart ? (
      <GoalForm
        initialValues={formValues}
        onSubmit={save ? save : onSubmit}
        close={close}
        breadCrumbPaths={breadCrumbPaths}
        onSubmitFail={onSubmitFail}
      />
    ) : (
      <EditContentLayout
        paths={breadCrumbPaths}
        formId={FORM_ID}
        onClose={close}
      >
        <DatamartSelector onSelect={this.onDatamartSelect} />
      </EditContentLayout>
    );
  }
}

export default compose<Props, GoalFormContainerProps>(
  injectNotifications,
  withRouter,
  injectWorkspace
)(GoalFormContainer);

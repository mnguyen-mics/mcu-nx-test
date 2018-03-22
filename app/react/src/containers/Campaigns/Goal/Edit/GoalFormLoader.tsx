import * as React from 'react';
import { compose } from 'recompose';
import GoalForm, { GoalFormProps } from './GoalForm';
import { INITIAL_GOAL_FORM_DATA, NewGoalFormData } from './domain';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { QueryLanguage } from '../../../../models/datamart/DatamartResource';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';
import GoalFormService from './GoalFormService';

export interface GoalFormLoaderProps extends GoalFormProps {
  goalId: string;
}

interface State {
  goalFormData: NewGoalFormData;
  loading: boolean;
}

type Props = GoalFormLoaderProps &
  InjectedNotificationProps &
  InjectedDatamartProps;

class GoalFormLoader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const QueryContainer = (window as any).angular
      .element(document.body)
      .injector()
      .get('core/datamart/queries/QueryContainer');
    const defQuery = new QueryContainer(props.datamart.id);
    this.state = {
      loading: true,
      goalFormData: {
        goal: INITIAL_GOAL_FORM_DATA.goal,
        attributionModels: INITIAL_GOAL_FORM_DATA.attributionModels,

        queryLanguage:
          props.datamart.storage_model_version === 'v201506'
            ? 'SELECTORQL'
            : ('OTQL' as QueryLanguage),
        queryContainer: defQuery,
        triggerMode: 'QUERY',
      },
    };
  }

  componentDidMount() {
    const { goalId, notifyError, datamart } = this.props;
    GoalFormService.loadGoalData(goalId, datamart.id)
      .then(goalData => {
        this.setState({
          goalFormData: {
            ...goalData,
          },
          loading: false,
        });
      })
      .catch(err => {
        this.setState({ loading: false });
        notifyError(err);
      });
  }

  render() {
    const { goalId, ...rest } = this.props;
    const { loading } = this.state;

    if (loading) return <Loading className="loading-full-screen" />;

    return (
      <GoalForm
        {...rest}
        initialValues={this.state.goalFormData}
        goalId={goalId}
      />
    );
  }
}

export default compose<Props, GoalFormProps>(
  injectNotifications,
  injectDatamart,
)(GoalFormLoader);

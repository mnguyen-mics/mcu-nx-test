import * as React from 'react';
import { compose } from 'recompose';
import GoalForm, { GoalFormProps } from './GoalForm';
import { INITIAL_GOAL_FORM_DATA, GoalFormData } from './domain';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';
import GoalFormService from './GoalFormService';

export interface GoalFormLoaderProps extends GoalFormProps {
  goalId: string;
}

interface State {
  goalFormData: GoalFormData;
  loading: boolean;
}

type Props = GoalFormLoaderProps &
  InjectedNotificationProps &
  InjectedDatamartProps;

class GoalFormLoader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      goalFormData: {
        ...INITIAL_GOAL_FORM_DATA,
      },
    };
  }

  componentDidMount() {
    this.setState({
      loading: true,
    });
    const { goalId, notifyError } = this.props;
    GoalFormService.loadGoalData(goalId)
      .then(goalData => {
        this.setState({
          loading: false,
          goalFormData: {
            ...goalData,
            attributionModels: INITIAL_GOAL_FORM_DATA.attributionModels,
          },
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

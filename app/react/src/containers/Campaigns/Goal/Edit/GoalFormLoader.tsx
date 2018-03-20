import * as React from 'react';
import { compose } from 'recompose';
import GoalForm, { GoalFormProps } from './GoalForm';
import { GoalFormData, INITIAL_GOAL_FORM_DATA } from './domain';
import GoalFormService from './GoalFormService';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

export interface GoalFormLoaderProps extends GoalFormProps {
  goalId: string;
}

interface State {
  goalFormData: GoalFormData;
  loading: boolean;
}

type Props = GoalFormLoaderProps & InjectedNotificationProps;

class GoalFormLoader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { goalFormData: INITIAL_GOAL_FORM_DATA, loading: true };
  }

  componentDidMount() {
    const { goalId, notifyError } = this.props;
    GoalFormService.loadGoal(goalId)
      .then(goalFormData => this.setState({ goalFormData, loading: false }))
      .catch(err => notifyError(err));
  }

  render() {
    const { goalId, ...rest } = this.props;
    const { goalFormData, loading } = this.state;

    if (loading) return <Loading className="loading-full-screen" />;

    return <GoalForm {...rest} initialValues={goalFormData} />;
  }
}

export default compose<Props, GoalFormProps>(injectNotifications)(
  GoalFormLoader,
);

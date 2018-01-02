import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import * as NotificationActions from '../../../../state/Notifications/actions';
import GoalForm, { GoalFormProps } from './GoalForm';
import { GoalFormData, INITIAL_GOAL_FORM_DATA } from './domain';
import GoalFormService from './GoalFormService';
import Loading from '../../../../components/Loading';

export interface GoalFormLoaderProps extends GoalFormProps {
  goalId: string;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

interface State {
  goalFormData: GoalFormData;
  loading: boolean;
}

type Props = GoalFormLoaderProps & MapStateProps;

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

export default compose<GoalFormProps, GoalFormProps>(
  connect(undefined, { notifyError: NotificationActions.notifyError }),
)(GoalFormLoader);

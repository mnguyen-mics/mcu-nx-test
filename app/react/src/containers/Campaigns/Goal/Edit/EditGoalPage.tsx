import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import * as FeatureSelectors from '../../../../state/Features/selectors';
import { GoalFormData, INITIAL_GOAL_FORM_DATA } from './domain';
import GoalFormContainer from './GoalFormContainer';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { getWorkspace } from '../../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IGoalFormService } from './GoalFormService';

const messages = defineMessages({
  errorFormMessage: {
    id: 'campaign.form.generic.error.message',
    defaultMessage:
      'There is an error with some fields in your form. Please review the data you entered.',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
  breadcrumbGoalsTitle: {
    id: 'goalEditor.breadcrumb.goals',
    defaultMessage: 'Goals',
  },
  breadcrumbNewGoalTitle: {
    id: 'goalEditor.breadcrumb.new-goal',
    defaultMessage: 'New Goal',
  },
  breadcrumbEditGoalTitle: {
    id: 'goalEditor.breadcrumb.edit-goal-name',
    defaultMessage: 'Edit {name}',
  },
});

interface State {
  goalFormData: GoalFormData;
  loading: boolean;
}

interface MapStateToProps {
  hasFeature: (featureName: string) => boolean;
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; goalId: string }>;

class EditGoalPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IGoalFormService)
  private _goalFormService: IGoalFormService;

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
    const {
      match: {
        params: { goalId },
      },
    } = this.props;

    if (goalId) {
      this.fetchData(goalId);
    }
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  fetchData = (goalId: string) => {
    this.setState({
      loading: true,
    });
    return this._goalFormService
      .loadGoalData(goalId)
      .then(goalData => {
        this.setState({
          goalFormData: goalData,
          loading: false,
        });
        return goalData;
      })
      .catch(err => {
        this.setState({ loading: false });
        this.props.notifyError(err);
      });
  };

  save = (goalFormData: GoalFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
      history,
      intl,
      location,
    } = this.props;

    const { goalFormData: initialGoalFormData } = this.state;
    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });
    this._goalFormService
      .saveGoal(organisationId, goalFormData, initialGoalFormData)
      .then(goalResource => {
        const goalUrl =
          goalFormData.triggerType === 'QUERY'
            ? `/v2/o/${organisationId}/campaigns/goals/${goalResource.id}`
            : `/v2/o/${organisationId}/campaigns/goals/${goalResource.id}/edit`;
        if (goalFormData.triggerType === 'QUERY') {
          hideSaveInProgress();
        } else {
          this.fetchData(goalResource.id).then(() => hideSaveInProgress());
        }
        history.push({
          pathname: goalUrl,
          state: { from: `${location.pathname}` },
        });
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { goalId, organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = goalId
      ? `/v2/o/${organisationId}/campaigns/goals/${goalId}`
      : `/v2/o/${organisationId}/campaigns/goals`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, goalFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const goalName =
      goalFormData.goal && goalFormData.goal.name
        ? formatMessage(messages.breadcrumbEditGoalTitle, {
            name: goalFormData.goal.name,
          })
        : formatMessage(messages.breadcrumbNewGoalTitle);

    const breadCrumbPaths = [
      {
        name: messages.breadcrumbGoalsTitle,
        path: `/v2/o/${organisationId}/campaigns/goals`,
      },
      {
        name: goalName,
      },
    ];

    return (
      <GoalFormContainer
        initialValues={goalFormData}
        breadCrumbPaths={breadCrumbPaths}
        save={this.save}
        close={this.onClose}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
  hasFeature: FeatureSelectors.hasFeature(state),
});

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
)(EditGoalPage);

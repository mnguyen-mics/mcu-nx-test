import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import * as FeatureSelectors from '../../../../state/Features/selectors';
import { GoalFormData, INITIAL_GOAL_FORM_DATA } from './domain';
import GoalForm from './GoalForm';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import GoalService from '../../../../services/GoalService';
import GoalFormService from './GoalFormService';

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
  breadcrumbTitle1: {
    id: 'goalEditor.breadcrumb.title1',
    defaultMessage: 'Goals',
  },
  breadcrumbTitle2: {
    id: 'goalEditor.breadcrumb.title2',
    defaultMessage: 'New Goal',
  },
  breadcrumbTitle3: {
    id: 'goalEditor.breadcrumb.title3',
    defaultMessage: 'Edit {name}',
  },
});

interface State {
  goalFormData: GoalFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; goalId: string }>;

class EditGoalPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      goalFormData: INITIAL_GOAL_FORM_DATA,
    };
  }

  componentDidMount() {
    const { match: { params: { goalId } } } = this.props;

    if (goalId) {
      GoalService.getGoal(goalId)
        .then(resp => resp.data)
        .then(formData => {
          this.setState({
            loading: false,
            goalFormData: {
              goal: formData,
            },
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    } else {
      this.setState({ loading: false });
    }
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (goalFormData: GoalFormData) => {
    const {
      match: { params: { organisationId } },
      notifyError,
      history,
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    return GoalFormService.saveGoal(
      organisationId,
      goalFormData,
    )
      .then(goalId => {
        hideSaveInProgress();
        const goalsUrl = `/v2/o/${organisationId}/campaigns/goals`;
        history.push(goalsUrl);
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
      match: { params: { goalId, organisationId } },
    } = this.props;

    const defaultRedirectUrl = goalId
      ? `/v2/o/${organisationId}/campaigns/goal/${goalId}`
      : `/v2/o/${organisationId}/campaigns/goals`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { loading, goalFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const goalName =
      goalFormData.goal && goalFormData.goal.name
        ? formatMessage(messages.breadcrumbTitle3, {
            name: goalFormData.goal.name,
          })
        : formatMessage(messages.breadcrumbTitle2);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/campaigns/goals`,
      },
      {
        name: goalName,
      },
    ];

    return (
      <GoalForm
        initialValues={goalFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  connect(state => ({ hasFeature: FeatureSelectors.hasFeature(state) })),
  injectNotifications,
)(EditGoalPage);

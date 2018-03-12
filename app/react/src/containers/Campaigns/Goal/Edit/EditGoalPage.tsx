import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import * as FeatureSelectors from '../../../../state/Features/selectors';
import { NewGoalFormData, INITIAL_GOAL_FORM_DATA } from './domain';
import GoalForm from './GoalForm';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import GoalService from '../../../../services/GoalService';
import GoalFormService from './GoalFormService';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart/index';
import { QueryLanguage } from '../../../../models/datamart/DatamartResource';
import { createFieldArrayModelWithMeta } from '../../../../utils/FormHelper';

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
  goalFormData: NewGoalFormData;
  loading: boolean;
  queryContainer?: any;
  queryLanguage: QueryLanguage;
}

type Props = InjectedIntlProps &
  InjectedDatamartProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; goalId: string }>;

class EditGoalPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const QueryContainer = (window as any).angular
      .element(document.body)
      .injector()
      .get('core/datamart/queries/QueryContainer');
    const defQuery = new QueryContainer(props.datamart.id);
    this.state = {
      loading: true,
      goalFormData: INITIAL_GOAL_FORM_DATA,
      queryContainer: defQuery,
      queryLanguage:
        props.datamart.storage_model_version === 'v201506'
          ? 'SELECTORQL'
          : ('OTQL' as QueryLanguage),
    };
  }

  componentDidMount() {
    const { match: { params: { goalId } } } = this.props;

    if (goalId) {
      GoalService.getGoal(goalId)
        .then(resp => resp.data)
        .then(formData => {
          GoalService.getAttributionModels(goalId)
            .then(res => res.data)
            .then(attributionModelList => {
              this.setState({
                loading: false,
                goalFormData: {
                  goal: formData,
                  attributionModels: attributionModelList.map(
                    attributionModel =>
                      createFieldArrayModelWithMeta(attributionModel, {
                        name: attributionModel.attribution_model_name,
                        group_id: attributionModel.group_id,
                        artefact_id: attributionModel.artifact_id,
                        attribution_model_type:
                          attributionModel.attribution_type,
                        attribution_model_id:
                          attributionModel.attribution_model_id,
                      }),
                  ),
                },
              });
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

  save = (goalFormData: NewGoalFormData) => {
    const {
      match: { params: { organisationId } },
      notifyError,
      history,
      intl,
    } = this.props;

    const { goalFormData: initialGoalFormData } = this.state;

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
      initialGoalFormData,
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
        queryContainer={this.state.queryContainer}
        queryLanguage={this.state.queryLanguage}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(state => ({ hasFeature: FeatureSelectors.hasFeature(state) })),
  injectNotifications,
)(EditGoalPage);

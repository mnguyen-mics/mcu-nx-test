import * as React from 'react';
import { compose } from 'recompose';
import GoalForm, { GoalFormProps } from './GoalForm';
import { INITIAL_GOAL_FORM_DATA, GoalFormData } from './domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Omit } from '../../../../utils/Types';
import { IDatamartService } from '../../../../services/DatamartService';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IGoalFormService } from './GoalFormService';
import { Loading } from '@mediarithmics-private/mcs-components-library';

export interface GoalFormLoaderProps extends Omit<GoalFormProps, 'datamart'> {
  goalId: string;
}

interface State {
  goalFormData: GoalFormData;
  datamart?: DatamartResource;
  loading: boolean;
}

type Props = GoalFormLoaderProps & InjectedNotificationProps;

class GoalFormLoader extends React.Component<Props, State> {
  @lazyInject(TYPES.IGoalFormService)
  private _goalFormService: IGoalFormService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

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
    this._goalFormService
      .loadGoalData(goalId)
      .then(goalData => {
        return this._datamartService.getDatamart(goalData.goal.datamart_id!).then(datamartRes => {
          this.setState({
            loading: false,
            goalFormData: {
              ...goalData,
              attributionModels: goalData.attributionModels,
            },
            datamart: datamartRes.data,
          });
          return datamartRes;
        });
      })
      .catch(err => {
        this.setState({ loading: false });
        notifyError(err);
      });
  }

  render() {
    const { goalId, ...rest } = this.props;
    const { loading, datamart } = this.state;

    if (loading || !datamart) return <Loading isFullScreen={true} />;

    return <GoalForm {...rest} initialValues={this.state.goalFormData} datamart={datamart} />;
  }
}

export default compose<Props, GoalFormProps>(injectNotifications)(GoalFormLoader);

import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import TableSelector, {
  TableSelectorProps,
} from '../../../components/ElementSelector/TableSelector';
import { SearchFilter } from '../../../components/ElementSelector';
import { DataColumnDefinition } from '../../../components/TableView/TableView';
import GoalService from '../../../services/GoalService';
import { GoalResource } from '../../../models/goal';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';

const GoalTableSelector: React.ComponentClass<
  TableSelectorProps<GoalResource>
> = TableSelector;

const messages = defineMessages({
  goalSelectorTitle: {
    id: 'goal-selector-title',
    defaultMessage: 'Add a goal',
  },
  goalSelectorSearchPlaceholder: {
    id: 'goal-selector-search-placeholder',
    defaultMessage: 'Search goals',
  },
  goalSelectorColumnName: {
    id: 'goal-selector-column-name',
    defaultMessage: 'Name',
  },
});

export interface GoalSelectorProps {
  selectedGoalIds: string[];
  save: (goals: GoalResource[]) => void;
  close: () => void;
}

type Props = GoalSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class GoalSelector extends React.Component<Props> {
  saveGoals = (goalIds: string[], goals: GoalResource[]) => {
    this.props.save(goals);
  };

  fetchGoals = (filter: SearchFilter) => {
    const { match: { params: { organisationId } } } = this.props;

    // TODO type options when GoalService in TS
    const options: any = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }

    return GoalService.getGoals(organisationId, options);
  };

  render() {
    const { selectedGoalIds, close, intl: { formatMessage } } = this.props;

    const columns: Array<DataColumnDefinition<GoalResource>> = [
      {
        intlMessage: messages.goalSelectorColumnName,
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
    ];

    const fetchGoal = (goalId: string) => GoalService.getGoal(goalId);

    return (
      <GoalTableSelector
        actionBarTitle={formatMessage(messages.goalSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.goalSelectorSearchPlaceholder,
        )}
        selectedIds={selectedGoalIds}
        fetchDataList={this.fetchGoals}
        fetchData={fetchGoal}
        columnsDefinitions={columns}
        save={this.saveGoals}
        close={close}
      />
    );
  }
}

export default compose<Props, GoalSelectorProps>(withRouter, injectIntl)(
  GoalSelector,
);

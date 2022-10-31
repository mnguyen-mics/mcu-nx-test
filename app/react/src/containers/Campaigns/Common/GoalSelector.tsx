import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { GoalResource } from '../../../models/goal';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { lazyInject } from '../../../config/inversify.config';
import { IGoalService } from '../../../services/GoalService';
import { TYPES } from '../../../constants/types';
import { TableSelector } from '@mediarithmics-private/mcs-components-library';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { connect } from 'react-redux';
import { TableSelectorProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-selector';
import { getWorkspace } from '../../../redux/Session/selectors';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';

const GoalTableSelector: React.ComponentClass<TableSelectorProps<GoalResource>> = TableSelector;

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
  audienceSegment: {
    id: 'goal-selector.table.audience-segment',
    defaultMessage: 'Audience Segment',
  },
  userAccountCompartment: {
    id: 'goal-selector.table.user-account-compartment',
    defaultMessage: 'User Account Compartment',
  },
  serviceType: {
    id: 'goal-selector.table.service-type',
    defaultMessage: 'Service Type',
  },
  addElementText: {
    id: 'goal-selector.table.add-element-text',
    defaultMessage: 'Add',
  },
});

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

export interface GoalSelectorProps {
  selectedGoalIds: string[];
  save: (goals: GoalResource[]) => void;
  close: () => void;
}

type Props = GoalSelectorProps &
  InjectedIntlProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

class GoalSelector extends React.Component<Props> {
  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  saveGoals = (goalIds: string[], goals: GoalResource[]) => {
    this.props.save(goals);
  };

  fetchGoals = (filter: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    // TODO type options when GoalService in TS
    const options: any = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }

    return this._goalService.getGoals(organisationId, options);
  };

  render() {
    const {
      selectedGoalIds,
      close,
      workspace,
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const columns: Array<DataColumnDefinition<GoalResource>> = [
      {
        title: formatMessage(messages.goalSelectorColumnName),
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
    ];

    const datamarts = workspace(organisationId).datamarts;

    const fetchGoal = (goalId: string) => this._goalService.getGoal(goalId);

    return (
      <GoalTableSelector
        actionBarTitle={formatMessage(messages.goalSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(messages.goalSelectorSearchPlaceholder)}
        selectedIds={selectedGoalIds}
        fetchDataList={this.fetchGoals}
        fetchData={fetchGoal}
        columnsDefinitions={columns}
        save={this.saveGoals}
        close={close}
        datamarts={datamarts}
        messages={{
          audienceSegment: intl.formatMessage(messages.audienceSegment),
          userAccountCompartment: intl.formatMessage(messages.userAccountCompartment),
          serviceType: intl.formatMessage(messages.serviceType),
          addElementText: intl.formatMessage(messages.addElementText),
        }}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, GoalSelectorProps>(
  connect(mapStateToProps, undefined),
  withRouter,
  injectIntl,
)(GoalSelector);

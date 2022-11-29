import { displayNameAdapted } from '../../Common/DimensionNameDisplay';
import { ResourceByKeywordSelector, ResourceFetcher, GetOptions } from './helpers/utils';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { GoalService, GoalsOptions } from '../../../../services/GoalService';
import { GoalResource } from '../../../../models/goal';

class GoalResourceFetcher implements ResourceFetcher<GoalResource> {
  @lazyInject(TYPES.IGoalService)
  goalService: GoalService;

  getForKeyword(options: GetOptions & GoalsOptions): Promise<GoalResource[]> {
    const queryOptions = {
      ...options,
    };
    return this.goalService
      .getGoals(options.organisation_id, queryOptions)
      .then(res => res.data.sort((a, b) => a.name.localeCompare(b.name)));
  }
}

const GoalByKeywordSelector = ResourceByKeywordSelector(
  displayNameAdapted<GoalResource>(),
  new GoalResourceFetcher(),
  'Search goal by name',
);

export { GoalByKeywordSelector };

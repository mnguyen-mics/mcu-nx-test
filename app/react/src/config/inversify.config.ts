import { QueryService, IQueryService } from './../services/QueryService';
import { AutomationFormService } from './../containers/Automations/Edit/AutomationFormService';
import {
  IAudienceFeedFormService,
  AudienceFeedFormService,
} from './../containers/Audience/Segments/Edit/AudienceFeedForm/AudienceFeedFormService';
import {
  OverlapInterval,
  IOverlapInterval,
} from './../containers/Audience/Segments/Dashboard/OverlapServices';
import {
  IAudienceSegmentFormService,
  AudienceSegmentFormService,
} from './../containers/Audience/Segments/Edit/AudienceSegmentFormService';
import {
  IAudiencePartitionsService,
  AudiencePartitionsService,
} from './../services/AudiencePartitionsService';
import {
  AudienceSegmentService,
  IAudienceSegmentService,
} from './../services/AudienceSegmentService';
import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import {
  IKeywordListService,
  KeywordListService,
} from '../services/Library/KeywordListsService';
import {
  IKeywordListFormService,
  KeywordListFormService,
} from '../containers/Library/Keyword/Edit/KeywordListFormService';
import {
  IDisplayCampaignFormService,
  DisplayCampaignFormService,
} from './../containers/Campaigns/Display/Edit/DisplayCampaignFormService';
import { IImportService, ImportService } from '../services/ImportService';
import { TYPES } from '../constants/types';
import {
  IAudienceExternalFeedService,
  AudienceExternalFeedService,
} from '../services/AudienceExternalFeedService';
import {
  IAudienceTagFeedService,
  AudienceTagFeedService,
} from '../services/AudienceTagFeedService';
import {
  IDisplayNetworkService,
  DisplayNetworkService,
} from '../services/DisplayNetworkService';
import {
  IDealsListService,
  DealsListService,
} from '../services/Library/DealListsService';
import {
  IDealListFormService,
  DealListFormService,
} from '../containers/Library/Deal/Edit/DealListFormService';
import CompartmentService, { IComparmentService } from '../services/CompartmentService';
import {
  IScenarioService,
  ScenarioService,
} from '../services/ScenarioService';
import { IAutomationFormService } from '../containers/Automations/Edit/AutomationFormService';
import {
  IGoalFormService,
  GoalFormService,
} from '../containers/Campaigns/Goal/Edit/GoalFormService';

const container = new Container();

container
  .bind<IKeywordListService>(TYPES.IKeywordListService)
  .to(KeywordListService);
container
  .bind<IKeywordListFormService>(TYPES.IKeywordListFormService)
  .to(KeywordListFormService);
container
  .bind<IAudienceSegmentService>(TYPES.IAudienceSegmentService)
  .to(AudienceSegmentService);
container
  .bind<IAudienceFeedFormService>(TYPES.IAudienceFeedFormService)
  .to(AudienceFeedFormService);
container
  .bind<IAudienceSegmentFormService>(TYPES.IAudienceSegmentFormService)
  .to(AudienceSegmentFormService);
container
  .bind<IAudiencePartitionsService>(TYPES.IAudiencePartitionsService)
  .to(AudiencePartitionsService);
container.bind<IOverlapInterval>(TYPES.IOverlapInterval).to(OverlapInterval);
container
  .bind<IDisplayCampaignFormService>(TYPES.IDisplayCampaignFormService)
  .to(DisplayCampaignFormService);
container
  .bind<IAudienceExternalFeedService>(TYPES.IAudienceExternalFeedService)
  .to(AudienceExternalFeedService);
container
  .bind<IAudienceTagFeedService>(TYPES.IAudienceTagFeedService)
  .toConstructor(AudienceTagFeedService);
container.bind<IImportService>(TYPES.IImportService).to(ImportService);
container.bind<IScenarioService>(TYPES.IScenarioService).to(ScenarioService);
container
  .bind<IDisplayNetworkService>(TYPES.IDisplayNetworkService)
  .to(DisplayNetworkService);
container.bind<IDealsListService>(TYPES.IDealsListService).to(DealsListService);
container
  .bind<IDealListFormService>(TYPES.IDealListFormService)
  .to(DealListFormService);
container
  .bind<IDealListFormService>(TYPES.IDealListFormService)
  .to(DealListFormService);
container
  .bind<IComparmentService>(TYPES.ICompartmentService)
  .to(CompartmentService);
container
  .bind<IAutomationFormService>(TYPES.IAutomationFormService)
  .to(AutomationFormService);
container.bind<IQueryService>(TYPES.IQueryService).to(QueryService);
container.bind<IGoalFormService>(TYPES.IGoalFormService).to(GoalFormService);

export const { lazyInject } = getDecorators(container, false);

export default { container };

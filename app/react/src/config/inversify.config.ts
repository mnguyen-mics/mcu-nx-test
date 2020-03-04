import {
  IPlacementListFormService,
  PlacementListFormService,
} from './../containers/Library/Placement/Edit/PlacementListFormService';
import {
  IPlacementListService,
  PlacementListService,
} from '../services/Library/PlacementListService';
import { RecommenderService } from './../services/Library/RecommenderService';
import {
  IReferenceTableService,
  ReferenceTableService,
} from './../services/ReferenceTableService';
import {
  ITableSchemaService,
  TableSchemaService,
} from './../services/TableSchemaService';
import {
  IBidOptimizerService,
  BidOptimizerService,
} from './../services/Library/BidOptimizerService';
import DataFileService, {
  IDataFileService,
} from './../services/DataFileService';
import { DatamartReplicationService } from './../services/DatamartReplicationService';
import { Container, interfaces } from 'inversify';
import { IMicsTagService, MicsTagService } from '../services/MicsTagService';
import PersistedStoreService, {
  IPersistedStoreService,
} from './../services/PersistedStoreService';
import {
  IServiceOfferPageService,
  ServiceOfferPageService,
} from './../containers/Settings/ServicesSettings/ServiceOfferPageService';
import { ICatalogService, CatalogService } from './../services/CatalogService';
import { EmailRouterService } from './../services/Library/EmailRoutersService';
import {
  VisitAnalyzerService,
  IVisitAnalyzerService,
} from './../services/Library/VisitAnalyzerService';
import {
  IAudienceSegmentFeedService,
  AudienceFeedType,
} from './../services/AudienceSegmentFeedService';
import {
  DisplayCampaignService,
  IDisplayCampaignService,
} from './../services/DisplayCampaignService';
import AdGroupFormService, {
  IAdGroupFormService,
} from './../containers/Campaigns/Display/Edit/AdGroup/AdGroupFormService';
import {
  IDisplayCreativeFormService,
  DisplayCreativeFormService,
} from './../containers/Creative/DisplayAds/Edit/DisplayCreativeFormService';
import {
  NavigatorService,
  INavigatorService,
} from './../services/NavigatorService';
import { GeonameService, IGeonameService } from './../services/GeonameService';
import { ConsentService, IConsentService } from './../services/ConsentService';
import {
  CommunityService,
  ICommunityService,
} from './../services/CommunityServices';
import UserDataService, {
  IUserDataService,
} from './../services/UserDataService';
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
import AudienceSegmentService, {
  IAudienceSegmentService,
} from '../services/AudienceSegmentService';
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
  AudienceExternalFeedService,
  IAudienceExternalFeedService,
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
  IDealListService,
  DealListService,
} from '../services/Library/DealListService';
import {
  IDealListFormService,
  DealListFormService,
} from '../containers/Library/Deal/Edit/DealListFormService';
import CompartmentService, {
  IComparmentService,
} from '../services/CompartmentService';
import { IScenarioService, ScenarioService } from '../services/ScenarioService';
import { IAutomationFormService } from '../containers/Automations/Edit/AutomationFormService';
import {
  IGoalFormService,
  GoalFormService,
} from '../containers/Campaigns/Goal/Edit/GoalFormService';
import {
  IExportService,
  ExportService,
} from '../services/Library/ExportService';
import { IUsersService, UsersService } from '../services/UsersService';
import {
  IMonitoringService,
  MonitoringService,
} from '../containers/Audience/Timeline/MonitoringService';
import {
  MlAlgorithmService,
  IMlAlgorithmService,
} from '../services/MlAlgorithmService';
import {
  IMlAlgorithmModelService,
  MlAlgorithmModelService,
} from '../services/MlAlgorithmModelService';
import {
  IMlAlgorithmVariableService,
  MlAlgorithmVariableService,
} from '../services/MlAlgorithmVariableService';
import {
  IMlFunctionService,
  MlFunctionService,
} from '../services/MlFunctionService';
import { ApiTokenService, IApiTokenService } from '../services/ApiTokenService';
import { ChannelService, IChannelService } from './../services/ChannelService';
import { ISettingsService, SettingsService } from '../services/SettingsService';
import {
  IDashboardService,
  DashboardService,
} from '../services/DashboardServices';
import { ILabelService, LabelService } from '../services/LabelsService';
import OrganisationService, {
  IOrganisationService,
} from '../services/OrganisationService';
import { IAuthService, AuthService } from '../services/AuthService';
import { IDatamartService, DatamartService } from '../services/DatamartService';
import {
  IFeedsStatsService,
  FeedsStatsService,
} from '../services/FeedsStatsService';
import {
  IAssetFileService,
  AssetFileService,
} from '../services/Library/AssetFileService';
import { IEmailRouterService } from '../services/Library/EmailRoutersService';
import { CreativeService, ICreativeService } from '../services/CreativeService';
import PluginService, { IPluginService } from '../services/PluginService';
import {
  IKeywordListService,
  KeywordListService,
} from '../services/Library/KeywordListsService';
import getDecorators from 'inversify-inject-decorators';
import { IDatamartReplicationService } from '../services/DatamartReplicationService';
import {
  IAttributionModelService,
  AttributionModelService,
} from '../services/AttributionModelService';
import {
  ILibraryCatalogService,
  LibraryCatalogService,
} from '../services/Library/LibraryCatalogService';
import {
  IServiceUsageReportService,
  ServiceUsageReportService,
} from '../services/ServiceUsageReportService';
import {
  IRuntimeSchemaService,
  RuntimeSchemaService,
} from '../services/RuntimeSchemaService';
import {
  IResourceHistoryService,
  ResourceHistoryService,
} from '../services/ResourceHistoryService';
import { GoalService, IGoalService } from '../services/GoalService';
import {
  IDatamartUsersAnalyticsService,
  DatamartUsersAnalyticsService,
} from '../services/DatamartUsersAnalyticsService';
import EmailCampaignService, {
  IEmailCampaignService,
} from '../services/EmailCampaignService';
import {
  IEmailCampaignFormService,
  EmailCampaignFormService,
} from '../containers/Campaigns/Email/Edit/EmailCampaignFormService';
import { IRecommenderService } from '../services/Library/RecommenderService';

const container = new Container();

container
  .bind<IEmailCampaignService>(TYPES.IEmailCampaignService)
  .to(EmailCampaignService);
container
  .bind<IEmailCampaignFormService>(TYPES.IEmailCampaignFormService)
  .to(EmailCampaignFormService);
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
container
  .bind<IAttributionModelService>(TYPES.IAttributionModelService)
  .to(AttributionModelService);
container.bind<IOverlapInterval>(TYPES.IOverlapInterval).to(OverlapInterval);
container
  .bind<IDisplayCampaignFormService>(TYPES.IDisplayCampaignFormService)
  .to(DisplayCampaignFormService);
container
  .bind<IAudienceSegmentFeedService>(TYPES.IAudienceExternalFeedService)
  .to(AudienceExternalFeedService)
  .whenTargetNamed('EXTERNAL_FEED');
container
  .bind<IAudienceSegmentFeedService>(TYPES.IAudienceTagFeedService)
  .to(AudienceTagFeedService)
  .whenTargetNamed('TAG_FEED');
container.bind<IImportService>(TYPES.IImportService).to(ImportService);
container.bind<IExportService>(TYPES.IExportService).to(ExportService);
container.bind<IScenarioService>(TYPES.IScenarioService).to(ScenarioService);
container.bind<IDatamartService>(TYPES.IDatamartService).to(DatamartService);
container
  .bind<IDisplayNetworkService>(TYPES.IDisplayNetworkService)
  .to(DisplayNetworkService);
container.bind<IDealListService>(TYPES.IDealListService).to(DealListService);
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
container.bind<IGoalService>(TYPES.IGoalService).to(GoalService);
container.bind<IUserDataService>(TYPES.IUserDataService).to(UserDataService);
container.bind<IUsersService>(TYPES.IUsersService).to(UsersService);
container
  .bind<IMonitoringService>(TYPES.IMonitoringService)
  .to(MonitoringService);
container
  .bind<IMlFunctionService>(TYPES.IMlFunctionService)
  .to(MlFunctionService);

container
  .bind<IMlAlgorithmService>(TYPES.IMlAlgorithmService)
  .to(MlAlgorithmService);
container
  .bind<IMlAlgorithmModelService>(TYPES.IMlAlgorithmModelService)
  .to(MlAlgorithmModelService);
container
  .bind<IMlAlgorithmVariableService>(TYPES.IMlAlgorithmVariableService)
  .to(MlAlgorithmVariableService);
container.bind<INavigatorService>(TYPES.INavigatorService).to(NavigatorService);
container.bind<IApiTokenService>(TYPES.IApiTokenService).to(ApiTokenService);
container.bind<IChannelService>(TYPES.IChannelService).to(ChannelService);
container.bind<ICommunityService>(TYPES.ICommunityService).to(CommunityService);
container.bind<IConsentService>(TYPES.IConsentService).to(ConsentService);
container.bind<IGeonameService>(TYPES.IGeonameService).to(GeonameService);
container.bind<ISettingsService>(TYPES.ISettingsService).to(SettingsService);
container.bind<IDashboardService>(TYPES.IDashboardService).to(DashboardService);
container
  .bind<IPlacementListService>(TYPES.IPlacementListService)
  .to(PlacementListService);
container
  .bind<IPlacementListFormService>(TYPES.IPlacementListFormService)
  .to(PlacementListFormService);
container.bind<ICatalogService>(TYPES.ICatalogService).to(CatalogService);
container
  .bind<ILibraryCatalogService>(TYPES.ILibraryCatalogService)
  .to(LibraryCatalogService);
container
  .bind<IServiceOfferPageService>(TYPES.IServiceOfferPageService)
  .to(ServiceOfferPageService);
container
  .bind<IFeedsStatsService>(TYPES.IFeedsStatsService)
  .to(FeedsStatsService);
container.bind<IMicsTagService>(TYPES.IMicsTagService).to(MicsTagService);
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container
  .bind<IPersistedStoreService>(TYPES.IPersistedStoreService)
  .to(PersistedStoreService);
container.bind<ILabelService>(TYPES.ILabelService).to(LabelService);
container
  .bind<IOrganisationService>(TYPES.IOrganisationService)
  .to(OrganisationService);
container.bind<IAssetFileService>(TYPES.IAssetFileService).to(AssetFileService);
container.bind<IPluginService>(TYPES.IPluginService).to(PluginService);
container.bind<ICreativeService>(TYPES.ICreativeService).to(CreativeService);
container
  .bind<IDisplayCreativeFormService>(TYPES.IDisplayCreativeFormService)
  .to(DisplayCreativeFormService);
container
  .bind<IAdGroupFormService>(TYPES.IAdGroupFormService)
  .to(AdGroupFormService);
container
  .bind<IDisplayCampaignService>(TYPES.IDisplayCampaignService)
  .to(DisplayCampaignService);
container
  .bind<IVisitAnalyzerService>(TYPES.IVisitAnalyzerService)
  .to(VisitAnalyzerService);
container
  .bind<IRecommenderService>(TYPES.IRecommenderService)
  .to(RecommenderService);
container
  .bind<IEmailRouterService>(TYPES.IEmailRouterService)
  .to(EmailRouterService);
container
  .bind<IBidOptimizerService>(TYPES.IBidOptimizerService)
  .to(BidOptimizerService);
container
  .bind<ITableSchemaService>(TYPES.ITableSchemaService)
  .to(TableSchemaService);
container
  .bind<IServiceUsageReportService>(TYPES.IServiceUsageReportService)
  .to(ServiceUsageReportService);
container
  .bind<IRuntimeSchemaService>(TYPES.IRuntimeSchemaService)
  .to(RuntimeSchemaService);
container
  .bind<IDatamartReplicationService>(TYPES.IDatamartReplicationService)
  .to(DatamartReplicationService);
container
  .bind<IResourceHistoryService>(TYPES.IResourceHistoryService)
  .to(ResourceHistoryService);
container
  .bind<IReferenceTableService>(TYPES.IReferenceTableService)
  .to(ReferenceTableService);
container.bind<IDataFileService>(TYPES.IDataFileService).to(DataFileService);
container
  .bind<interfaces.Factory<IAudienceExternalFeedService>>(
    TYPES.IAudienceExternalFeedServiceFactory,
  )
  .toFactory<IAudienceExternalFeedService>((context: interfaces.Context) => {
    return (segmentId: string) => {
      const audienceExternalFeedService = context.container.get<
        IAudienceExternalFeedService
      >(TYPES.IAudienceExternalFeedService);
      audienceExternalFeedService.segmentId = segmentId;
      return audienceExternalFeedService;
    };
  });
container
  .bind<interfaces.Factory<IAudienceTagFeedService>>(
    TYPES.IAudienceTagFeedServiceFactory,
  )
  .toFactory<IAudienceTagFeedService>((context: interfaces.Context) => {
    return (segmentId: string) => {
      const audienceTagFeedService = context.container.get<
        IAudienceTagFeedService
      >(TYPES.IAudienceTagFeedService);
      audienceTagFeedService.segmentId = segmentId;
      return audienceTagFeedService;
    };
  });
container
  .bind<interfaces.Factory<IAudienceSegmentFeedService>>(
    TYPES.IAudienceSegmentFeedServiceFactory,
  )
  .toFactory<IAudienceSegmentFeedService>((context: interfaces.Context) => {
    return (feedType: AudienceFeedType) => (segmentId: string) => {
      const audienceSegmentFeedService = context.container.getNamed<
        IAudienceSegmentFeedService
      >(
        feedType === 'EXTERNAL_FEED'
          ? TYPES.IAudienceExternalFeedService
          : TYPES.IAudienceTagFeedService,
        feedType,
      );

      audienceSegmentFeedService.segmentId = segmentId;
      audienceSegmentFeedService.feedType = feedType;
      return audienceSegmentFeedService;
    };
  });
container
  .bind<IDatamartUsersAnalyticsService>(TYPES.IDatamartUsersAnalyticsService)
  .to(DatamartUsersAnalyticsService);

export const { lazyInject } = getDecorators(container, false);

export default { container };

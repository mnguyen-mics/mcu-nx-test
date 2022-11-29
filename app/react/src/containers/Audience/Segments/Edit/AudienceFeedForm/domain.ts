import { PluginProperty } from '../../../../../models/Plugins';
import { AudienceExternalFeedResource, AudienceTagFeedResource } from '../domain';

export type PluginAudienceFeedInterface = AudienceExternalFeedResource | AudienceTagFeedResource;

export interface AudienceFeedFormModel {
  plugin: PluginAudienceFeedInterface;
  properties?: PluginProperty[];
}

export type FeedAction =
  | 'create_tag'
  | 'create_external'
  | 'create_tag_preset'
  | 'create_external_preset';

export interface FeedRouteParams {
  organisationId: string;
  segmentId: string;
  feedId: string;
  feedType: FeedAction;
}

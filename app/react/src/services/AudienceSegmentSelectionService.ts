import ApiService, { DataResponse } from './ApiService';
import { AudienceSegmentSelectionResource } from '../models/audiencesegment';

const AudienceSegmentSelectionService = {
	getAudienceSegmentSelection(campaignId: string, adGroupId: string, id: string): Promise<DataResponse<AudienceSegmentSelectionResource>> {
		const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
		return ApiService.getRequest(endpoint);
	}
}

export default AudienceSegmentSelectionService;
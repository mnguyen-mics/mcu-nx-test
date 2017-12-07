import * as React from 'react';
import { DisplayCampaignInfoResource } from '../../../../../models/campaign/display/DisplayCampaignInfoResource';
import TitleAndStatusHeader from '../../../../../components/TitleAndStatusHeader';

interface DisplayCampaignHeaderProps {
  object: DisplayCampaignInfoResource;
  translationKey: string;
}

const DisplayCampaignHeader: React.SFC<DisplayCampaignHeaderProps> = props => {

  const {
    object: {
      name: displayCampaignName,
      status: displayCampaignStatus,
    },
    translationKey,
  } = props;

  const displayCampaignStatusHeader = {
    value: displayCampaignStatus,
    translationKeyPrefix: `${translationKey}_STATUS`,
  };

  return displayCampaignName ? (
    <div className="mcs-campaign-header">
      <TitleAndStatusHeader
        headerTitle={displayCampaignName}
        headerStatus={displayCampaignStatusHeader}
        headerAttributes={[]}
      />
    </div>
    ) : (
      <div className="mcs-campaign-header">
        <i className="mcs-table-cell-loading-large" />
      </div>);

};

export default DisplayCampaignHeader;

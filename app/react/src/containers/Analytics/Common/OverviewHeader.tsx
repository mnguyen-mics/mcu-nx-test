import React from 'react';
import ContentHeader from '../../../components/ContentHeader';

interface OverviewHeaderProps {
  object: {
    name: string;
  };
}

class OverviewHeader extends React.Component<OverviewHeaderProps> {
  render() {
    const {
      object: {
        name: displayCampaignName,
      },
    } = this.props;
    return displayCampaignName ? (
      <div className="mcs-campaign-header">
        <ContentHeader
          title={displayCampaignName}
        />
      </div>
      ) : (
        <div className="mcs-campaign-header">
          <i className="mcs-table-cell-loading-large" />
        </div>);

  }
}
export default OverviewHeader;

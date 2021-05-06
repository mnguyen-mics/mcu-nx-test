import * as React from 'react';
import AudienceBuilderListPage from '../../AudienceBuilder/List/AudienceBuilderListPage';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { compose } from 'recompose';

class SegmentBuildersTab extends React.Component<InjectedFeaturesProps> {
  public render() {
    return (
      <div>
        <AudienceBuilderListPage />
      </div>
    );
  }
}

export default compose<InjectedFeaturesProps, {}>(injectFeatures)(SegmentBuildersTab);

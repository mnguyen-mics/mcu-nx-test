import * as React from 'react';
import StandardSegmentBuilderListPage from '../../StandardSegmentBuilder/List/StandardSegmentBuilderListPage';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { compose } from 'recompose';

class SegmentBuildersTab extends React.Component<InjectedFeaturesProps> {
  public render() {
    return (
      <div>
        <StandardSegmentBuilderListPage />
      </div>
    );
  }
}

export default compose<InjectedFeaturesProps, {}>(injectFeatures)(SegmentBuildersTab);

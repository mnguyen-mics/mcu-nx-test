import * as React from 'react';
import AudienceBuilderListPage from '../../AudienceBuilder/List/AudienceBuilderListPage';
import AudienceFeatureListPage from '../../AudienceBuilder/List/AudienceFeatureListPage';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import OldAudienceFeatureListPage from '../../AudienceBuilder/List/OldAudienceFeatureListPage';
import { compose } from 'recompose';

class AudienceBuilderTab extends React.Component<InjectedFeaturesProps> {
  constructor(props: InjectedFeaturesProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { hasFeature } = this.props;
    return (
      <div>
        <AudienceBuilderListPage />
        {hasFeature('new-audienceFeatureSelector') ? (
          <AudienceFeatureListPage />
        ) : (
          <OldAudienceFeatureListPage />
        )}
      </div>
    );
  }
}

export default compose<InjectedFeaturesProps, {}>(injectFeatures)(
  AudienceBuilderTab,
);

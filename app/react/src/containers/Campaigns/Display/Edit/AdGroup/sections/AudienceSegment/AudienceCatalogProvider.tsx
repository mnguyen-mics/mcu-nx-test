import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import AudienceSegmentService from '../../../../../../../services/AudienceSegmentService';
import CatalogService from '../../../../../../../services/CatalogService';
import { AudienceSegmentResource } from '../../../../../../../models/audiencesegment';
import {
  ServiceCategoryTree,
  AudienceSegmentServiceItemPublicResource,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { EditAdGroupRouteMatchParam } from '../../domain';
import injectDatamart, {
  InjectedDatamartProps,
} from '../../../../../../Datamart/injectDatamart';

interface AudienceCatalogProviderProps {
  renderProp: (
    audienceCategoryTree: ServiceCategoryTree[],
    genderServiceItems: AudienceSegmentServiceItemPublicResource[],
    ageServiceItems: AudienceSegmentServiceItemPublicResource[],
    audienceSegments: AudienceSegmentResource[],
  ) => React.ReactNode;
}

interface AudienceCatalogContainerState {
  audienceCategoryTree: ServiceCategoryTree[];
  genderServiceItems: AudienceSegmentServiceItemPublicResource[];
  ageServiceItems: AudienceSegmentServiceItemPublicResource[];
  audienceSegments: AudienceSegmentResource[];
}

type Props = AudienceCatalogProviderProps &
  InjectedDatamartProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

class AudienceCatalogProvider extends React.Component<
  Props,
  AudienceCatalogContainerState
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      audienceCategoryTree: [],
      genderServiceItems: [],
      ageServiceItems: [],
      audienceSegments: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchDetailedTargetingData = (): Promise<ServiceCategoryTree[]> => {
    const { match: { params: { organisationId } } } = this.props;

    return CatalogService.getCategoryTree(organisationId, {
      serviceType: ['AUDIENCE_DATA.AUDIENCE_SEGMENT'],
    })
      .then(categoryTree => {
        function fetchServices(
          category: ServiceCategoryTree,
        ): Promise<ServiceCategoryTree> {
          const servicesP = CatalogService.getServices(organisationId, {
            parentCategoryId: category.node.id,
          });
          const childrenCategoryP = Promise.all(
            category.children
              .filter(
                child =>
                  child.node.category_subtype !== 'AUDIENCE.AGE' &&
                  child.node.category_subtype !== 'AUDIENCE.GENDER',
              )
              .map(fetchServices),
          );

          return Promise.all([servicesP, childrenCategoryP]).then(
            ([services, childrenCategory]) => {
              return {
                node: category.node,
                children: childrenCategory,
                services,
              };
            },
          );
        }

        return Promise.all(
          categoryTree.map(category => {
            return fetchServices(category);
          }),
        );
      })
      .then(categoryTree => {
        // if 1 catalog only, hide root
        if (categoryTree.length === 1) {
          return categoryTree[0].children;
        }
        return categoryTree;
      });
  };

  fetchData = () => {
    const { match: { params: { organisationId } }, datamart } = this.props;

    Promise.all([
      this.fetchDetailedTargetingData(),
      CatalogService.getAudienceSegmentServices(organisationId, {
        categorySubtype: ['AUDIENCE.GENDER'],
      }),
      CatalogService.getAudienceSegmentServices(organisationId, {
        categorySubtype: ['AUDIENCE.AGE'],
      }),
      AudienceSegmentService.getSegments(organisationId, datamart.id, {
        max_results: 500,
      }).then(res => res.data),
    ]).then(
      ([
        audienceCategoryTree,
        genderServiceItems,
        ageServiceItems,
        audienceSegments,
      ]) => {
        this.setState(prevState => ({
          audienceCategoryTree,
          genderServiceItems,
          ageServiceItems,
          audienceSegments,
        }));
      },
    );
  };

  render() {
    const {
      audienceCategoryTree,
      genderServiceItems,
      ageServiceItems,
      audienceSegments,
    } = this.state;

    const { renderProp } = this.props;

    return (
      <div>
        {renderProp(
          audienceCategoryTree,
          genderServiceItems,
          ageServiceItems,
          audienceSegments,
        )}
      </div>
    );
  }
}

export default compose<Props, AudienceCatalogProviderProps>(
  withRouter,
  injectDatamart,
)(AudienceCatalogProvider);

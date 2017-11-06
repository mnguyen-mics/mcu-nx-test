import * as React from 'react';
import { Row, Col } from 'antd';
import { FormattedMessage, injectIntl, defineMessages, InjectedIntlProps } from 'react-intl';
import { WrappedFieldArrayProps, InjectedFormProps } from 'redux-form';

import messages from '../../../messages';
import FormSection from '../../../../../../../components/Form/FormSection';
import ButtonStyleless from '../../../../../../../components/ButtonStyleless';
import { MenuItemProps } from '../../../../../../../components/SearchAndMultiSelect';
import { TreeData } from '../../../../../../../components/TreeSelect';
import FormSearchAndMultiSelect from '../../../../../../../components/Form/FormSearchAndMultiSelect';
import FormSearchAndTreeSelect from '../../../../../../../components/Form/FormSearchAndTreeSelect';
import {
  AudienceSegmentServiceItemPublicResource,
  ServiceCategoryTree,
} from '../../../../../../../services/CatalogService';
import { generateFakeId, isFakeId } from '../../../../../../../utils/FakeIdHelper';
import {
  AudienceSegmentResource,
  AudienceSegmentFieldModel,
  AudienceSegmentSelectionResource,
} from './AudienceCatalogContainer';

const internalMessages = defineMessages({
  selectPlaceholder: {
    id: 'audience.catalog.select.placeholder',
    defaultMessage: 'Browse Audience...',
  },
  genderLabel: {
    id: 'audience.catalog.gender.label',
    defaultMessage: 'Gender',
  },
  genderNotice: {
    id: 'audience.catalog.gender.notice',
    defaultMessage: 'INCLUDE people who match at least ONE of the following',
  },
  genderTooltip: {
    id: 'audience.catalog.gender.tooltip',
    defaultMessage: 'Lorem ipsum',
  },
  ageLabel: {
    id: 'audience.catalog.age.label',
    defaultMessage: 'Age',
  },
  ageNotice: {
    id: 'audience.catalog.age.notice',
    defaultMessage: 'INCLUDE people who match at least ONE of the following',
  },
  ageTooltip: {
    id: 'audience.catalog.age.tooltip',
    defaultMessage: 'Lorem ipsum',
  },
  detailedTargetingLabel: {
    id: 'audience.catalog.detailed-targeting.label',
    defaultMessage: 'Detailed Targeting',
  },
  detailedTargetingNotice: {
    id: 'audience.catalog.detailed-targeting.notice',
    defaultMessage: 'INCLUDE people who match at least ONE of the following',
  },
  detailedTargetingTooltip: {
    id: 'audience.catalog.detailed-targeting.tooltip',
    defaultMessage: 'Lorem ipsum',
  },
  detailedTargetingExclusionLabel: {
    id: 'audience.catalog.detailed-targeting-exclusion.label',
    defaultMessage: 'Exclude',
  },
  detailedTargetingExclusionNotice: {
    id: 'audience.catalog.detailed-targeting-exclusion.notice',
    defaultMessage: 'EXCLUDE people who match at least ONE of the following',
  },
  detailedTargetingExclusionTooltip: {
    id: 'audience.catalog.detailed-targeting-exclusion.tooltip',
    defaultMessage: 'Lorem ipsum',
  },
  excludeLinkMsg: {
    id: 'audience.catalog.exclude-people.link.label',
    defaultMessage: 'Exclude People',
  },
  mySegmentCategory: {
    id: 'audience.catalog.my-segment-category.label',
    defaultMessage: 'My Segment',
  },
});

export interface AudienceCatalogProps {
  audienceCategoryTree: ServiceCategoryTree[];
  genderServiceItems: AudienceSegmentServiceItemPublicResource[];
  ageServiceItems: AudienceSegmentServiceItemPublicResource[];
  audienceSegments: AudienceSegmentResource[];
  RxF: InjectedFormProps;
}

interface AudienceCatalogState {
  showExclude: boolean;
}

function toMenuItemProps(
  audienceServiceItem: AudienceSegmentServiceItemPublicResource,
): MenuItemProps {
  return {
    key: audienceServiceItem.segmentId,
    label: audienceServiceItem.name,
  };
}

function toTreeData(category: ServiceCategoryTree): TreeData {

  const categoryChildren = (category.children || []).map(toTreeData);
  const serviceChildren = (category.services || []).map(service => ({
    value: (service as any).segmentId,
    label: service.name,
    parentLabel: category.node.name,
    isLeaf: true,
  }));

  return {
    value: category.node.id,
    label: category.node.name,
    isLeaf: false,
    children: [
      ...categoryChildren,
      ...serviceChildren,
    ],
  };
}

type JoinedProps =
  AudienceCatalogProps &
  InjectedIntlProps &
  WrappedFieldArrayProps<AudienceSegmentFieldModel>;

function getServices(categoryTree: ServiceCategoryTree[]): AudienceSegmentServiceItemPublicResource[] {

  function traverse(treeNode: ServiceCategoryTree): AudienceSegmentServiceItemPublicResource[] {
    return treeNode.children.reduce((acc, child) => {
      return [
        ...acc,
        ...traverse(child),
      ];
    }, treeNode.services as AudienceSegmentServiceItemPublicResource[] || []);
  }

  return categoryTree.reduce((acc, treeNode) => {
    return [
      ...acc,
      ...traverse(treeNode),
    ];
  }, []);
}

class AudienceCatalog extends React.Component<JoinedProps, AudienceCatalogState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = { showExclude: false };
  }

  getAllFieldsWithTheirIndex = () => {
    const allFields = this.props.fields.getAll() || [];
    // Filter out those who have been deleted by user
    const allActiveFields = allFields
      .map((field, index) => ({ field, index }))
      .filter(({field}) => !field.deleted);
    return allActiveFields;
  }

  getSelectedSegment = (
    serviceItems: AudienceSegmentServiceItemPublicResource[],
    audienceSegments: AudienceSegmentResource[] = [],
    excludedOnly: boolean = false,
  ): string[] => {
    const selectedSegmentIds = this.getAllFieldsWithTheirIndex()
      .filter(({field}) => field.resource.exclude === excludedOnly)
      .map(({field}) => {
        return field.resource.audienceSegmentId;
      });
    const serviceSegmentIds = serviceItems.map(s => s.segmentId);
    const audienceSegmentIds = audienceSegments.map(s => s.id);
    const allSegmentIds = serviceSegmentIds.concat(audienceSegmentIds);
    return selectedSegmentIds.filter(id => allSegmentIds.includes(id));
  }

  markAsDeleted = (segmentId: string) => {
    const {
      fields,
      RxF: { change },
    } = this.props;

    const fieldWithIndex = this.getAllFieldsWithTheirIndex()
      .find(({field}) => field.resource.audienceSegmentId === segmentId);

    if (fieldWithIndex) {
      const isTransient = isFakeId(fieldWithIndex.field.id);
      if (!isTransient) {
        const newFields = this.getAllFieldsWithTheirIndex().map(({ field }) => {
          if (field.resource.audienceSegmentId === segmentId) {
            return { ...field, deleted: true };
          } else {
            return field;
          }
        });
        change((fields as any).name, newFields);

      } else {
        fields.remove(fieldWithIndex.index);
      }
    }
  }

  addSegment = (segmentId: string, exclude: boolean = false) => {
    const { fields } = this.props;
    const resource: AudienceSegmentSelectionResource = {
      audienceSegmentId: segmentId,
      exclude,
    };
    const allFields = fields.getAll() || [];
    this.props.RxF.change((fields as any).name, allFields.concat([{
      id: generateFakeId(),
      resource,
    }]));
  }

  toggleSelected = (segmentId: string) => {
    const selectedValue = this.getAllFieldsWithTheirIndex()
      .find(({field}) => field.resource.audienceSegmentId === segmentId);
    if (selectedValue) {
      this.markAsDeleted(segmentId);
    } else {
      this.addSegment(segmentId);
    }
  }

  handleChange = (forExcludedSegment: boolean = false) => (segmentIds: string[]) => {
    const selectedSegmentIds = this.getAllFieldsWithTheirIndex()
      .filter(({field}) => field.resource.exclude === forExcludedSegment)
      .map(({field}) => field.resource.audienceSegmentId);

    // Leave already checked ids and add new ones
    segmentIds.forEach(segmentId => {
      const found = selectedSegmentIds.includes(segmentId);
      if (!found) {
        this.addSegment(segmentId, forExcludedSegment);
      }
    });

    // Delete those that are not checked anymore
    selectedSegmentIds.forEach(selectedSegmentId => {
      if (!segmentIds.includes(selectedSegmentId)) {
        this.markAsDeleted(selectedSegmentId);
      }
    });
  }

  buildTreeDataFromOwnSegments = (audienceSegments: AudienceSegmentResource[]): TreeData => {
    const { intl: { formatMessage } } = this.props;
    return {
      value: 'own-datamart-segments',
      label: formatMessage(internalMessages.mySegmentCategory),
      isLeaf: false,
      children: audienceSegments.map(segment => ({
        value: segment.id,
        label: segment.name,
        isLeaf: true,
      })),
    };
  }

  toogleShowExclude = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.setState(prevState => ({ showExclude: !prevState.showExclude }));
  }

  render() {

    const {
      intl: { formatMessage },
      genderServiceItems,
      ageServiceItems,
      audienceCategoryTree,
      audienceSegments,
    } = this.props;

    const genderServiceItemDataSource = genderServiceItems.map(toMenuItemProps);
    const ageServiceItemDataSource = ageServiceItems.map(toMenuItemProps);
    const detailedTargetingDataSource = audienceCategoryTree.map(toTreeData)
      .concat(
        audienceSegments.length > 0 ?
        // add datamart's segments to tree if any
        this.buildTreeDataFromOwnSegments(audienceSegments) :
        [],
      );

    const excludedSegmentFound = this.getAllFieldsWithTheirIndex().find(({field}) => !!field.resource.exclude);
    const showExclude = excludedSegmentFound || this.state.showExclude;

    return (
      <div className="audience-catalog">
        <FormSection
          title={messages.sectionTitleAudience}
          subtitle={messages.sectionSubtitleAudience}
        />
        <Row>
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage {...internalMessages.genderNotice} />
            </Col>
          </Row>
          <FormSearchAndMultiSelect
            label={formatMessage(internalMessages.genderLabel)}
            placeholder={formatMessage(internalMessages.selectPlaceholder)}
            datasource={genderServiceItemDataSource}
            tooltipProps={{ title: formatMessage(internalMessages.genderTooltip) }}
            value={this.getSelectedSegment(genderServiceItems)}
            handleClickOnRemove={this.markAsDeleted}
            handleClickOnItem={this.toggleSelected}
          />
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage {...internalMessages.ageNotice} />
            </Col>
          </Row>
          <FormSearchAndMultiSelect
            label={formatMessage(internalMessages.ageLabel)}
            placeholder={formatMessage(internalMessages.selectPlaceholder)}
            datasource={ageServiceItemDataSource}
            tooltipProps={{ title: formatMessage(internalMessages.ageTooltip) }}
            value={this.getSelectedSegment(ageServiceItems)}
            handleClickOnRemove={this.markAsDeleted}
            handleClickOnItem={this.toggleSelected}
          />
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage {...internalMessages.detailedTargetingNotice} />
            </Col>
          </Row>
          <FormSearchAndTreeSelect
            label={formatMessage(internalMessages.detailedTargetingLabel)}
            placeholder={formatMessage(internalMessages.selectPlaceholder)}
            datasource={detailedTargetingDataSource}
            tooltipProps={{ title: formatMessage(internalMessages.detailedTargetingTooltip) }}
            value={this.getSelectedSegment(getServices(audienceCategoryTree), audienceSegments)}
            handleClickOnRemove={this.markAsDeleted}
            handleOnChange={this.handleChange()}

          />
          <div className={showExclude ? '' : 'hide-section'}>
            <Row className="audience-selection-notice">
              <Col span={10} offset={4}>
                <FormattedMessage {...internalMessages.detailedTargetingExclusionNotice} />
              </Col>
            </Row>
            <FormSearchAndTreeSelect
              label={formatMessage(internalMessages.detailedTargetingExclusionLabel)}
              placeholder={formatMessage(internalMessages.selectPlaceholder)}
              datasource={detailedTargetingDataSource}
              tooltipProps={{ title: formatMessage(internalMessages.detailedTargetingExclusionTooltip) }}
              value={this.getSelectedSegment(getServices(audienceCategoryTree), audienceSegments, true)}
              handleClickOnRemove={this.markAsDeleted}
              handleOnChange={this.handleChange(true)}
            />
          </div>
          <Row className={showExclude ? 'hide-section' : ''}>
            <Col span={3} offset={11}>
              <ButtonStyleless onClick={this.toogleShowExclude}>
                <FormattedMessage {...internalMessages.excludeLinkMsg} />
              </ButtonStyleless>
            </Col>
          </Row>
        </Row>
      </div>
    );
  }

}

export default injectIntl(AudienceCatalog);

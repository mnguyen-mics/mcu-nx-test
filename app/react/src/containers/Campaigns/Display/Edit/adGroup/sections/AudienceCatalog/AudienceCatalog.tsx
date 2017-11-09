import * as React from 'react';
import { Row, Col } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
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
  AudienceSegmentFieldModel,
} from './AudienceCatalogContainer';
import { AudienceSegmentResource, AudienceSegmentSelectionResource } from '../../../../../../../models/Audience';
import audienceCatalogMsgs from './messages';

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

  markAsDeleted = (forExcludedSegment: boolean = false) => (segmentId: string) => {
    const {
      fields,
      RxF: { change },
    } = this.props;

    const fieldWithIndex = this.getAllFieldsWithTheirIndex()
      .find(({field}) => field.resource.audienceSegmentId === segmentId && field.resource.exclude === forExcludedSegment);

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
      this.markAsDeleted()(segmentId);
    } else {
      this.addSegment(segmentId);
    }
  }

  handleChange = (forExcludedSegment: boolean = false) => (segmentIds: string[]) => {
    const {
      audienceCategoryTree,
      audienceSegments,
      fields,
     } = this.props;

    const allFields = fields.getAll() || [];

    const newFields: AudienceSegmentFieldModel[] = [];

    const currentlySelectedIds = this.getSelectedSegment(getServices(audienceCategoryTree), audienceSegments, forExcludedSegment);
    const unrelatedSelectedIds = allFields.filter(field =>
      !currentlySelectedIds.includes(field.resource.audienceSegmentId) || field.resource.exclude !== forExcludedSegment,
    );
    newFields.push(...unrelatedSelectedIds);

    // Leave already checked ids and add new ones
    segmentIds.forEach(segmentId => {
      const found = allFields.find(field =>
        field.resource.audienceSegmentId === segmentId && field.resource.exclude === forExcludedSegment,
      );
      if (!found) {
        newFields.push({
          id: generateFakeId(),
          resource: {
            audienceSegmentId: segmentId,
            exclude: forExcludedSegment,
          },
         });
      } else if (found.deleted) {
        newFields.push({ ...found, deleted: false });
      }
    });

    // Delete those that are not checked anymore
    allFields.filter(field => field.resource.exclude === forExcludedSegment).forEach(field => {
      const found = segmentIds.includes(field.resource.audienceSegmentId);
      if (!found) {
        const isTransient = isFakeId(field.id);
        if (!isTransient) {
          newFields.push({ ...field, deleted: true });
        }
      } else {
        newFields.push({ ...field });
      }
    });

    this.props.RxF.change((fields as any).name, newFields);
  }

  buildTreeDataFromOwnSegments = (audienceSegments: AudienceSegmentResource[]): TreeData => {
    const { intl: { formatMessage } } = this.props;
    return {
      value: 'own-datamart-segments',
      label: formatMessage(audienceCatalogMsgs.mySegmentCategory),
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
              <FormattedMessage {...audienceCatalogMsgs.genderNotice} />
            </Col>
          </Row>
          <FormSearchAndMultiSelect
            label={formatMessage(audienceCatalogMsgs.genderLabel)}
            placeholder={formatMessage(audienceCatalogMsgs.selectPlaceholder)}
            datasource={genderServiceItemDataSource}
            tooltipProps={{ title: formatMessage(audienceCatalogMsgs.genderTooltip) }}
            value={this.getSelectedSegment(genderServiceItems)}
            handleClickOnRemove={this.markAsDeleted()}
            handleClickOnItem={this.toggleSelected}
          />
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage {...audienceCatalogMsgs.ageNotice} />
            </Col>
          </Row>
          <FormSearchAndMultiSelect
            label={formatMessage(audienceCatalogMsgs.ageLabel)}
            placeholder={formatMessage(audienceCatalogMsgs.selectPlaceholder)}
            datasource={ageServiceItemDataSource}
            tooltipProps={{ title: formatMessage(audienceCatalogMsgs.ageTooltip) }}
            value={this.getSelectedSegment(ageServiceItems)}
            handleClickOnRemove={this.markAsDeleted()}
            handleClickOnItem={this.toggleSelected}
          />
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage {...audienceCatalogMsgs.detailedTargetingNotice} />
            </Col>
          </Row>
          <FormSearchAndTreeSelect
            label={formatMessage(audienceCatalogMsgs.detailedTargetingLabel)}
            placeholder={formatMessage(audienceCatalogMsgs.selectPlaceholder)}
            datasource={detailedTargetingDataSource}
            tooltipProps={{ title: formatMessage(audienceCatalogMsgs.detailedTargetingTooltip) }}
            value={this.getSelectedSegment(getServices(audienceCategoryTree), audienceSegments)}
            handleClickOnRemove={this.markAsDeleted()}
            handleOnChange={this.handleChange()}

          />
          <div className={showExclude ? '' : 'hide-section'}>
            <Row className="audience-selection-notice">
              <Col span={10} offset={4}>
                <FormattedMessage {...audienceCatalogMsgs.detailedTargetingExclusionNotice} />
              </Col>
            </Row>
            <FormSearchAndTreeSelect
              label={formatMessage(audienceCatalogMsgs.detailedTargetingExclusionLabel)}
              placeholder={formatMessage(audienceCatalogMsgs.selectPlaceholder)}
              datasource={detailedTargetingDataSource}
              tooltipProps={{ title: formatMessage(audienceCatalogMsgs.detailedTargetingExclusionTooltip) }}
              value={this.getSelectedSegment(getServices(audienceCategoryTree), audienceSegments, true)}
              handleClickOnRemove={this.markAsDeleted(true)}
              handleOnChange={this.handleChange(true)}
            />
          </div>
          <Row className={showExclude ? 'hide-section' : ''}>
            <Col span={3} offset={11}>
              <ButtonStyleless onClick={this.toogleShowExclude} className="action-button">
                <FormattedMessage {...audienceCatalogMsgs.excludeLinkMsg} />
              </ButtonStyleless>
            </Col>
          </Row>
        </Row>
      </div>
    );
  }

}

export default injectIntl(AudienceCatalog);

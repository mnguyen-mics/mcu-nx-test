import * as React from 'react';
import cuid from 'cuid';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';
import { Row, Col } from 'antd/lib/grid';
import { compose } from 'recompose';
import provideAudienceCatalog, {
  InjectedAudienceCatalogProps,
} from './provideAudienceCatalog';
import { SegmentFieldModel } from '../../domain';
import FormSection from '../../../../../../../components/Form/FormSection';
import messages from '../../../messages';
import audienceCatalogMsgs from './messages';
import {
  ServiceCategoryTree,
  AudienceSegmentServiceItemPublicResource,
} from '../../../../../../../models/servicemanagement/PublicServiceItemResource';
import { AudienceSegmentResource } from '../../../../../../../models/audiencesegment/AudienceSegmentResource';
import FormSearchAndMultiSelect from '../../../../../../../components/Form/FormSearchAndMultiSelect';
import { MenuItemProps } from '../../../../../../../components/SearchAndMultiSelect';
import ButtonStyleless from '../../../../../../../components/ButtonStyleless';
import { ReduxFormChangeProps } from '../../../../../../../utils/FormHelper';
import CustomTreeSelect, { TreeData } from '../../../../../../../components/Form/CustomTreeSelect';

export interface AudienceCatalogFormSectionProps extends ReduxFormChangeProps {}

type Props = WrappedFieldArrayProps<SegmentFieldModel> &
  InjectedIntlProps &
  InjectedAudienceCatalogProps &
  AudienceCatalogFormSectionProps;

interface State {
  showExclude: boolean;
}

class AudienceCatalogFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showExclude: false };
  }

  computeDetailedTargetingDataSource = () => {
    const { audienceCategoryTree, audienceSegments } = this.props;

    const detailedTargetingDataSource = audienceCategoryTree.data
      .map(child =>
        toTreeData(child, [
          {
            value: child.node.id,
            label: child.node.name,
            isLeaf: false,
          },
        ]),
      )
      .concat(
        audienceSegments.data.length > 0
          ? // add datamart's segments to tree if any
            this.buildTreeDataFromOwnSegments(audienceSegments.data)
          : [],
      );

    return detailedTargetingDataSource;
  };

  getSelectedSegment = (
    serviceItems: AudienceSegmentServiceItemPublicResource[],
    audienceSegments: AudienceSegmentResource[] = [],
    excludedOnly: boolean = false,
  ): string[] => {
    const selectedSegmentIds: string[] = [];
    this.props.fields.getAll().forEach(field => {
      if (field.model.exclude === excludedOnly) {
        selectedSegmentIds.push(field.model.audience_segment_id);
      }
    });

    const serviceSegmentIds = serviceItems.map(s => s.segment_id);
    const audienceSegmentIds = audienceSegments.map(s => s.id);
    const allSegmentIds = serviceSegmentIds.concat(audienceSegmentIds);
    return selectedSegmentIds.filter(id => allSegmentIds.includes(id));
  };

  markAsDeleted = (forExcludedSegment: boolean = false) => (
    segmentId: string,
  ) => {
    const { fields } = this.props;

    fields.getAll().some((field, index) => {
      if (
        field.model.audience_segment_id === segmentId &&
        field.model.exclude === forExcludedSegment
      ) {
        fields.remove(index);
        return true;
      }
      return false;
    });
  };

  addSegment = (segmentId: string, exclude: boolean = false) => {
    const { fields } = this.props;
    const model = {
      audience_segment_id: segmentId,
      exclude,
    };

    fields.push({
      key: cuid(),
      model,
      meta: { name: segmentId },
    });
  };

  toggleSelected = (segmentId: string) => {
    const selectedValue = this.props.fields
      .getAll()
      .find(({ model }) => model.audience_segment_id === segmentId);
    if (selectedValue) {
      this.markAsDeleted()(segmentId);
    } else {
      this.addSegment(segmentId);
    }
  };

  findChildrenSegmentIdsFromIds = (ids: string[]): string[] => {
    const detailedTargetingDataSource = this.computeDetailedTargetingDataSource();

    const finalReduceFunction = (
      id: string,
      treeData: TreeData,
      returnLeaves: boolean,
    ): string[] => {
      if (treeData.children !== undefined) {
        const childFoundValues = treeData.children.map((child: TreeData) => {
          return findLeafValuesFromValueAux(id, child, returnLeaves);
        });
        return childFoundValues.reduce((l, acc) => {
          return acc.concat(l);
        }, []);
      }
      return [];
    };

    const findLeafValuesFromValueAux = (
      id: string,
      treeData: TreeData,
      returnLeaves: boolean,
    ): string[] => {
      if (!returnLeaves) {
        // We are still searching the id
        if (treeData.value === id) {
          // The Id is found
          if (treeData.isLeaf) {
            return [treeData.value];
          } else {
            return finalReduceFunction(id, treeData, true);
          }
        } else {
          return finalReduceFunction(id, treeData, false);
        }
      } else {
        // The Id was already found
        if (treeData.isLeaf) {
          return [treeData.value];
        } else {
          return finalReduceFunction(id, treeData, true);
        }
      }
    };

    const findLeafValuesFromValue = (id: string): string[] => {
      const childFoundValues = detailedTargetingDataSource.map(
        (treeData: TreeData) => {
          return findLeafValuesFromValueAux(id, treeData, false);
        },
      );
      return childFoundValues.reduce((l, acc) => {
        return acc.concat(l);
      }, []);
    };
    const idsToBeReturned = ids.map(findLeafValuesFromValue);

    return idsToBeReturned
      .reduce((partialList, acc) => {
        return acc.concat(partialList);
      }, [])
      .reverse();
  };

  handleChange = (
    audienceCategoryTree: ServiceCategoryTree[],
    audienceSegments: AudienceSegmentResource[],
    forExcludedSegment: boolean = false,
  ) => (inputIds: string[]) => {
    const { fields, formChange } = this.props;

    const segmentIds = this.findChildrenSegmentIdsFromIds(inputIds);

    const allFields = fields.getAll() || [];

    const newFields: SegmentFieldModel[] = [];

    const currentlySelectedIds = this.getSelectedSegment(
      getServices(audienceCategoryTree),
      audienceSegments,
      forExcludedSegment,
    );
    const unrelatedSelectedFields = allFields.filter(
      field =>
        !currentlySelectedIds.includes(field.model.audience_segment_id) ||
        field.model.exclude !== forExcludedSegment,
    );
    newFields.push(...unrelatedSelectedFields);

    // Leave already checked ids and add new ones
    segmentIds.forEach(segmentId => {
      const found = allFields.find(
        field =>
          field.model.audience_segment_id === segmentId &&
          field.model.exclude === forExcludedSegment,
      );
      if (!found) {
        newFields.push({
          key: cuid(),
          model: {
            audience_segment_id: segmentId,
            exclude: forExcludedSegment,
          },
          meta: { name: segmentId },
        });
      }
    });

    // Don't add those that are not checked anymore
    allFields
      .filter(field => field.model.exclude === forExcludedSegment)
      .forEach(field => {
        const found = segmentIds.includes(field.model.audience_segment_id);
        if (found) {
          newFields.push({ ...field });
        }
      });

    formChange((fields as any).name, newFields);
  };

  buildTreeDataFromOwnSegments = (
    audienceSegments: AudienceSegmentResource[],
  ): TreeData => {
    const {
      intl: { formatMessage },
    } = this.props;
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
  };

  toogleShowExclude = () => {
    this.setState(prevState => ({ showExclude: !prevState.showExclude }));
  };

  render() {
    const {
      intl,
      fields,
      audienceCategoryTree,
      genderServiceItems,
      ageServiceItems,
      audienceSegments,
    } = this.props;

    const genderServiceItemDataSource = genderServiceItems.data.map(
      toMenuItemProps,
    );
    const ageServiceItemDataSource = ageServiceItems.data.map(toMenuItemProps);

    const detailedTargetingDataSource = this.computeDetailedTargetingDataSource();

    const excludedSegmentFound = fields
      .getAll()
      .find(({ model }) => !!model.exclude);
    const showExclude = excludedSegmentFound || this.state.showExclude;

    return (
      <div className="audience-catalog">
        <FormSection
          subtitle={messages.sectionSubtitleAudience}
          title={messages.sectionTitleAudience}
        />

        <Row>
          <Row className="audience-selection-notice">
            <Col span={15} offset={4}>
              <FormattedMessage {...audienceCatalogMsgs.genderNotice} />
            </Col>
          </Row>
          <FormSearchAndMultiSelect
            label={intl.formatMessage(audienceCatalogMsgs.genderLabel)}
            placeholder={intl.formatMessage(
              audienceCatalogMsgs.selectPlaceholder,
            )}
            datasource={genderServiceItemDataSource}
            loading={genderServiceItems.loading}
            tooltipProps={{
              title: intl.formatMessage(audienceCatalogMsgs.genderTooltip),
            }}
            value={this.getSelectedSegment(genderServiceItems.data)}
            handleClickOnRemove={this.markAsDeleted()}
            handleClickOnItem={this.toggleSelected}
          />
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage {...audienceCatalogMsgs.ageNotice} />
            </Col>
          </Row>
          <FormSearchAndMultiSelect
            label={intl.formatMessage(audienceCatalogMsgs.ageLabel)}
            placeholder={intl.formatMessage(
              audienceCatalogMsgs.selectPlaceholder,
            )}
            datasource={ageServiceItemDataSource}
            loading={ageServiceItems.loading}
            tooltipProps={{
              title: intl.formatMessage(audienceCatalogMsgs.ageTooltip),
            }}
            value={this.getSelectedSegment(ageServiceItems.data)}
            handleClickOnRemove={this.markAsDeleted()}
            handleClickOnItem={this.toggleSelected}
          />
          <Row className="audience-selection-notice">
            <Col span={10} offset={4}>
              <FormattedMessage
                {...audienceCatalogMsgs.detailedTargetingNotice}
              />
            </Col>
          </Row>
          <CustomTreeSelect
            label={intl.formatMessage(
              audienceCatalogMsgs.detailedTargetingLabel,
            )}
            placeholder={intl.formatMessage(
              audienceCatalogMsgs.selectPlaceholder,
            )}
            dataSource={detailedTargetingDataSource}
            loading={audienceCategoryTree.loading || audienceSegments.loading}
            tooltipProps={{
              title: intl.formatMessage(
                audienceCatalogMsgs.detailedTargetingTooltip,
              ),
            }}
            value={this.getSelectedSegment(
              getServices(audienceCategoryTree.data),
              audienceSegments.data,
            )}
            handleClickOnRemove={this.markAsDeleted()}
            handleOnChange={this.handleChange(
              audienceCategoryTree.data,
              audienceSegments.data,
            )}
          />
          <div className={showExclude ? '' : 'hide-section'}>
            <Row className="audience-selection-notice">
              <Col span={15} offset={4}>
                <FormattedMessage
                  {...audienceCatalogMsgs.detailedTargetingExclusionNotice}
                />
              </Col>
            </Row>
            <CustomTreeSelect
              label={intl.formatMessage(
                audienceCatalogMsgs.detailedTargetingExclusionLabel,
              )}
              placeholder={intl.formatMessage(
                audienceCatalogMsgs.selectPlaceholder,
              )}
              dataSource={detailedTargetingDataSource}
              loading={audienceCategoryTree.loading || audienceSegments.loading}
              tooltipProps={{
                title: intl.formatMessage(
                  audienceCatalogMsgs.detailedTargetingExclusionTooltip,
                ),
              }}
              value={this.getSelectedSegment(
                getServices(audienceCategoryTree.data),
                audienceSegments.data,
                true,
              )}
              handleClickOnRemove={this.markAsDeleted(true)}
              handleOnChange={this.handleChange(
                audienceCategoryTree.data,
                audienceSegments.data,
                true,
              )}
            />
          </div>
          <Row className={showExclude ? 'hide-section' : ''}>
            <Col span={3} offset={14}>
              <ButtonStyleless
                onClick={this.toogleShowExclude}
                className="action-button"
              >
                <FormattedMessage {...audienceCatalogMsgs.excludeLinkMsg} />
              </ButtonStyleless>
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
}

export default compose<Props, AudienceCatalogFormSectionProps>(
  injectIntl,
  provideAudienceCatalog,
)(AudienceCatalogFormSection);

/////////////
// HELPERS //
/////////////
function toMenuItemProps(
  audienceServiceItem: AudienceSegmentServiceItemPublicResource,
): MenuItemProps {
  return {
    key: audienceServiceItem.segment_id,
    label: audienceServiceItem.name,
  };
}

function toTreeData(
  category: ServiceCategoryTree,
  ancestors: TreeData[],
): TreeData {
  const categoryChildren = (category.children || []).map(child => {
    const ancestor = {
      value: child.node.id,
      label: child.node.name,
      isLeaf: false,
    };
    return toTreeData(child, ancestors.concat(ancestor));
  });

  const serviceChildren = (category.services || []).map(service => ({
    // TODO remove as any
    value: (service as any).segment_id,
    label: service.name,
    parentLabel: category.node.name,
    ancestors,
    isLeaf: true,
  }));

  return {
    value: category.node.id,
    label: category.node.name,
    isLeaf: false,
    children: [...categoryChildren, ...serviceChildren],
  };
}

function getServices(
  categoryTree: ServiceCategoryTree[],
): AudienceSegmentServiceItemPublicResource[] {
  function traverse(
    treeNode: ServiceCategoryTree,
  ): AudienceSegmentServiceItemPublicResource[] {
    return treeNode.children.reduce((acc, child) => {
      return [...acc, ...traverse(child)];
    }, (treeNode.services as AudienceSegmentServiceItemPublicResource[]) || []);
  }

  return categoryTree.reduce((acc, treeNode) => {
    return [...acc, ...traverse(treeNode)];
  }, []);
}

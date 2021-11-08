import * as React from 'react';
import _ from 'lodash';
import { Input, Row, Col, Breadcrumb, AutoComplete, Spin, Button as AntButton } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  IAudienceFeatureService,
  AudienceFeatureSearchSettings,
} from '../../../../services/AudienceFeatureService';
import { StandardSegmentBuilderFormData } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AudienceFeatureFolderResource } from '../../../../models/audienceFeature/AudienceFeatureResource';
import {
  Button,
  Actionbar,
  McsIcon,
  EmptyTableView,
  CollectionView,
  Loading,
} from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureCard from './AudienceFeatureCard';
import { FolderOutlined } from '@ant-design/icons';
import { messages } from '../constants';
import Layout from 'antd/lib/layout/layout';
import { PaginationProps } from 'antd/lib/pagination';
import AudienceFeatureSelectionTag from './AudienceFeatureSelectionTag';
export interface Filter {
  currentPage: number;
  pageSize: number;
}
interface MapStateToProps {
  formValues: StandardSegmentBuilderFormData;
}

export interface FinalValueResource {
  value: string;
  path: string[];
}

export interface AudienceFeatureSelection {
  [key: string]: {
    audienceFeature: AudienceFeatureResource;
    finalValues: FinalValueResource[] | undefined;
  };
}

export interface AudienceFeatureSelectorProps {
  datamartId: string;
  save: (audienceFeatureSelection: AudienceFeatureSelection) => void;
  close: () => void;
  isSettingsMode?: boolean;
}

interface State {
  isLoading: boolean;
  audienceFeatureFolders?: AudienceFeatureFolderResource[];
  currentAudienceFeatureFolder?: AudienceFeatureFolderResource;
  currentAudienceFeatures?: AudienceFeatureResource[];
  hideFolder?: boolean;
  searchSettings: AudienceFeatureSearchSettings;
  total?: number;
  searchValue?: string;
  searchIsTooLong?: boolean;
  searchIsForbidden?: boolean;
  searchOptions: Array<{ value: string }>;
  isLoadingFinalValues: boolean;
  isJobExecutionExisting?: boolean;
  audienceFeatureSelection: AudienceFeatureSelection;
}

type Props = MapStateToProps &
  AudienceFeatureSelectorProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceFeatureSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      searchSettings: {
        currentPage: 1,
        pageSize: 12,
      },
      hideFolder: false,
      searchOptions: [],
      isLoadingFinalValues: false,
      audienceFeatureSelection: {},
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    this.fetchBaseFoldersAndFeatures();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { searchSettings: prevSearchSettings } = prevState;
    const { searchSettings, currentAudienceFeatureFolder } = this.state;
    const { datamartId, intl } = this.props;
    if (searchSettings !== prevSearchSettings) {
      this.setState({
        isLoading: true,
      });
      const options = this._audienceFeatureService.buildAudienceFeatureOptions(
        searchSettings,
        currentAudienceFeatureFolder?.id,
      );
      this._audienceFeatureService
        .searchAudienceFeatures(datamartId, options)
        .then(response => {
          this.setState({
            isLoading: false,
            currentAudienceFeatures: response.data.data.elements,
            total: response.data.data.total_results,
          });
          if (
            response.data.infos.find(
              info => info.info_name === 'maxFinalValueReach' && info.info_value === 'true',
            )
          ) {
            this.props.notifyWarning({
              message: intl.formatMessage(messages.maxFinalValueReachWarningTitle),
              description: intl.formatMessage(messages.maxFinalValueReachWarningBody),
            });
          }
        })
        .catch(err => {
          this.setState({
            isLoading: false,
            currentAudienceFeatures: [],
            total: 0,
            audienceFeatureFolders: [],
          });
        });
    }
  }

  setBaseFolderAndFeatures = (
    folders: AudienceFeatureFolderResource[],
    baseFeatures: AudienceFeatureResource[],
    total?: number,
    isJobExecutionExisting?: boolean,
  ) => {
    this.setState({
      audienceFeatureFolders: folders,
      currentAudienceFeatureFolder: undefined,
      currentAudienceFeatures: baseFeatures,
      total: total,
      isLoading: false,
      isJobExecutionExisting: isJobExecutionExisting,
    });
  };

  onFailure = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      isLoading: false,
    });
  };

  fetchBaseFoldersAndFeatures = () => {
    const { datamartId } = this.props;
    const { searchSettings } = this.state;
    this._audienceFeatureService.fetchFoldersAndFeatures(
      datamartId,
      this.setBaseFolderAndFeatures,
      this.onFailure,
      searchSettings,
      true,
    );
  };

  getSearchOptions = () => {
    const { intl } = this.props;
    const { searchSettings } = this.state;
    return {
      placeholder: intl.formatMessage(messages.searchAudienceFeature),
      onSearch: (value: string) => {
        this.setState({
          searchSettings: {
            ...searchSettings,
            keywords: value,
            currentPage: 1,
          },
          hideFolder: !!value,
          currentAudienceFeatureFolder: undefined,
        });
      },
    };
  };

  getBreadCrumb = () => {
    const { currentAudienceFeatureFolder, audienceFeatureFolders } = this.state;
    const { intl } = this.props;
    const buildBreadCrumbs = () => {
      if (audienceFeatureFolders) {
        const path: AudienceFeatureFolderResource[] = [];
        const pathLoop = (folder: AudienceFeatureFolderResource) => {
          path.unshift(folder);
          if (folder.parent_id) {
            const parent = audienceFeatureFolders.find(f => f.id === folder.parent_id);
            pathLoop(parent!);
          }
        };
        if (currentAudienceFeatureFolder) {
          pathLoop(currentAudienceFeatureFolder);
        }

        const breadcrmb = path.map(elt => {
          return (
            <Breadcrumb.Item key={elt.id}>
              <Button onClick={this.onSelectFolder(elt.id, true)}>{elt.name}</Button>
            </Breadcrumb.Item>
          );
        });
        breadcrmb.unshift(
          <Breadcrumb.Item key={'root_folder'}>
            <Button onClick={this.onSelectFolder(undefined, true)}>
              {intl.formatMessage(messages.audienceFeatures)}
            </Button>
          </Breadcrumb.Item>,
        );
        return breadcrmb;
      }
      return;
    };
    return (
      <Breadcrumb className='mcs-standardSegmentBuilder_breadCrumb mcs-breadcrumb'>
        {buildBreadCrumbs()}
      </Breadcrumb>
    );
  };

  onSelectFolder = (folderId?: string, resetKeywords?: boolean) => () => {
    const { searchSettings, audienceFeatureFolders } = this.state;
    this.setState({
      searchSettings: {
        ...searchSettings,
        keywords: resetKeywords ? '' : searchSettings.keywords,
        currentPage: 1,
      },
      searchValue: '',
      hideFolder: !!folderId,
      currentAudienceFeatureFolder: folderId
        ? audienceFeatureFolders?.find(f => f.id === folderId)
        : undefined,
    });
  };

  onSelectFeature = (
    audienceFeature: AudienceFeatureResource,
    finalValue?: FinalValueResource,
  ) => () => {
    const { audienceFeatureSelection } = this.state;

    const newAudienceFeatureSelection = audienceFeatureSelection;
    const featureId = audienceFeature.id;
    if (Object.keys(audienceFeatureSelection).includes(featureId)) {
      const addOrDeleteValue = (val?: FinalValueResource) => {
        const values = audienceFeatureSelection[featureId].finalValues;
        if (!val) return undefined;
        return values?.map(valueResource => valueResource.value).includes(val.value)
          ? values.filter(v => v.value !== val.value)
          : values?.concat(val);
      };
      if (!!finalValue) {
        const newValues = addOrDeleteValue(finalValue);
        if (newValues?.length === 0) delete newAudienceFeatureSelection[featureId];
        else
          newAudienceFeatureSelection[featureId] = {
            finalValues: !!audienceFeatureSelection[featureId].finalValues
              ? newValues
              : [finalValue],
            audienceFeature: audienceFeature,
          };
      } else {
        if (!audienceFeatureSelection[featureId].finalValues)
          delete audienceFeatureSelection[featureId];
      }
    } else {
      newAudienceFeatureSelection[`${featureId}`] = {
        finalValues: finalValue ? [finalValue] : undefined,
        audienceFeature: audienceFeature,
      };
    }
    this.setState({
      audienceFeatureSelection: newAudienceFeatureSelection,
    });
  };

  onTagClose = (featureId: string) => () => {
    const { audienceFeatureSelection } = this.state;
    const newAudienceFeatureSelection = audienceFeatureSelection;
    const keyToRemove = Object.keys(newAudienceFeatureSelection).find(key => key === featureId);
    if (keyToRemove) {
      delete newAudienceFeatureSelection[keyToRemove];
      this.setState({
        audienceFeatureSelection: newAudienceFeatureSelection,
      });
    }
  };

  onFilterChange = (newFilter: Filter) => {
    const { searchSettings } = this.state;
    this.setState({
      searchSettings: {
        ...searchSettings,
        currentPage: newFilter.currentPage,
        pageSize: newFilter.pageSize,
      },
    });
  };

  onAddButtonClick = () => {
    const { audienceFeatureSelection } = this.state;
    const { save } = this.props;
    save(audienceFeatureSelection);
  };

  renderSelector = () => {
    const { intl, datamartId, notifyError, isSettingsMode } = this.props;
    const {
      audienceFeatureFolders,
      currentAudienceFeatures,
      currentAudienceFeatureFolder,
      searchSettings,
      hideFolder,
      isLoading,
      total,
      searchValue,
      searchOptions,
      isLoadingFinalValues,
      isJobExecutionExisting,
      audienceFeatureSelection,
      searchIsTooLong,
      searchIsForbidden,
    } = this.state;

    const noData =
      (!audienceFeatureFolders || audienceFeatureFolders.length === 0) &&
      (!currentAudienceFeatures || currentAudienceFeatures.length === 0);

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    const audienceFeatures = currentAudienceFeatures
      ? currentAudienceFeatures.map(feature => {
          const variables = feature.variables || [];
          const finalValues = _.flattenDeep(
            variables.map(v => {
              const values = v.values || [];
              return values.map(value => {
                return { value: value, path: v.path };
              });
            }),
          );
          return (
            <AudienceFeatureCard
              key={'audience_feature-card-' + feature.id}
              audienceFeature={feature}
              onSelectFeature={this.onSelectFeature}
              searchValue={searchValue}
              audienceFeatureSelection={audienceFeatureSelection}
              finalValues={finalValues}
              isSettingsMode={isSettingsMode}
            />
          );
        })
      : [];
    const pagination: PaginationProps = {
      className: 'ant-table-pagination mini float-right',
      pageSizeOptions: ['12', '24', '36', '48'],
      size: 'small',
      current: searchSettings.currentPage,
      pageSize: searchSettings.pageSize,
      showSizeChanger: true,
      total: total,
      onChange: (page: number, size: number) =>
        this.onFilterChange({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const onSearch = (searchText: string) => {
      const isMoreThan5Words = searchText.split(' ').length > 5;
      const regexp = /^[\w\.éèç/'à@-\s]*$/;
      const hasSpecialCharacters = !searchText.match(regexp);

      this.setState(
        {
          searchValue: searchText,
          searchIsTooLong: isMoreThan5Words,
          searchIsForbidden: hasSpecialCharacters,
        },
        () => {
          setTimeout(() => {
            if (
              this.state.isJobExecutionExisting &&
              searchText === this.state.searchValue &&
              !isMoreThan5Words &&
              !hasSpecialCharacters
            ) {
              if (searchText.length > 2) {
                this.setState({
                  isLoadingFinalValues: true,
                });
                this._audienceFeatureService
                  .getFinalValues(datamartId, searchText)
                  .then(res => {
                    const finalValuesObject = res.data;
                    if (searchText === this.state.searchValue) {
                      this.setState({
                        searchOptions: finalValuesObject.values.map(val => {
                          return {
                            value: val,
                          };
                        }),
                        isLoadingFinalValues: false,
                      });
                    }
                  })
                  .catch(error => {
                    notifyError(error);
                    this.setState({
                      searchOptions: [],
                      isLoadingFinalValues: false,
                    });
                  });
              } else {
                this.setState({ searchOptions: [] });
              }
            }
          }, 500);
        },
      );
    };

    const onSelect = (searchText: string) => {
      this.setState({
        searchSettings: {
          ...searchSettings,
          finalValues: isJobExecutionExisting ? searchText : undefined,
          keywords: searchText,
          currentPage: 1,
        },
        hideFolder: !!searchText,
        currentAudienceFeatureFolder: undefined,
        searchValue: searchText,
      });
    };

    const onPressEnter = () => {
      if (!searchIsTooLong && !searchIsForbidden) {
        this.setState({
          searchSettings: {
            ...searchSettings,
            finalValues: isJobExecutionExisting ? searchValue : undefined,
            keywords: searchValue,
            currentPage: 1,
          },
          hideFolder: !!searchValue,
          currentAudienceFeatureFolder: undefined,
          searchValue: searchValue,
        });
      }
    };

    return (
      <React.Fragment>
        <AutoComplete
          className={`mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature ${
            searchIsTooLong || searchIsForbidden
              ? ' mcs-standardSegmentBuilder_searchInputError'
              : ''
          }`}
          value={searchValue}
          options={searchOptions}
          dropdownMatchSelectWidth={352}
          style={{ width: 400 }}
          onSelect={onSelect}
          onSearch={onSearch}
          notFoundContent={isLoadingFinalValues && <Spin />}
          autoFocus={true}
        >
          <Input.Search
            size='large'
            placeholder={intl.formatMessage(messages.searchAudienceFeature)}
            onPressEnter={onPressEnter}
            onSearch={onPressEnter}
            disabled={searchIsTooLong || searchIsForbidden}
          />
        </AutoComplete>

        <span
          className={`mcs-standardSegmentBuilder_searchInputErrorMessage ${
            searchIsTooLong || searchIsForbidden ? 'visible' : ''
          }`}
        >
          {searchIsTooLong
            ? intl.formatMessage(messages.searchIsTooLong)
            : intl.formatMessage(messages.searchIsForbidden)}
        </span>
        <div className='mcs-standardSegmentBuilder_tagsContainer'>
          {Object.keys(audienceFeatureSelection).map(featureId => {
            return (
              <AudienceFeatureSelectionTag
                key={featureId}
                datamartId={datamartId}
                audienceFeatureId={featureId}
                finalValues={audienceFeatureSelection[`${featureId}`].finalValues}
                onClose={this.onTagClose}
              />
            );
          })}
        </div>
        {!searchSettings.keywords && this.getBreadCrumb()}
        <Row gutter={16}>
          {!hideFolder &&
            audienceFeatureFolders
              ?.filter(f =>
                currentAudienceFeatureFolder
                  ? currentAudienceFeatureFolder?.id === f.parent_id
                  : f.parent_id === null,
              )
              ?.map(folder => {
                return (
                  <Col key={folder.id ? folder.id : 'root_key'} span={4}>
                    <div
                      className='mcs-standardSegmentBuilder_folder'
                      onClick={this.onSelectFolder(folder.id)}
                    >
                      <FolderOutlined className='mcs-standardSegmentBuilder_folderIcon' />
                      <br />
                      <span>{folder.name}</span>
                      <br />
                      <span className='mcs-standardSegmentBuilder_folderChildNumber'>
                        {folder.audience_features_ids?.length} features
                      </span>
                    </div>
                  </Col>
                );
              })}
        </Row>
        <div className='mcs-standardSegmentBuilder_featureCardContainer'>
          {noData ? (
            <EmptyTableView iconType='warning' message={intl.formatMessage(messages.noData)} />
          ) : (
            <CollectionView
              collectionItems={audienceFeatures!}
              pagination={pagination}
              loading={isLoading}
              gutter={16}
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  render() {
    const {
      intl: { formatMessage },
      close,
    } = this.props;

    return (
      <Layout className={'mcs-selector-layout'}>
        <Actionbar pathItems={[formatMessage(messages.addAudienceFeature)]} edition={true}>
          <AntButton
            type='primary'
            className='mcs-primary mcs-standardSegmentBuilder_AddFeatureButton'
            onClick={this.onAddButtonClick}
          >
            <McsIcon type='plus' />
            <FormattedMessage {...messages.addAudienceFeatureButton} />
          </AntButton>
          <McsIcon type='close' className='close-icon mcs-table-cursor' onClick={close} />
        </Actionbar>
        <Layout className={`mcs-edit-container mcs-standardSegmentBuilder_featureSelector`}>
          {this.renderSelector()}
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, AudienceFeatureSelectorProps>(
  injectIntl,
  injectNotifications,
)(AudienceFeatureSelector);

import * as React from 'react';
import _ from 'lodash';
import { Input, Row, Col, Breadcrumb } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  IAudienceFeatureService,
  AudienceFeatureSearchSettings,
} from '../../../../services/AudienceFeatureService';
import { AudienceBuilderFormData } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { NewAudienceFeaturesByFolder } from '../../../../models/audienceFeature/AudienceFeatureResource';
import {
  Button,
  Actionbar,
  McsIcon,
  EmptyTableView,
  CollectionView,
} from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureCard from './AudienceFeatureCard';
import { FolderOutlined } from '@ant-design/icons';
import { messages } from '../constants';
import Layout from 'antd/lib/layout/layout';
import { PaginationProps } from 'antd/lib/pagination';

const Search = Input.Search;
export interface Filter {
  currentPage: number;
  pageSize: number;
}
interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

export interface AudienceFeatureSelectorProps {
  datamartId: string;
  save: (audienceFeatures: AudienceFeatureResource[]) => void;
  close: () => void;
}

interface State {
  isLoading: boolean;
  audienceFeaturesByFolder?: NewAudienceFeaturesByFolder;
  selectedAudienceFeature?: AudienceFeatureResource;
  selectedFolder?: NewAudienceFeaturesByFolder;
  currentAudienceFeatures?: AudienceFeatureResource[];
  hideFolder?: boolean;
  searchSettings: AudienceFeatureSearchSettings;
  total?: number;
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
    const { searchSettings, selectedFolder } = this.state;
    const { datamartId } = this.props;
    if (searchSettings !== prevSearchSettings) {
      this.setState({
        isLoading: true,
      });
      const options = this._audienceFeatureService.buildAudienceFeatureOptions(
        searchSettings,
        selectedFolder?.id,
      );
      this._audienceFeatureService.getAudienceFeatures(datamartId, options).then(response =>
        this.setState({
          isLoading: false,
          currentAudienceFeatures: response.data,
          total: response.total,
        }),
      );
    }
  }

  setBaseFolderAndFeatures = (
    baseFolder: NewAudienceFeaturesByFolder,
    baseFeatures: AudienceFeatureResource[],
    total?: number,
  ) => {
    this.setState({
      audienceFeaturesByFolder: baseFolder,
      selectedFolder: baseFolder,
      currentAudienceFeatures: baseFeatures,
      total: total,
      isLoading: false,
    });
  };

  onFailure = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      isLoading: false,
    });
  };

  fetchBaseFoldersAndFeatures = () => {
    const { datamartId, intl } = this.props;
    const { searchSettings } = this.state;
    this._audienceFeatureService.fetchBaseFoldersAndFeatures(
      datamartId,
      intl.formatMessage(messages.audienceFeatures),
      this.setBaseFolderAndFeatures,
      this.onFailure,
      searchSettings,
    );
  };

  getSearchOptions = () => {
    const { intl } = this.props;
    const { searchSettings, audienceFeaturesByFolder } = this.state;
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
          selectedFolder: value ? undefined : audienceFeaturesByFolder,
        });
      },
    };
  };

  getBreadCrumb = () => {
    const { selectedFolder, audienceFeaturesByFolder } = this.state;
    const buildBreadCrumbs = () => {
      if (selectedFolder && audienceFeaturesByFolder) {
        const path: NewAudienceFeaturesByFolder[] = [];
        const pathLoop = (folder: NewAudienceFeaturesByFolder) => {
          path.unshift(folder);
          if (folder.parent_id) {
            const parent = this._audienceFeatureService.findParentFolder(
              audienceFeaturesByFolder,
              folder.parent_id,
            );
            pathLoop(parent!);
          }
        };
        pathLoop(selectedFolder);

        return path.map(elt => {
          return (
            <Breadcrumb.Item key={elt.id}>
              <Button onClick={this.onSelectFolder(elt)}>{elt.name}</Button>
            </Breadcrumb.Item>
          );
        });
      }
      return;
    };
    return (
      <Breadcrumb className='mcs-audienceBuilder_breadCrumb mcs-breadcrumb'>
        {buildBreadCrumbs()}
      </Breadcrumb>
    );
  };

  onSelectFolder = (folder?: NewAudienceFeaturesByFolder) => () => {
    const { searchSettings } = this.state;
    this.setState({
      searchSettings: {
        ...searchSettings,
      },
      hideFolder: folder?.id !== 'none',
      selectedFolder: folder,
    });
  };

  onSelectFeature = (id: string) => () => {
    const { save } = this.props;
    const { currentAudienceFeatures } = this.state;
    const selectedAudienceFeature = currentAudienceFeatures?.find(
      audienceFeature => audienceFeature.id === id,
    );
    this.setState(
      {
        selectedAudienceFeature,
      },
      () => {
        if (selectedAudienceFeature) save([selectedAudienceFeature]);
      },
    );
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

  renderSelector = () => {
    const {
      audienceFeaturesByFolder,
      selectedAudienceFeature,
      currentAudienceFeatures,
      selectedFolder,
      searchSettings,
      hideFolder,
      isLoading,
      total,
    } = this.state;
    const disabled =
      !!audienceFeaturesByFolder &&
      audienceFeaturesByFolder.children.length === 0 &&
      audienceFeaturesByFolder.audience_features_ids?.length === 0;

    if (disabled) {
      return <EmptyTableView iconType='warning' message={''} />;
    }

    const audienceFeatures = currentAudienceFeatures
      ? currentAudienceFeatures.map(feature => {
          return (
            <AudienceFeatureCard
              key={'audience_feature-card-' + feature.id}
              audienceFeature={feature}
              selectedAudienceFeature={selectedAudienceFeature}
              onSelectFeature={this.onSelectFeature}
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
    return (
      <React.Fragment>
        <Search className='mcs-search-input' {...this.getSearchOptions()} />
        {!searchSettings.keywords && this.getBreadCrumb()}
        <Row gutter={16}>
          {!hideFolder &&
            !!selectedFolder &&
            selectedFolder.children.map(folder => {
              return (
                <Col key={folder.id ? folder.id : 'root_key'} span={4}>
                  <div className='mcs-audienceBuilder_folder' onClick={this.onSelectFolder(folder)}>
                    <FolderOutlined className='mcs-audienceBuilder_folderIcon' />
                    <br />
                    <span>{folder.name}</span>
                    <br />
                    <span className='mcs-audienceBuilder_folderChildNumber'>
                      {folder.audience_features_ids?.length} features
                    </span>
                  </div>
                </Col>
              );
            })}
        </Row>
        <div className='mcs-audienceBuilder_featureCardContainer'>
          <CollectionView
            collectionItems={audienceFeatures!}
            pagination={pagination}
            loading={isLoading}
            gutter={16}
          />
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
          <McsIcon type='close' className='close-icon mcs-table-cursor' onClick={close} />
        </Actionbar>
        <Layout className={`mcs-edit-container mcs-audienceBuilder_featureSelector`}>
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

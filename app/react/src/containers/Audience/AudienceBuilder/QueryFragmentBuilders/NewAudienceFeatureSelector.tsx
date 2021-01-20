import * as React from 'react';
import _ from 'lodash';
import { Input, Row, Col, Breadcrumb } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { messages } from '../constants';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  IAudienceFeatureService,
  AudienceFeatureOptions,
} from '../../../../services/AudienceFeatureService';
import { AudienceBuilderFormData } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { SearchFilter } from '../../../../components/ElementSelector';
import {
  AudienceFeatureResource,
  AudienceFeatureFolderResource,
} from '../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AudienceFeaturesByFolder } from '../../../../models/audienceFeature/AudienceFeatureResource';
import {
  SelectorLayout,
  McsIcon,
  Button,
} from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureCard from './AudienceFeatureCard';

const Search = Input.Search;

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

export interface NewAudienceFeatureSelectorProps {
  datamartId: string;
  demographicIds?: string[];
  save: (audienceFeatures: AudienceFeatureResource[]) => void;
  close: () => void;
}

interface State {
  isLoading: boolean;
  audienceFeaturesByFolder?: AudienceFeaturesByFolder;
  selectedAudienceFeature?: AudienceFeatureResource;
  selectedFolder?: AudienceFeaturesByFolder;
  keywords?: string;
}

type Props = MapStateToProps &
  NewAudienceFeatureSelectorProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class NewAudienceFeatureSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    const { datamartId, intl } = this.props;
    this.setState({
      isLoading: true,
    });
    this.fetchFolders(datamartId).then(audienceFeatureFolders => {
      this.fetchAudienceFeatures()
        .then(features => {
          const folderLoop = (
            folders: AudienceFeatureFolderResource[],
          ): AudienceFeaturesByFolder[] => {
            return folders.map(folder => {
              return {
                id: folder.id,
                name: folder.name,
                parent_id: folder.parent_id,
                audience_features: features.filter(
                  (f: AudienceFeatureResource) =>
                    folder.audience_feature_ids.includes(f.id),
                ),
                children: folderLoop(
                  audienceFeatureFolders.filter(
                    (f: AudienceFeatureFolderResource) =>
                      folder.children_ids.includes(f.id),
                  ),
                ),
              };
            });
          };
          const baseFolder = {
            id: '0',
            name: intl.formatMessage(messages.audienceFeatures),
            parent_id: 'root',
            children: folderLoop(
              audienceFeatureFolders.filter(
                (f: AudienceFeatureFolderResource) => f.parent_id === '0',
              ),
            ),
            audience_features: [],
          };
          this.setState({
            audienceFeaturesByFolder: baseFolder,
            selectedFolder: baseFolder,
            isLoading: false,
          });
        })
        .catch(err => {
          this.props.notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    });
  }

  fetchFolders = (datamartId: string) => {
    return this._audienceFeatureService
      .getAudienceFeatureFolders(datamartId)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        this.props.notifyError(err);
        return [];
      });
  };

  fetchAudienceFeatures = (filter?: SearchFilter) => {
    const { datamartId, demographicIds } = this.props;

    const options: AudienceFeatureOptions = {
      // ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter?.keywords) {
      options.keywords = [filter.keywords];
    }

    if (demographicIds && demographicIds.length >= 1) {
      options.exclude = demographicIds;
    }

    options.fake_dataset = true;

    return this._audienceFeatureService
      .getAudienceFeatures(datamartId, options)
      .then(res => {
        return res.data;
      });
  };

  saveAudienceFeatures = (
    audienceFeatureIds: string[],
    audienceFeatures: AudienceFeatureResource[],
  ) => {
    this.props.save(audienceFeatures);
  };

  getSearchOptions = () => {
    const { intl } = this.props;
    return {
      placeholder: intl.formatMessage(messages.searchAudienceFeature),
      onSearch: (value: string) => this.setState({ keywords: value }),
    };
  };

  getBreadCrumb = () => {
    const { selectedFolder, audienceFeaturesByFolder } = this.state;
    const buildBreadCrumbs = () => {
      if (selectedFolder && audienceFeaturesByFolder) {
        const path: AudienceFeaturesByFolder[] = [];
        const pathLoop = (folder: AudienceFeaturesByFolder) => {
          const parent = this.getFolder(folder.parent_id);
          if (folder.id === '0') {
            path.unshift(audienceFeaturesByFolder);
          } else {
            path.unshift(folder);
            if (parent) pathLoop(parent);
          }
        };
        pathLoop(selectedFolder);

        return path.map(elt => {
          return (
            <Breadcrumb.Item key={elt.id}>
              <Button onClick={this.onSelectFolder(elt.id)}>{elt.name}</Button>
            </Breadcrumb.Item>
          );
        });
      }
      return;
    };
    return (
      <Breadcrumb className="mcs-audienceBuilder_breadCrumb">
        {buildBreadCrumbs()}
      </Breadcrumb>
    );
  };

  getFolder = (id: string) => {
    const { audienceFeaturesByFolder } = this.state;
    let selectedFolder: AudienceFeaturesByFolder | undefined;
    const loop = (folder: AudienceFeaturesByFolder) => {
      if (id === '0') {
        selectedFolder = audienceFeaturesByFolder;
      } else {
        folder.children.forEach(f => {
          if (f.id === id) {
            selectedFolder = f;
          } else {
            loop(f);
          }
        });
      }
    };
    if (audienceFeaturesByFolder) loop(audienceFeaturesByFolder);
    return selectedFolder;
  };

  onSelectFolder = (id: string) => () => {
    this.setState({
      selectedFolder: this.getFolder(id),
    });
  };

  onSelectFeature = (id: string) => () => {
    const { audienceFeaturesByFolder } = this.state;
    let selectedAudienceFeature = audienceFeaturesByFolder?.audience_features.find(
      f => f.id === id,
    );
    if (!selectedAudienceFeature) {
      const loop = (children: AudienceFeaturesByFolder[]) => {
        children.forEach(folder => {
          const childFeature = folder.audience_features.find(f => f.id === id);
          if (childFeature) {
            selectedAudienceFeature = childFeature;
          } else {
            loop(folder.children);
          }
        });
      };
      if (audienceFeaturesByFolder) loop(audienceFeaturesByFolder.children);
    }

    this.setState({
      selectedAudienceFeature,
    });
  };

  render() {
    const {
      audienceFeaturesByFolder,
      selectedAudienceFeature,
      selectedFolder,
    } = this.state;

    const {
      intl: { formatMessage },
      save,
      close,
    } = this.props;

    const handleAdd = () => {
      if (selectedAudienceFeature) {
        save([selectedAudienceFeature]);
      }
    };

    return (
      <SelectorLayout
        className="mcs-audienceBuilder_featureSelector"
        actionBarTitle={formatMessage(messages.addAudienceFeature)}
        handleAdd={handleAdd}
        handleClose={close}
        disabled={
          !!audienceFeaturesByFolder &&
          audienceFeaturesByFolder.children.length === 0 &&
          audienceFeaturesByFolder.audience_features.length === 0
        }
        addButtonText={formatMessage(messages.addAudienceFeatureButton)}
        noElementText=""
      >
        <Search className="mcs-search-input" {...this.getSearchOptions()} />
        {this.getBreadCrumb()}
        <Row gutter={16}>
          {!!selectedFolder &&
            selectedFolder.children.map(folder => {
              return (
                <Col key={folder.id} span={4}>
                  <div
                    className="mcs-audienceBuilder_folder"
                    onClick={this.onSelectFolder(folder.id)}
                  >
                    <McsIcon type="email" />
                    <br />
                    <span>{folder.name}</span>
                    <br />
                    <span className="mcs-audienceBuilder_folderChildNumber">
                      {folder.audience_features.length} features
                    </span>
                  </div>
                </Col>
              );
            })}
        </Row>
        <Row className="mcs-audienceBuilder_featureCardContainer" gutter={16}>
          {!!selectedFolder &&
            selectedFolder.audience_features.map(feature => {
              return (
                <Col key={feature.id} span={6}>
                  <AudienceFeatureCard
                    audienceFeature={feature}
                    selectedAudienceFeature={selectedAudienceFeature}
                    onSelectFeature={this.onSelectFeature}
                  />
                </Col>
              );
            })}
        </Row>
      </SelectorLayout>
    );
  }
}

export default compose<Props, NewAudienceFeatureSelectorProps>(
  injectIntl,
  injectNotifications,
)(NewAudienceFeatureSelector);

import * as React from 'react';
import _ from 'lodash';
import { Input, Row, Col, Breadcrumb } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { messages } from '../constants';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAudienceFeatureService } from '../../../../services/AudienceFeatureService';
import { AudienceBuilderFormData } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AudienceFeaturesByFolder } from '../../../../models/audienceFeature/AudienceFeatureResource';
import {
  SelectorLayout,
  Button,
} from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureCard from './AudienceFeatureCard';
import { FolderOutlined } from '@ant-design/icons';
import {
  fetchFolders,
  fetchAudienceFeatures,
  creatBaseFolder,
  getFolder
} from '../constants';

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
    const { datamartId, demographicIds, intl, notifyError } = this.props;
    this.setState({
      isLoading: true,
    });
    fetchFolders(this._audienceFeatureService, datamartId, notifyError).then(
      (audienceFeatureFolders) => {
        fetchAudienceFeatures(
          this._audienceFeatureService,
          datamartId,
          undefined,
          demographicIds,
        )
          .then((features) => {
            const baseFolder = creatBaseFolder(
              intl.formatMessage(messages.audienceFeatures),
              audienceFeatureFolders,
              features,
            );
            this.setState({
              audienceFeaturesByFolder: baseFolder,
              selectedFolder: baseFolder,
              isLoading: false,
            });
          })
          .catch((err) => {
            this.props.notifyError(err);
            this.setState({
              isLoading: false,
            });
          });
      },
    );
  }

  saveAudienceFeatures = (audienceFeatures: AudienceFeatureResource[]) => {
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
          const parent = getFolder(folder.parent_id, audienceFeaturesByFolder);
          if (folder.id === null) {
            path.unshift(audienceFeaturesByFolder);
          } else {
            path.unshift(folder);
            if (parent) pathLoop(parent);
          }
        };
        pathLoop(selectedFolder);

        return path.map((elt) => {
          return (
            <Breadcrumb.Item key={elt.id ? elt.id : 'root_key'}>
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

  onSelectFolder = (id: string | null) => () => {
    const { audienceFeaturesByFolder } = this.state;
    this.setState({
      selectedFolder: getFolder(id, audienceFeaturesByFolder),
    });
  };

  onSelectFeature = (id: string) => () => {
    const { audienceFeaturesByFolder } = this.state;
    let selectedAudienceFeature = audienceFeaturesByFolder?.audience_features.find(
      (f) => f.id === id,
    );
    if (!selectedAudienceFeature) {
      const loop = (children: AudienceFeaturesByFolder[]) => {
        children.forEach((folder) => {
          const childFeature = folder.audience_features.find(
            (f) => f.id === id,
          );
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
            selectedFolder.children.map((folder) => {
              return (
                <Col key={folder.id ? folder.id : 'root_key'} span={4}>
                  <div
                    className="mcs-audienceBuilder_folder"
                    onClick={this.onSelectFolder(folder.id)}
                  >
                    <FolderOutlined className="menu-icon" />
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
            selectedFolder.audience_features.map((feature) => {
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

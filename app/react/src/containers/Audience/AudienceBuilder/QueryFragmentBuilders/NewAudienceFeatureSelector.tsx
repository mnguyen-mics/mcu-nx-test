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
  AudienceFeatureOptions,
} from '../../../../services/AudienceFeatureService';
import { AudienceBuilderFormData } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AudienceFeaturesByFolder } from '../../../../models/audienceFeature/AudienceFeatureResource';
import {
  Button,
  Actionbar,
  McsIcon,
  EmptyTableView,
  Loading,
} from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureCard from './AudienceFeatureCard';
import { FolderOutlined } from '@ant-design/icons';
import { messages } from '../constants';
import Layout from 'antd/lib/layout/layout';

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
    this.setState({
      isLoading: true,
    });
    this.fetchFoldersAndFeatures();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { keywords: prevKeywords } = prevState;
    const { keywords, audienceFeaturesByFolder } = this.state;
    const { datamartId, demographicIds, notifyError } = this.props;
    if (keywords !== prevKeywords) {
      this.setState({
        isLoading: true,
      });
      const options: AudienceFeatureOptions = {
        keywords: keywords ? [keywords] : undefined,
        exclude: demographicIds,
      };

      if (!keywords) {
        options.max_results = 500;
      }

      this._audienceFeatureService
        .getAudienceFeatures(datamartId, options)
        .then((res) => {
          if (audienceFeaturesByFolder)
            this.setState({
              selectedFolder: {
                ...audienceFeaturesByFolder,
                audience_features: !!keywords
                  ? res.data
                  : res.data.filter((f) => !f.folder_id),
              },
              isLoading: false,
            });
        })
        .catch((err) => {
          notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    }
  }

  setBaseFolder = (baseFolder: AudienceFeaturesByFolder) => {
    this.setState({
      audienceFeaturesByFolder: baseFolder,
      selectedFolder: baseFolder,
      isLoading: false,
    });
  };

  onFailure = (err: any) => {
    this.props.notifyError(err);
    this.setState({
      isLoading: false,
    });
  };

  fetchFoldersAndFeatures = (filter?: AudienceFeatureSearchSettings) => {
    const { datamartId, demographicIds, intl } = this.props;
    this._audienceFeatureService.fetchFoldersAndFeatures(
      datamartId,
      intl.formatMessage(messages.audienceFeatures),
      this.setBaseFolder,
      this.onFailure,
      filter,
      demographicIds,
    );
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
          const parent = this._audienceFeatureService.getFolderContent(
            folder.parent_id,
            audienceFeaturesByFolder,
          );
          if (!folder.id) {
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

  onSelectFolder = (id?: string) => () => {
    const { audienceFeaturesByFolder } = this.state;
    this.setState({
      selectedFolder: this._audienceFeatureService.getFolderContent(
        id,
        audienceFeaturesByFolder,
      ),
    });
  };

  onSelectFeature = (id: string) => () => {
    const { save } = this.props;
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
    this.setState(
      {
        selectedAudienceFeature,
      },
      () => {
        if (selectedAudienceFeature) save([selectedAudienceFeature]);
      },
    );
  };

  renderSelector = () => {
    const {
      audienceFeaturesByFolder,
      selectedAudienceFeature,
      selectedFolder,
      keywords,
      isLoading,
    } = this.state;
    const disabled =
      !!audienceFeaturesByFolder &&
      audienceFeaturesByFolder.children.length === 0 &&
      audienceFeaturesByFolder.audience_features.length === 0;

    if (isLoading) {
      return <Loading className="m-t-40" isFullScreen={true} />;
    }
    if (disabled) {
      return <EmptyTableView iconType="warning" message={''} />;
    }
    return (
      <React.Fragment>
        <Search className="mcs-search-input" {...this.getSearchOptions()} />
        {!keywords && this.getBreadCrumb()}
        <Row gutter={16}>
          {!!selectedFolder &&
            !keywords &&
            selectedFolder.children.map((folder) => {
              return (
                <Col key={folder.id ? folder.id : 'root_key'} span={4}>
                  <div
                    className="mcs-audienceBuilder_folder"
                    onClick={this.onSelectFolder(folder.id)}
                  >
                    <FolderOutlined className="mcs-audienceBuilder_folderIcon" />
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
          {isLoading ? (
            <Loading className="m-t-20" isFullScreen={true} />
          ) : (
            !!selectedFolder &&
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
            })
          )}
        </Row>
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
        <Actionbar
          pathItems={[formatMessage(messages.addAudienceFeature)]}
          edition={true}
        >
          <McsIcon
            type="close"
            className="close-icon mcs-table-cursor"
            onClick={close}
          />
        </Actionbar>
        <Layout
          className={`mcs-edit-container mcs-audienceBuilder_featureSelector`}
        >
          {this.renderSelector()}
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, NewAudienceFeatureSelectorProps>(
  injectIntl,
  injectNotifications,
)(NewAudienceFeatureSelector);

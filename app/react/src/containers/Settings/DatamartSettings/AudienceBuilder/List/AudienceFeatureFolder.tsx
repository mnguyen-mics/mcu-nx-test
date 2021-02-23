import * as React from 'react';
import { Row, Col, Dropdown, Menu, Input, Button, Icon } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

import {
  AudienceFeaturesByFolder,
  AudienceFeatureFolderResource,
} from '../../../../../models/audienceFeature/AudienceFeatureResource';
import { messages } from '../messages';
import { DataResponse } from '../../../../../services/ApiService';

export interface AudienceFeatureFolderProps {
  folder: AudienceFeaturesByFolder;
  onSelectFolder: (id: string | null) => () => void;
  renameFolder: (
    id: string,
    name: string,
  ) => Promise<DataResponse<AudienceFeatureFolderResource> | void>;
  deleteFolder: (
    id: string,
  ) => Promise<DataResponse<AudienceFeatureFolderResource> | void>;
}

type Props = AudienceFeatureFolderProps & InjectedIntlProps;

interface State {
  editionMode: boolean;
  inputValue: string;
}

class AudienceFeatureFolder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editionMode: false,
      inputValue: props.folder.name,
    };
  }

  toggleCard = () => {
    this.setState({
      editionMode: !this.state.editionMode,
    });
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  getMenu = (id: string | null) => {
    const { intl, deleteFolder } = this.props;
    if (id !== null) {
      const displayForm = () => {
        this.setState({
          editionMode: true,
        });
      };
      const onDelete = () => {
        deleteFolder(id);
      };
      return (
        <Menu>
          <Menu.Item key="0">
            <div onClick={displayForm}>
              {intl.formatMessage(messages.audienceFeatureRename)}
            </div>
          </Menu.Item>
          <Menu.Item key="1">
            <div onClick={onDelete}>{intl.formatMessage(messages.audienceFeatureDelete)}</div>
          </Menu.Item>
        </Menu>
      );
    }
    return;
  };

  renameFolder = (id: string | null) => () => {
    const { renameFolder } = this.props;
    const { inputValue } = this.state;
    if (id !== null) {
      return renameFolder(id, inputValue);
    }
    return;
  };

  cancelEdition = () => {
    this.setState({
      editionMode: false,
    });
  };

  render() {
    const { folder, onSelectFolder, intl } = this.props;
    const { editionMode, inputValue } = this.state;
    return (
      <div onClick={onSelectFolder(folder.id)}>
        <Row
          key={folder.id ? folder.id : 'root_key'}
          className="mcs-audienceFeatureSettings_folder"
        >
          <Col span={2}>
            <Icon type="folder" className="menu-icon" />
          </Col>
          <Col span={21}>
            {editionMode ? (
              <div className="mcs-audienceFeatureSettings-folderForm">
                <Input
                  value={inputValue}
                  onChange={this.handleInputChange}
                  className="mcs-audienceFeatureSettings-folderInput"
                  placeholder={intl.formatMessage(
                    messages.audienceFeaturePlaceholderFolderInput,
                  )}
                />

                <Button type="primary" onClick={this.renameFolder(folder.id)}>
                  <FormattedMessage {...messages.audienceFeatureRename} />
                </Button>

                <Button onClick={this.cancelEdition}>
                  <FormattedMessage {...messages.audienceFeatureCancelButton} />
                </Button>
              </div>
            ) : (
              folder.name
            )}
          </Col>
          <Col span={1}>
            <Dropdown overlay={this.getMenu(folder.id)} trigger={['click']}>
              <McsIcon type="chevron" />
            </Dropdown>
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<Props, AudienceFeatureFolderProps>(injectIntl)(
  AudienceFeatureFolder,
);

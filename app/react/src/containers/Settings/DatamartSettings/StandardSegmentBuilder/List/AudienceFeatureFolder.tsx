import * as React from 'react';
import { Row, Col, Dropdown, Menu, Input, Button } from 'antd';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

import { AudienceFeatureFolderResource } from '../../../../../models/audienceFeature/AudienceFeatureResource';
import { messages } from '../messages';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { FolderOutlined } from '@ant-design/icons';

export interface AudienceFeatureFolderProps {
  folder: AudienceFeatureFolderResource;
  onSelectFolder: (folderId?: string) => () => void;
  renameFolder: (
    id: string,
    name: string,
  ) => Promise<DataResponse<AudienceFeatureFolderResource> | void>;
  deleteFolder: (id: string) => void;
}

type Props = AudienceFeatureFolderProps & WrappedComponentProps;

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

  getMenu = (id?: string) => {
    const { intl, deleteFolder } = this.props;
    if (id) {
      const displayForm = () => {
        this.setState({
          editionMode: true,
        });
      };
      const onDelete = () => {
        deleteFolder(id);
      };
      return (
        <Menu className='mcs-menu-antd-customized'>
          <Menu.Item key='0'>
            <div className='mcs-audienceFeatureFolder_dropDownMenu--rename' onClick={displayForm}>
              {intl.formatMessage(messages.audienceFeatureRename)}
            </div>
          </Menu.Item>
          <Menu.Item key='1'>
            <div className='mcs-audienceFeatureFolder_dropDownMenu--delete' onClick={onDelete}>
              {intl.formatMessage(messages.audienceFeatureDelete)}
            </div>
          </Menu.Item>
        </Menu>
      );
    }
    return <div />;
  };

  renameFolder = (id?: string) => () => {
    const { renameFolder } = this.props;
    const { inputValue } = this.state;
    if (id) {
      return renameFolder(id, inputValue).then(_ => this.cancelEdition());
    } else {
      return;
    }
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
      <Row key={folder.id ? folder.id : 'root_key'} className='mcs-audienceFeatureSettings_folder'>
        <Col span={2}>
          <div onClick={onSelectFolder(folder.id)}>
            <FolderOutlined className='menu-icon' />
          </div>
        </Col>
        <Col span={21}>
          {editionMode ? (
            <div className='mcs-audienceFeatureSettings-folderForm'>
              <Input
                value={inputValue}
                onChange={this.handleInputChange}
                className='mcs-audienceFeatureSettings-folderInput'
                placeholder={intl.formatMessage(messages.audienceFeaturePlaceholderFolderInput)}
              />

              <Button
                className='mcs-audienceFeatureSettings_renameButton--renameAudienceFeatureFolder'
                type='primary'
                onClick={this.renameFolder(folder.id)}
              >
                <FormattedMessage {...messages.audienceFeatureRename} />
              </Button>

              <Button
                className='mcs-audienceFeatureSettings_cancelButton--cancelAudienceFeatureFolderEdition'
                onClick={this.cancelEdition}
              >
                <FormattedMessage {...messages.audienceFeatureCancelButton} />
              </Button>
            </div>
          ) : (
            <div onClick={onSelectFolder(folder.id)}>{folder.name}</div>
          )}
        </Col>
        <Col span={1}>
          <Dropdown
            className='mcs-audienceFeatureFolder_dropDownMenu'
            overlay={this.getMenu(folder.id)}
            trigger={['click']}
          >
            <McsIcon type='chevron' />
          </Dropdown>
        </Col>
      </Row>
    );
  }
}

export default compose<Props, AudienceFeatureFolderProps>(injectIntl)(AudienceFeatureFolder);

import * as React from 'react';
import { Row, Col, Dropdown, Menu, Input, Button } from 'antd';
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
  onSelectFolder: (id: string) => () => void;
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

  getMenu = (id: string) => {
    const { intl, deleteFolder } = this.props;
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
          <div onClick={displayForm}>{intl.formatMessage(messages.rename)}</div>
        </Menu.Item>
        <Menu.Item key="1">
          <div onClick={onDelete}>{intl.formatMessage(messages.delete)}</div>
        </Menu.Item>
      </Menu>
    );
  };

  renameFolder = (id: string) => () => {
    const { renameFolder } = this.props;
    const { inputValue } = this.state;
    return renameFolder(id, inputValue);
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
      <Row key={folder.id} className="mcs-audienceFeatureSettings_folder">
        <Col span={2}>
          <McsIcon type="email" />
        </Col>
        <Col span={21}>
          {editionMode ? (
            <div className="mcs-audienceFeatureSettings-folderForm">
              <Input
                value={inputValue}
                onChange={this.handleInputChange}
                className="mcs-audienceFeatureSettings-folderInput"
                placeholder={intl.formatMessage(
                  messages.placeholderFolderInput,
                )}
              />

              <Button type="primary" onClick={this.renameFolder(folder.id)}>
                <FormattedMessage {...messages.rename} />
              </Button>

              <Button onClick={this.cancelEdition}>
                <FormattedMessage {...messages.cancelButton} />
              </Button>
            </div>
          ) : (
            <div onClick={onSelectFolder(folder.id)}> {folder.name}</div>
          )}
        </Col>
        <Col span={1}>
          <Dropdown overlay={this.getMenu(folder.id)} trigger={['click']}>
            <McsIcon type="chevron" />
          </Dropdown>
        </Col>
      </Row>
    );
  }
}

export default compose<Props, AudienceFeatureFolderProps>(injectIntl)(
  AudienceFeatureFolder,
);

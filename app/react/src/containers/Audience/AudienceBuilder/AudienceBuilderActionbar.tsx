import * as React from 'react';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import ActionBar from '../../../components/ActionBar';
import { messages } from './constants';
import { Dropdown, Button, Menu } from 'antd';
import { SaveAsUserQuerySegmentModal } from '../../QueryTool/SaveAs';
import { ClickParam } from 'antd/lib/menu';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';

interface AudienceBuilderActionbarProps {
  save: () => void;
}

interface State {
  segmentModalVisible: boolean;
  segmentModalLoading: boolean;
}

type Props = InjectedIntlProps & AudienceBuilderActionbarProps;

class AudienceBuilderActionbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      segmentModalLoading: false,
      segmentModalVisible: false,
    };
  }
  closeSegmentModal = () =>
    this.setState({
      segmentModalVisible: false,
      segmentModalLoading: false,
    });

  handleSaveAsUserQuery = (formData: NewUserQuerySimpleFormData) => {
    this.props.save();
  };

  render() {
    const { intl } = this.props;
    const handleMenuClick = (e: ClickParam) => {
      if (e.key === 'USER_QUERY') {
        this.setState({ segmentModalVisible: true });
      }
    };
    const saveAsMenu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="USER_QUERY">
          <FormattedMessage
            id="queryTool.query-builder-page-actionbar-saveas-segment"
            defaultMessage="User Query Segment"
          />
        </Menu.Item>
      </Menu>
    );
    return (
      <ActionBar
        paths={[
          {
            name: intl.formatMessage(messages.title),
          },
        ]}
      >
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <FormattedMessage
              id="segmentBuilderV2.actionBar.saveAsButton"
              defaultMessage="Save As"
            />
          </Button>
        </Dropdown>

        <SaveAsUserQuerySegmentModal
          onOk={this.handleSaveAsUserQuery}
          onCancel={this.closeSegmentModal}
          visible={this.state.segmentModalVisible}
          confirmLoading={this.state.segmentModalLoading}
        />
      </ActionBar>
    );
  }
}

export default compose<Props, AudienceBuilderActionbarProps>(injectIntl)(
  AudienceBuilderActionbar,
);

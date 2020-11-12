import * as React from 'react';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { messages } from './constants';
import { Button, Menu, Dropdown } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { SaveAsUserQuerySegmentModal } from '../../QueryTool/SaveAs';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';

interface AudienceBuilderActionbarProps {
  save: (formData: NewUserQuerySimpleFormData) => Promise<any>;
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
    this.setState({ segmentModalLoading: true });
    this.props.save(formData).catch(_ => {
      this.setState({
        segmentModalVisible: false,
        segmentModalLoading: false,
      });
    });
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
            id="audience.audienceBuilder.actionbar.saveAsButton.userQuerySegment"
            defaultMessage="User Query Segment"
          />
        </Menu.Item>
      </Menu>
    );
    return (
      <Actionbar
        paths={[
          {
            name: intl.formatMessage(messages.title),
          },
        ]}
      >
        {
          <Dropdown overlay={saveAsMenu} trigger={['click']}>
            <Button className="mcs-primary" type="primary">
              <FormattedMessage
                id="audience.audienceBuilder.actionBar.saveAsButton"
                defaultMessage="Save As"
              />
            </Button>
          </Dropdown>
        }

        <SaveAsUserQuerySegmentModal
          onOk={this.handleSaveAsUserQuery}
          onCancel={this.closeSegmentModal}
          visible={this.state.segmentModalVisible}
          confirmLoading={this.state.segmentModalLoading}
        />
      </Actionbar>
    );
  }
}

export default compose<Props, AudienceBuilderActionbarProps>(injectIntl)(
  AudienceBuilderActionbar,
);

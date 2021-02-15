import * as React from 'react';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { messages } from './constants';
import { Button, Menu, Dropdown } from 'antd';
import { SaveAsUserQuerySegmentModal } from '../../QueryTool/SaveAs';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { AudienceBuilderResource } from '../../../models/audienceBuilder/AudienceBuilderResource';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { withRouter, RouteComponentProps } from 'react-router';

interface AudienceBuilderActionbarProps {
  save: (formData: NewUserQuerySimpleFormData) => Promise<any>;
  audienceBuilder?: AudienceBuilderResource;
}

interface State {
  segmentModalVisible: boolean;
  segmentModalLoading: boolean;
}

type Props = InjectedIntlProps &
  AudienceBuilderActionbarProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }>;

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
    const {
      intl,
      audienceBuilder,
      match: {
        params: { organisationId, segmentId },
      },
    } = this.props;
    const handleMenuClick = (e: any) => {
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
    let paths: Path[] = [
      {
        name: intl.formatMessage(messages.title),
        path: `/v2/o/${organisationId}/audience/segment-builder-v2?audienceBuilderId=`,

      },
    ];
    if (audienceBuilder) {
      paths = paths.concat({
        name: audienceBuilder.name,
      });
      if (!segmentId) {
        paths = paths.concat({
          name: intl.formatMessage(messages.newAudienceSegment),
        });
      }
    }

    return (
      <Actionbar paths={paths}>
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

export default compose<Props, AudienceBuilderActionbarProps>(
  injectIntl,
  withRouter,
)(AudienceBuilderActionbar);

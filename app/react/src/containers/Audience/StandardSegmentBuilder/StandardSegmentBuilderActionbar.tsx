import * as React from 'react';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { messages } from './constants';
import menuMessages from '../../Menu/messages';
import { Button, Menu, Dropdown } from 'antd';
import { SaveAsUserQuerySegmentModal } from '../../QueryTool/SaveAs';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { StandardSegmentBuilderResource } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

interface StandardSegmentBuilderActionbarProps {
  save: (formData: NewUserQuerySimpleFormData) => Promise<any>;
  standardSegmentBuilder?: StandardSegmentBuilderResource;
}

interface State {
  segmentModalVisible: boolean;
  segmentModalLoading: boolean;
}

type Props = InjectedIntlProps &
  StandardSegmentBuilderActionbarProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }>;

class StandardSegmentBuilderActionbar extends React.Component<Props, State> {
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
      standardSegmentBuilder,
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
      <Menu onClick={handleMenuClick} className='mcs-menu-antd-customized'>
        <Menu.Item className='mcs-standardSegmentBuilderActionBar_menuItem' key='USER_QUERY'>
          <FormattedMessage
            id='audience.standardSegmentBuilder.actionbar.saveAsButton.userQuerySegment'
            defaultMessage='User Query Segment'
          />
        </Menu.Item>
      </Menu>
    );
    let paths: React.ReactNode[] = [
      <Link key='1' to={`/v2/o/${organisationId}/audience/segment-builder-selector`}>
        {intl.formatMessage(menuMessages.builders)}
      </Link>,
      intl.formatMessage(messages.title),
    ];
    if (standardSegmentBuilder) {
      paths = paths.concat(standardSegmentBuilder.name);
      if (!segmentId) {
        paths = paths.concat(intl.formatMessage(messages.newAudienceSegment));
      }
    }

    return (
      <Actionbar pathItems={paths}>
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button
            className='mcs-primary mcs-standardSegmentBuilderActionBar_saveUserQuerySegmentButton'
            type='primary'
          >
            <FormattedMessage
              id='audience.standardSegmentBuilder.actionBar.saveAsButton'
              defaultMessage='Save As'
            />
          </Button>
        </Dropdown>

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

export default compose<Props, StandardSegmentBuilderActionbarProps>(
  injectIntl,
  withRouter,
)(StandardSegmentBuilderActionbar);

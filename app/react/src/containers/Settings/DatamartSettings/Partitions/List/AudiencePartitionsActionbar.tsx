import * as React from 'react';
import { connect } from 'react-redux';
import { Menu, Button } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar, McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';
import { getDefaultDatamart } from '../../../../../redux/Session/selectors';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const { Dropdown } = PopupContainer;

const messages = defineMessages({
  AUDIENCE_PARTITIONS: {
    id: 'audience.partitions.list.actionbar.beardCrumbPath.partitions',
    defaultMessage: 'Partitions',
  },
});

interface MapStateToProps {
  defaultDatamart: (organisationId: string) => DatamartResource;
}

type Props = MapStateToProps & InjectedIntlProps & RouteComponentProps<{ organisationId: string }>;

class AudiencePartitionsActionbar extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      defaultDatamart,
      intl,
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;
    const addMenu = (
      <Menu className='mcs-menu-antd-customized'>
        <Menu.Item
          className='mcs-audiencePartitionsActionBar_newRandomSplitButton'
          key='RANDOM_SPLIT'
        >
          <Link
            to={`/v2/o/${organisationId}/settings/datamart/audience/partitions/create?datamarts=${datamartId}&type=RANDOM_SPLIT`}
          >
            <FormattedMessage
              id='audience.partitions.list.actionbar.menu.randomSplit'
              defaultMessage='Random Split'
            />
          </Link>
        </Menu.Item>
        {/*
        TODO: Add the proper support in the backend
        <Menu.Item key="CLUSTERING">
          <Link
            to={`/v2/o/${organisationId}/settings/datamart/audience/partitions/create?datamarts=${datamartId}&type=CLUSTERING`}
          >
            <FormattedMessage
              id="audience.partitions.list.actionbar.menu.clustering"
              defaultMessage="Clustering"
            />
          </Link>
        </Menu.Item>*/}
      </Menu>
    );

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/audience/partitions`}>
        {intl.formatMessage(messages.AUDIENCE_PARTITIONS)}
      </Link>,
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button
            className='mcs-primary mcs-audiencePartitionsActionBar_newAudiencePartitionsButton'
            type='primary'
          >
            <McsIcon type='plus' />{' '}
            <FormattedMessage
              id='audience.partitions.list.actionbar.newPartition'
              defaultMessage='New Partition'
            />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  defaultDatamart: getDefaultDatamart(state),
});

export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(AudiencePartitionsActionbar);

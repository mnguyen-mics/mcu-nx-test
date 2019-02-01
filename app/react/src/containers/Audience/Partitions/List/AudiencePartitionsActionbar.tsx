import * as React from 'react';
import { connect } from 'react-redux';
import { Menu, Button } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Dropdown } from '../../../../components/PopupContainers/index';

import Actionbar from '../../../../components/ActionBar';
import McsIcon from '../../../../components/McsIcon';
import { withTranslations } from '../../../Helpers';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';

interface MapStateToProps {
  defaultDatamart: (organisationId: string) => DatamartResource;
}

type Props = MapStateToProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string }>;

class AudiencePartitionsActionbar extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      defaultDatamart,
      translations,
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;
    const addMenu = (
      <Menu>
        <Menu.Item key="RANDOM_SPLIT">
          <Link
            to={`/v2/o/${organisationId}/audience/partitions/create?datamarts=${datamartId}&type=RANDOM_SPLIT`}
          >
            <FormattedMessage id="RANDOM_SPLIT" defaultMessage="Random Split" />
          </Link>
        </Menu.Item>
        <Menu.Item key="CLUSTERING">
          <Link
            to={`/v2/o/${organisationId}/audience/partitions/create?datamarts=${datamartId}&type=CLUSTERING`}
          >
            <FormattedMessage id="CLUSTERING" defaultMessage="Clustering" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    const breadcrumbPaths = [
      {
        name: translations.AUDIENCE_PARTITIONS,
        url: `/v2/o/${organisationId}/audience/partitions`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" />{' '}
            <FormattedMessage
              id="NEW_PARTITION"
              defaultMessage="New Partition"
            />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: any) => ({
  defaultDatamart: getDefaultDatamart(state),
});

export default compose(
  withTranslations,
  withRouter,
  connect(
    mapStateToProps,
    undefined,
  ),
)(AudiencePartitionsActionbar);

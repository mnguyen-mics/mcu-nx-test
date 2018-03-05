import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Dropdown, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon.tsx';
import { withTranslations } from '../../../Helpers';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

function PartitionsActionbar({
  match: {
    params: {
      organisationId,
    },
  },
  translations,
  defaultDatamart,
}) {

  const datamartId = defaultDatamart(organisationId).id;
  const addMenu = (
    <Menu>
      <Menu.Item key="RANDOM_SPLIT">
        <Link to={`/v2/o/${organisationId}/audience/partition/new?datamarts=${datamartId}&type=RANDOM_SPLIT`}>
          <FormattedMessage id="RANDOM_SPLIT" />
        </Link>
      </Menu.Item>
      <Menu.Item key="CLUSTERING">
        <Link to={`/v2/o/${organisationId}/audience/partition/new?datamarts=${datamartId}&type=CLUSTERING`}>
          <FormattedMessage id="CLUSTERING" />
        </Link>
      </Menu.Item>
    </Menu>
  );

  const breadcrumbPaths = [{
    name: translations.AUDIENCE_PARTITIONS,
    url: `/v2/o/${organisationId}/audience/partitions`,
  }];

  return (
    <Actionbar path={breadcrumbPaths}>
      <Dropdown overlay={addMenu} trigger={['click']}>
        <Button className="mcs-primary" type="primary">
          <McsIcon type="plus" /> <FormattedMessage id="NEW_PARTITION" />
        </Button>
      </Dropdown>
    </Actionbar>
  );
}

PartitionsActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  defaultDatamart: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state),
});

const ConnectedPartitionsActionbar = connect(mapStateToProps)(PartitionsActionbar);

export default compose(
  withTranslations,
  withRouter,
)(ConnectedPartitionsActionbar);

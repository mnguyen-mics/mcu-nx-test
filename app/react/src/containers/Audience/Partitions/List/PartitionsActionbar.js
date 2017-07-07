import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Dropdown, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import { withTranslations } from '../../../Helpers';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

class PartitionsActionbar extends Component {

  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      translations,
      defaultDatamart
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;

    const addMenu = (
      <Menu>
        <Menu.Item key="RANDOM_SPLIT">
          <Link to={`/o${organisationId}d${datamartId}/datamart/partitions/RANDOM_SPLIT`}>
            <FormattedMessage id="RANDOM_SPLIT" />
          </Link>
        </Menu.Item>
        <Menu.Item key="CLUSTERING">
          <Link to={`/o${organisationId}d${datamartId}/datamart/partitions/CLUSTERING`}>
            <FormattedMessage id="CLUSTERING" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    const breadcrumbPaths = [{ name: translations.AUDIENCE_PARTITIONS, url: `/v2/o/${organisationId}/audience/partitions` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_PARTITION" />
          </Button>
        </Dropdown>
      </Actionbar>
    );

  }

}

PartitionsActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDatamart: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state)
});

PartitionsActionbar = connect(
  mapStateToProps
)(PartitionsActionbar);

PartitionsActionbar = compose(
  withTranslations,
  withRouter,
)(PartitionsActionbar);

export default PartitionsActionbar;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../Actionbar';
import { withTranslations } from '../../Helpers';
import McsIcons from '../../../components/McsIcons.tsx';

class DashboardActionBar extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const breadcrumbPaths = [{ name: translations.DASHBOARDS_TEMPLATES, url: `/v2/o/${organisationId}/creatives/email` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/creatives/email-template/default-editor/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_DASHBOARD_TEMPLATE" />
          </Button>
        </Link>
      </Actionbar>
    );
  }
}

DashboardActionBar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

DashboardActionBar = compose(
  withTranslations,
  withRouter,
)(DashboardActionBar);

export default DashboardActionBar;

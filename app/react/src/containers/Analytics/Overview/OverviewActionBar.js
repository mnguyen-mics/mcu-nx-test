import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { Actionbar } from '../../Actionbar';
import { withTranslations } from '../../Helpers';

class OverviewActionBar extends Component {

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
      <Actionbar path={breadcrumbPaths} />
    );
  }
}

OverviewActionBar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

OverviewActionBar = compose(
  withTranslations,
  withRouter,
)(OverviewActionBar);

export default OverviewActionBar;

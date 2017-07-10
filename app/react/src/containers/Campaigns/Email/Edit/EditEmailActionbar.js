import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';

class CampaignDisplayEditActionbar extends Component {
  render() {

    const {
      match: {
        params: {
          organisationId
        }
      },
      translations
    } = this.props;

    const breadcrumbPaths = [
      { name: translations.DISPLAY, url: `/v2/o/${organisationId}/campaigns/display` },
      { name: translations.NEW_CAMPAIGN }
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Button type="primary" htmlType="submit">
          <McsIcons type="plus" /> <FormattedMessage id="SAVE_CAMPAIGN" />
        </Button>
        <McsIcons type="plus" />
      </Actionbar>
    );
  }
}

CampaignDisplayEditActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

CampaignDisplayEditActionbar = compose(
  withTranslations,
  withRouter,
)(CampaignDisplayEditActionbar);

export default CampaignDisplayEditActionbar;

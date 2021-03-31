import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Alert } from 'antd';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import messages from '../../Header/messages';

export const buildAccountsMenu = (organisationId: string) => [
  <Link
    key={0}
    to={{
      pathname: `/v2/o/${organisationId}/settings/account/my_profile`,
    }}
  >
    <FormattedMessage {...messages.account} />
  </Link>,
  <Link to="/logout" key={1}>
    <FormattedMessage {...messages.logout} />
  </Link>,
];

export const buildSettingsButton = (organisationId: string) => (
  <Link
    className="mcs-header_menu-link"
    to={`/v2/o/${organisationId}/settings/organisation/labels`}
  >
    <McsIcon type="options" className="menu-icon-settings" />
  </Link>
);

export const ProductionApiEnvironment = (
  <Alert
    className="mcs-navigator-header-title-alert"
    message="You are using production API environment !"
    type="error"
    showIcon={true}
  />
);

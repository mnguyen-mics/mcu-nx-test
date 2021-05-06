import {
  UserProfileWithAccountId,
  UserProfileResource,
} from '../../../../models/timeline/timeline';
import React from 'react';
import { Tooltip, Tag } from 'antd';
import moment from 'moment';
import CustomObjectRendererWrapper, {
  RenderingTemplates,
} from '../../../../components/CustomObjectRendererWrapper';

export interface SingleProfileInfoProps {
  profileGlobal: UserProfileWithAccountId | UserProfileResource;
}

function isProfileWithAccountId(
  profile: UserProfileWithAccountId | UserProfileResource,
): profile is UserProfileWithAccountId {
  return (profile as UserProfileWithAccountId).userAccountId !== undefined;
}

export default class SingleProfileInfo extends React.Component<SingleProfileInfoProps> {
  static defaultProps = {
    profileWithAccountId: {},
  };

  render() {
    const { profileGlobal } = this.props;

    const userAccountId = isProfileWithAccountId(profileGlobal)
      ? profileGlobal.userAccountId
      : undefined;
    const profile = isProfileWithAccountId(profileGlobal) ? profileGlobal.profile : profileGlobal;

    const functionTimestamp = (timestampValue: number) =>
      moment(timestampValue).format('YYYY-MM-DD, hh:mm:ss');

    const relativeTemplates = {
      $creation_ts: functionTimestamp,
      $last_modified_ts: functionTimestamp,
    };

    const renderingTemplates: RenderingTemplates = {
      absoluteTemplates: {},
      relativeTemplates: relativeTemplates,
    };

    return (
      <div className='single-profile-info'>
        {userAccountId && (
          <div className='sub-title'>
            User Account Id: <br />
            <Tooltip title={userAccountId}>
              <Tag className='card-tag alone'>{userAccountId}</Tag>
            </Tooltip>
          </div>
        )}
        <CustomObjectRendererWrapper
          customObject={profile}
          customRenderingTemplates={renderingTemplates}
        />
      </div>
    );
  }
}

import { Spin } from 'antd';
import * as React from 'react';

export interface OrgLogoProps {
  organisationId: string;
  logoUrl?: string | null;
  isLoading: boolean;
}

const OrgLogo = ({ organisationId, logoUrl, isLoading }: OrgLogoProps) => {
  return (
    <div className='mcs-card-cover'>
      {isLoading ? (
        <Spin />
      ) : (
        <img src={logoUrl || ''} alt={organisationId} className='mcs-cover-image' />
      )}
    </div>
  );
};
export default OrgLogo;

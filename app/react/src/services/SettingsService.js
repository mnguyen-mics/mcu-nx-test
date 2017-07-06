import React from 'react';
import ApiService from './ApiService';

const putProfile = (organisation_id, userProfile) => {
  const id = userProfile.id;
  const endpoint = `users/${id}?organisation_id=${organisation_id}`;

  const params = {
    ...userProfile
  };

  return ApiService.putRequest(endpoint, params);
};

export default {
  putProfile
};

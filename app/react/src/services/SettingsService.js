import ApiService from './ApiService';

const putProfile = (organisationId, userProfile) => {
  const id = userProfile.id;
  const endpoint = `users/${id}?organisation_id=${organisationId}`;

  const params = {
    ...userProfile,
  };

  return ApiService.putRequest(endpoint, params);
};

export default {
  putProfile,
};

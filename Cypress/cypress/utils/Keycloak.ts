class Keycloak {
  async getPasswordRequirements(accessToken: string) {
    const response = await fetch(
      `https://api.mediarithmics.com/v1/communities/technical_name=mics-platform/password_requirements`,
      {
        method: 'GET',
        headers: { Authorization: accessToken, 'Content-type': 'application/json' },
      },
    );
    return response.json();
  }
}

export default Keycloak;

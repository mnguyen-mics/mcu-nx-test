/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Log in navigator. Default values are 'dev@mediarithmics.com' and 'aoc', so remember to change this if you are doing calls on prod° environment..
     * @example
     * cy.login('toto**at**mediarithmics.com', '1234')
     */
    login(email?: string, password?: string): Chainable<any>;

    /**
     * Log in navigator. Default values are 'dev@mediarithmics.com' and 'aoc', so remember to change this if you are doing calls on prod° environment..
     * @param email
     * @param password
     * @example
     * cy.login('toto**at**mediarithmics.com', '1234')
     */
    kcLogin(email?: string, password?: string): Chainable<any>;

    /**
     * Logout from computing-console
     * @param root
     * @param realm
     * @param redirect_uri
     * @example
     * cy.logout()
     */
    logout(root?: string, realm?: string, redirect_uri?: string): Chainable<any>;

    /**
     * Switch current organisation. The full name isn't required, it will click on the first organisation in the list matching the parameter.
     * @example
     * cy.switchOrg('yellow velvet')
     */
    switchOrg(organisationName: string): Chainable<any>;

    goToHome(organisationId: string): Chainable<any>;

    /**
     * Save local storage between two tests in a single test suite.
     * Use this in afterEach method !
     * @example
     * cy.saveLocalStorageCache()
     */
    saveLocalStorageCache(): void;

    /**
     * Restore local storage between two tests in a single test suite.
     * Use this in beforeEach method !
     * @example
     * cy.restoreLocalStorageCache()
     */
    restoreLocalStorageCache(): void;

    /**
     * Fill the form of an Expert Query Segment?
     *
     * /!\ The queryText field will not be emptied -> queryText is appended to the already existing query text !
     */
    fillExpertQuerySegmentForm(segmentName: string, queryText: string): void;

    /**
     * Creates a new organization, its datamart and publishes a runtime schema
     */
    initTestContext(): void;

    /**
     * Creates a activities and user scenario allowing testing automation
     */
    setDataSetForAutomation(accessToken: string, datamartId: string, organisationId: string): void;

    /**
     * Create a segment using the UI
     */
    createSegmentFromUI(type: string, processingName?: string): void;

    /**
     * Create a standard segment builder
     * You can add initial audience features with the standard segment builder by adding an optional argument audienceFeaturesIds
     * @example
     */
    createStandardSegmentBuilder(
      standardSegmentBuilderName: string,
      audienceFeaturesIds?: string[],
    ): void;

    /**
     * Create an audience feature
     * @param audienceFeatureName
     * @param objectTreeExpression
     * @param audienceFeatureDescription
     * @param folderId
     * @param addressableObject
     */
    createAudienceFeature(
      audienceFeatureName: string,
      objectTreeExpression: string,
      audienceFeatureDescription?: string,
      folderId?: string,
      addressableObject?: string,
    ): void;
    /**
     * Create channel
     * @param accessToken
     * @param datamartId
     * @param objectBody
     * @example
     * cy.createChannel(accessToken, '1234','test','test.com',false,'MOBILE_APPLICATION'}})
     */
    createChannel(
      accessToken: string,
      datamartId: string,
      name: string,
      domain: string,
      enableAnalytics: boolean,
      type: string,
    ): Chainable<any>;

    /**
     *
     * @param accessToken
     * @param datamartId
     * @param objectBody
     */
    createActivity(accessToken: string, datamartId: string, objectBody: object): Chainable<any>;

    /**
     * Create a new datamart for an organisation
     * @param accessToken
     * @param organisationId
     * @param datamartName
     * @example
     * cy.createDatamart('accessToken','1234','datamartName')
     */
    createDatamart(
      accessToken: string,
      organisationId: string,
      datamartName: string,
    ): Chainable<any>;

    /**
     * Create a dashboard
     * @param accessToken
     * @param organisationId
     * @param dashboardTitle
     * @param scopes
     * @param segmentIds
     * @param builderIds
     */

    createDashboard(
      accessToken: string,
      organisationId: string,
      dashboardTitle: string,
      scopes: string[],
      segmentIds?: number[],
      builderIds?: number[],
    ): Chainable<any>;

    prepareActivitiesForDashboards(
      accessToken: string,
      datamartId: string,
      channelId: string,
      eventName: string,
      secondEventName: string,
    ): Chainable<any>;

    createQuery(accessToken: string, datamartId: string, queryText: string): Chainable<any>;

    executeQuery(accessToken: string, datamartId: string, queryText: string): Chainable<any>;
  }
}

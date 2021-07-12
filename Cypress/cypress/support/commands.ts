// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
import faker from 'faker';
import 'cypress-file-upload';
import LoginPage from '../integration/components/LoginPage';

before(() => {
  cy.exec(`yes | ssh -A -T ${Cypress.env('virtualPlatformName')}.mics-sandbox.com <<eof
ssh -o StrictHostKeyChecking=no 10.0.1.3 "sudo systemctl restart haproxy.service"
eof`);
  cy.wait(10000);
  cy.initTestContext();
});

// -- This is a parent command --
Cypress.Commands.add(
  'login',
  (email = `${Cypress.env('devMail')}`, password = `${Cypress.env('devPwd')}`) => {
    const loginPage = new LoginPage();
    const baseUrl = Cypress.config().baseUrl;
    // cy.server()
    loginPage.visit();
    cy.url().should('eq', baseUrl + '/#/login');

    loginPage.fillEmail(email);
    loginPage.fillPassword(password);

    loginPage.submit();

    const waitForAccessTokenInLocalStorage = () => {
      cy.wait(50).then(() => {
        if (!localStorage.getItem('access_token')) waitForAccessTokenInLocalStorage();
      });
    };
    waitForAccessTokenInLocalStorage();
  },
);

Cypress.Commands.add('switchOrg', organisationName => {
  cy.get('.mcs-button').first().trigger('mouseover');
  cy.get('.mcs-button').contains('Switch Org.').click();
  cy.get('[placeholder="Search Organisation"]').type(organisationName);
  // cy.get('[placeholder="Search Organisation"]').invoke('val', 'yellow velve').trigger('change')
  // cy.get('[placeholder="Search Organisation"]').type('t')
  cy.get('.mcs-org-card').should('have.length', 1).click();
  cy.get('.mcs-button').first().trigger('mouseout');
});

Cypress.Commands.add('goToHome', organisationId => {
  cy.visit(
    `#/v2/o/${organisationId}/campaigns/display?currentPage=1&from=now-7d&pageSize=10&to=now`,
  );
});

Cypress.Commands.add('createSegmentFromUI', type => {
  // Click on "new Segment"
  cy.get('.mcs-actionbar').find('.mcs-primary').click();

  // Select Segment Types
  cy.contains(type).click();

  // Fill the name of the segement
  cy.get('.mcs-generalFormSection_name').type('Test Audience Segment Form - Test ' + type);

  // Fill the descritpion
  cy.get('.mcs-generalFormSection_description').type(
    'This segment was created to test the creation of segment.',
  );

  // click on advanced
  cy.get('.mcs-form-container').find('.mcs-button').click();

  // Fill the technical name
  cy.get('.mcs-generalFormSection_technicalName').type(faker.lorem.word());

  // Fill the default life time
  cy.get('.mcs-generalFormSection_defaultLifeTime').type('1');

  // Choose day as the lifetime
  cy.get('.mcs-addonSelect').click();

  cy.get('.mcs-generalFormSection_defaultLifeTimeUnit_days').click();

  // In the case that we are in user expert query, we have to write a mock query to validate
  if (type === 'User Expert Query') {
    cy.get('.mcs-otql')
      .children()
      .first()
      .type(`SELECT {id} FROM UserPoint WHERE creation_date <= "now-120d/d"`, {
        force: true,
        parseSpecialCharSequences: false,
      });
  } else if (type === 'User Query') {
    cy.get('.mcs-editAudienceSegmentForm_editQueryButton').click();
    cy.get('.mcs-actionBar_updateQueryButton').click();
  }

  // Save the new segment
  cy.get('.mcs-form_saveButton_audienceSegmentForm').click();

  cy.url({ timeout: 20000 }).should('not.contain', 'create');
});

Cypress.Commands.add('fillExpertQuerySegmentForm', (segmentName: string, queryText: string) => {
  cy.get('.mcs-form_saveButton_audienceSegmentForm', { timeout: 5000 });
  cy.get('.mcs-generalFormSection_name').type('{selectall}{backspace}' + segmentName);
  cy.get('.mcs-generalFormSection_description').type(
    '{selectall}{backspace}' + faker.random.words(6),
  );
  cy.get('.mcs-form-container').find('.mcs-button').click();
  cy.get('.mcs-generalFormSection_technicalName').type(
    '{selectall}{backspace}' + faker.random.words(2),
  );
  cy.get('.mcs-generalFormSection_defaultLifeTime').type('{selectall}{backspace}1');
  cy.get('.mcs-addonSelect').click();
  cy.get('.mcs-generalFormSection_defaultLifeTimeUnit_days').click();
  cy.get('.mcs-otql').children().first().type(queryText, {
    force: true,
    parseSpecialCharSequences: false,
    delay: 0,
  });
});

// Storing local storage cache between tests
// https://blog.liplex.de/keep-local-storage-in-cypress/
const LOCAL_STORAGE_MEMORY: { [key: string]: any } = {};

Cypress.Commands.add('saveLocalStorageCache', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add('restoreLocalStorageCache', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add('initTestContext', () => {
  let accessToken: string;
  let datamartId: number;
  let schemaId: number;
  let organisationId: number;
  const datamartName: string = faker.random.words(3);
  const organisationName: string = faker.random.words(3);
  // api Identification
  cy.request('POST', `${Cypress.env('apiDomain')}/v1/authentication/refresh_tokens`, {
    email: `${Cypress.env('devMail')}`,
    password: `${Cypress.env('devPwd')}`,
  }).then(refreshTokenResponse => {
    cy.request('POST', `${Cypress.env('apiDomain')}/v1/authentication/access_tokens`, {
      refresh_token: `${refreshTokenResponse.body.data.refresh_token}`,
    }).then(accessTokenResponse => {
      accessToken = accessTokenResponse.body.data.access_token;
      // organisation creation
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/organisations`,
        method: 'POST',
        headers: { Authorization: accessToken },
        body: {
          name: `${organisationName}`,
          // Using faker here isn't such a good idea because of the constraints on the technical name
          technical_name: `${
            Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10)
          }`,
          market_id: '1',
        },
      }).then(orgResponse => {
        organisationId = orgResponse.body.data.id;
        // datamart creation
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts`,
          method: 'POST',
          headers: { Authorization: accessToken },
          body: {
            name: `${datamartName}`,
            region: 'EUROPE',
            user_point_system_version: 'v201901',
            organisation_id: `${organisationId}`,
            type: 'DATAMART',
            datafarm: 'DF_EU_DEV',
          },
        }).then(datamartResponse => {
          datamartId = datamartResponse.body.data.id;
          // schema publication
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/graphdb_runtime_schemas`,
            method: 'GET',
            headers: { Authorization: accessToken },
          }).then(schemaResponse => {
            schemaId = schemaResponse.body.data[0].id;
            cy.request({
              url: `${Cypress.env(
                'apiDomain',
              )}/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/text`,
              method: 'GET',
              headers: { Authorization: accessToken },
            }).then(() => {
              cy.request({
                url: `${Cypress.env(
                  'apiDomain',
                )}/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/text`,
                method: 'PUT',
                headers: {
                  Authorization: accessToken,
                  'Content-type': 'text/plain',
                },
                body:
                  '######\n' +
                  'type UserPoint  @TreeIndexRoot(index:"USER_INDEX") {\n' +
                  'profiles:[UserProfile!]!\n' +
                  'segments:[UserSegment!]!\n' +
                  'id:ID!\n' +
                  'agents:[UserAgent!]!\n' +
                  'accounts:[UserAccount!]!\n' +
                  'emails:[UserEmail!]!\n' +
                  'activity_events:[ActivityEvent!]!\n' +
                  'creation_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  'creation_date:Date! @Function(name:"ISODate", params:["creation_ts"])\n' +
                  '}\n' +
                  '######\n' +
                  'type UserScenario  @Mirror(object_type:"UserScenario") {\n' +
                  'id:ID! @TreeIndex(index:"USER_INDEX")\n' +
                  'scenario_id:String! @TreeIndex(index:"USER_INDEX")\n' +
                  'execution_id:String! @TreeIndex(index:"USER_INDEX")\n' +
                  'node_id:String! @TreeIndex(index:"USER_INDEX")\n' +
                  'callback_ts:Timestamp @TreeIndex(index:"USER_INDEX")\n' +
                  'start_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  'node_start_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  'active: Boolean @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type UserAgent  {\n' +
                  'creation_ts:Timestamp!\n' +
                  'id:ID! @TreeIndex(index:"USER_INDEX")\n' +
                  'creation_date:Date! @Function(name:"ISODate", params:["creation_ts"]) @TreeIndex(index:"USER_INDEX")\n' +
                  'user_agent_info:UserAgentInfo @Function(name:"DeviceInfo", params:["id"]) @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type UserAgentInfo  {\n' +
                  'os_version:String\n' +
                  'brand:String @TreeIndex(index:"USER_INDEX")\n' +
                  'browser_family:BrowserFamily @TreeIndex(index:"USER_INDEX")\n' +
                  'browser_version:String @TreeIndex(index:"USER_INDEX")\n' +
                  'carrier:String @TreeIndex(index:"USER_INDEX")\n' +
                  'model:String @TreeIndex(index:"USER_INDEX")\n' +
                  'os_family:OperatingSystemFamily @TreeIndex(index:"USER_INDEX")\n' +
                  'agent_type:UserAgentType @TreeIndex(index:"USER_INDEX")\n' +
                  'form_factor:FormFactor @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type UserAccount  {\n' +
                  'creation_ts:Timestamp!\n' +
                  'id:ID! @TreeIndex(index:"USER_INDEX")\n' +
                  'compartment_id:String! @TreeIndex(index:"USER_INDEX")\n' +
                  'user_account_id:String! @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type UserEmail  {\n' +
                  'creation_ts:Timestamp!\n' +
                  'id:ID! @TreeIndex(index:"USER_INDEX")\n' +
                  'email:String @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type UserSegment  {\n' +
                  'id:ID! @TreeIndex(index:"USER_INDEX")\n' +
                  'creation_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  'expiration_ts:Timestamp @TreeIndex(index:"USER_INDEX")\n' +
                  'last_modified_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type UserProfile  {\n' +
                  'id:ID!\n' +
                  'compartment_id:String! @TreeIndex(index:"USER_INDEX") @ReferenceTable(type:"CORE_OBJECT", model_type:"COMPARTMENTS")\n' +
                  'user_account_id:String @TreeIndex(index:"USER_INDEX")\n' +
                  'creation_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  'last_modified_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n' +
                  '######\n' +
                  'type ActivityEvent  @Mirror(object_type:"UserEvent") {\n' +
                  'url:String @Property(path:"$properties.$url") @TreeIndex(index:"USER_INDEX")\n' +
                  'referrer:String @Property(path:"$properties.$referrer") @TreeIndex(index:"USER_INDEX")\n' +
                  'date:Date! @Function(name:"ISODate", params:["ts"]) @TreeIndex(index:"USER_INDEX")\n' +
                  'nature:String @Property(path:"$event_name") @TreeIndex(index:"USER_INDEX")\n' +
                  'id:ID!\n' +
                  'ts:Timestamp!\n' +
                  'test:String @Property(paths:["$properties.universe", "$properties.site_id"]) @TreeIndex(index:"USER_INDEX")\n' +
                  'site_id:String @Property(path:"$properties.site_id") @TreeIndex(index:"USER_INDEX")\n' +
                  'app_id:String @Property(path:"$properties.app_id") @TreeIndex(index:"USER_INDEX")\n' +
                  '}\n',
              }).then(() => {
                cy.request({
                  url: `${Cypress.env(
                    'apiDomain',
                  )}/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/validation?organisationId=${organisationId}&allow_administrator=true`,
                  method: 'POST',
                  headers: { Authorization: accessToken },
                }).then(() => {
                  if (Cypress.env('apiDomain') === 'https://api.mediarithmics.local') {
                    cy.exec(
                      `curl -k -H "Authorization: ${accessToken}" -H Content-Type: application/json -X POST ${Cypress.env(
                        'apiDomain',
                      )}:8493/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/publication -H "Host: admin-api.mediarithmics.local:8493"`,
                    )
                      .its('stdout')
                      .should('contain', '"status":"ok"')
                      .then(() => {
                        cy.exec(`cat <<EOT > cypress/fixtures/init_infos.json
                                                                  {
                                                                      "accessToken":"${accessToken}",
                                                                      "datamartId":${datamartId},
                                                                      "datamartName":"${datamartName}",
                                                                      "schemaId":${schemaId},
                                                                      "organisationId":${organisationId},
                                                                      "organisationName":"${organisationName}"
                                                                  }`);
                      });
                  } else if (Cypress.env('userName') !== '') {
                    cy.exec(
                      `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
                        'virtualPlatformName',
                      )}.mics-sandbox.com 'curl -k -H "Authorization: ${accessToken}" -H "Content-Type: application/json" -X POST https://10.0.1.3:8493/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/publication -H "Host: admin-api.mediarithmics.local:8493"'`,
                    )
                      .its('stdout')
                      .should('contain', '"status":"ok"')
                      .then(() => {
                        cy.exec(`cat <<EOT > cypress/fixtures/init_infos.json
                                                                  {
                                                                      "accessToken":"${accessToken}",
                                                                      "datamartId":${datamartId},
                                                                      "datamartName":"${datamartName}",
                                                                      "schemaId":${schemaId},
                                                                      "organisationId":${organisationId},
                                                                      "organisationName":"${organisationName}"
                                                                  }`);
                      });
                  } else {
                    cy.exec(
                      `ssh -o StrictHostKeyChecking=no ${Cypress.env(
                        'virtualPlatformName',
                      )}.mics-sandbox.com 'curl -k -H "Authorization: ${accessToken}" -H "Content-Type: application/json" -X POST https://10.0.1.3:8493/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/publication -H "Host: admin-api.mediarithmics.local:8493"'`,
                    )
                      .its('stdout')
                      .should('contain', '"status":"ok"')
                      .then(() => {
                        cy.exec(`cat <<EOT > cypress/fixtures/init_infos.json
                                                                  {
                                                                      "accessToken":"${accessToken}",
                                                                      "datamartId":${datamartId},
                                                                      "datamartName":"${datamartName}",
                                                                      "schemaId":${schemaId},
                                                                      "organisationId":${organisationId},
                                                                      "organisationName":"${organisationName}"
                                                                  }`);
                      });
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});
Cypress.Commands.add(
  'setDataSetForAutomation',
  (accessToken: string, datamartId: number, organisationId: number) => {
    let siteId: number;
    let scenarioId: number;
    let queryId: number;
    let ifNodeId: number;
    let waitNodeId: number;
    let endNodeId: number;
    let entryNodeId: number;
    let compartmentId: number;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const userAccountId = Math.floor(Math.random() * 100000);
    // create a new site
    cy.request({
      url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/sites`,
      method: 'POST',
      headers: { Authorization: accessToken },
      body: {
        type: 'SITE',
        name: `${
          Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
        }`,
        domain: 'test.com',
      },
    }).then(siteResponse => {
      siteId = siteResponse.body.data.id;
      // User Scenario creation
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/scenarios?organisation_id=${organisationId}`,
        method: 'POST',
        headers: { Authorization: accessToken },
        body: {
          datamart_id: `${datamartId}`,
          name: 'React To Event for test Automation e2e',
          status: 'ACTIVE',
        },
      }).then(scenarioCreationResponse => {
        scenarioId = scenarioCreationResponse.body.data.id;
        // Query for user scenario creation
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/queries`,
          method: 'POST',
          headers: { Authorization: accessToken },
          body: {
            uiCreationMode: 'REACT_TO_EVENT_ADVANCED',
            datamart_id: `${datamartId}`,
            events: ['$basket_view'],
            fieldNodeForm: [],
            query_text:
              '{"from":"UserPoint","operations":[{"directives":[],"selections":[{"name":"id"}]}],"where":{"boolean_operator":"AND","field":"activity_events","type":"OBJECT","expressions":[{"type":"FIELD","field":"nature","comparison":{"type":"STRING","operator":"EQ","values":["$basket_view"]}}]}}',
            query_language: 'JSON_OTQL',
          },
        }).then(queryResponse => {
          queryId = queryResponse.body.data.id;
          // Add ENTRY node
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/nodes`,
            method: 'POST',
            headers: { Authorization: accessToken },
            body: {
              scenario_id: `${scenarioId}`,
              type: 'QUERY_INPUT',
              query_id: `${queryId}`,
              evaluation_mode: 'LIVE',
              ui_creation_mode: 'REACT_TO_EVENT_ADVANCED',
            },
          }).then(entryNodeResponse => {
            entryNodeId = entryNodeResponse.body.data.id;
            // Add IF node
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/nodes`,
              method: 'POST',
              headers: { Authorization: accessToken },
              body: {
                scenario_id: `${scenarioId}`,
                query_id: `${queryId}`,
                type: 'IF_NODE',
              },
            }).then(entryNodeResponse => {
              ifNodeId = entryNodeResponse.body.data.id;
              cy.request({
                url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/nodes`,
                method: 'POST',
                headers: { Authorization: accessToken },
                body: {
                  scenario_id: `${scenarioId}`,
                  delay_period: 'PT1H',
                  time_window_start: 'T9',
                  time_window_end: 'T18',
                  day_window: ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                  type: 'WAIT_NODE',
                },
              }).then(waitNodeResponse => {
                waitNodeId = waitNodeResponse.body.data.id;
                // Add END node
                cy.request({
                  url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/nodes`,
                  method: 'POST',
                  headers: { Authorization: accessToken },
                  body: {
                    scenario_id: `${scenarioId}`,
                    type: 'END_NODE',
                  },
                }).then(endNodeResponse => {
                  endNodeId = endNodeResponse.body.data.id;
                  // Add EDGE between the ENTRY and IF nodes
                  cy.request({
                    url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/edges`,
                    method: 'POST',
                    headers: { Authorization: accessToken },
                    body: {
                      source_id: `${entryNodeId}`,
                      target_id: `${ifNodeId}`,
                      handler: 'OUT',
                      scenario_id: `${scenarioId}`,
                    },
                  });
                  // Add EDGE between the WAIT and END nodes
                  cy.request({
                    url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/edges`,
                    method: 'POST',
                    headers: { Authorization: accessToken },
                    body: {
                      source_id: `${waitNodeId}`,
                      target_id: `${endNodeId}`,
                      handler: 'OUT',
                      scenario_id: `${scenarioId}`,
                    },
                  });
                  // Add EDGE between the WAIT and END nodes
                  cy.request({
                    url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/edges`,
                    method: 'POST',
                    headers: { Authorization: accessToken },
                    body: {
                      source_id: `${waitNodeId}`,
                      target_id: `${endNodeId}`,
                      handler: 'OUT',
                      scenario_id: `${scenarioId}`,
                    },
                  });
                  // Add EDGE between IF and END nodes
                  cy.request({
                    url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/edges`,
                    method: 'POST',
                    headers: { Authorization: accessToken },
                    body: {
                      source_id: `${ifNodeId}`,
                      target_id: `${endNodeId}`,
                      handler: 'OUT',
                      scenario_id: `${scenarioId}`,
                    },
                  });
                  // Add EDGE between IF and WAIT nodes
                  cy.request({
                    url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/edges`,
                    method: 'POST',
                    headers: { Authorization: accessToken },
                    body: {
                      source_id: `${ifNodeId}`,
                      target_id: `${waitNodeId}`,
                      handler: 'OUT',
                      scenario_id: `${scenarioId}`,
                    },
                  });
                  // Get compartmentId
                  cy.request({
                    url: `${Cypress.env(
                      'apiDomain',
                    )}/v1/datamarts/${datamartId}/compartments?default=true`,
                    method: 'GET',
                    headers: { Authorization: accessToken },
                  }).then(compartmentsResponse => {
                    compartmentId = compartmentsResponse.body.data[0].compartment_id;
                    // Post a User Point Id
                    cy.request({
                      url: `${Cypress.env(
                        'apiDomain',
                      )}/v1/datamarts/${datamartId}/user_identifiers_association_declarations`,
                      method: 'POST',
                      headers: { Authorization: accessToken },
                      body: {
                        identifiers: [
                          {
                            type: 'USER_ACCOUNT',
                            user_account_id: `${userAccountId}`,
                            compartment_id: `${compartmentId}`,
                          },
                        ],
                      },
                    });
                    // Get User Point Id
                    cy.request({
                      url: `${Cypress.env(
                        'apiDomain',
                      )}/v1/datamarts/${datamartId}/user_identifiers/compartment_id=${compartmentId}/user_account_id=${userAccountId}`,
                      method: 'GET',
                      headers: { Authorization: accessToken },
                    });
                    // Add an activity for the User Point
                    cy.request({
                      url: `${Cypress.env(
                        'apiDomain',
                      )}/v1/datamarts/${datamartId}/user_activities?processing_pipeline=false`,
                      method: 'POST',
                      headers: { Authorization: accessToken },
                      body: {
                        $ts: `${timestamp}`,
                        $type: 'SITE_VISIT',
                        $session_status: 'NO_SESSION',
                        $user_account_id: `${userAccountId}`,
                        $user_agent_id: 'vec:123',
                        $site_id: `${siteId}`,
                        $events: [
                          {
                            $ts: `${timestamp}`,
                            $event_name: '$basket_view',
                            $properties: {
                              site_id: `${siteId}`,
                            },
                          },
                        ],
                      },
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },
);

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... }}

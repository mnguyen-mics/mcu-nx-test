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
import faker from 'faker'
import 'cypress-file-upload'
import LoginPage from '../integration/components/LoginPage'

before(()=>{
  cy.initTestContext()
})

// -- This is a parent command --
Cypress.Commands.add(
  'login',
  (email = `${Cypress.env('devMail')}`, password = `${Cypress.env('devPwd')}`) => {
    const loginPage = new LoginPage()
    const baseUrl = Cypress.config().baseUrl
    // cy.server()
    loginPage.visit()
    cy.url().should('eq', baseUrl + '/#/login')

    loginPage.fillEmail(email)
    loginPage.fillPassword(password)

    loginPage.submit()

    const waitForAccessTokenInLocalStorage = () => {
      cy.wait(50).then(() => {
        if(!localStorage.getItem('access_token'))
          waitForAccessTokenInLocalStorage()
      })
    }
    waitForAccessTokenInLocalStorage()
  },
)

Cypress.Commands.add('switchOrg', organisationName => {
  cy.get('.mcs-button')
    .first()
    .trigger('mouseover')
  cy.get('.mcs-button')
    .contains('Switch Org.')
    .click()
  cy.get('[placeholder="Search Organisation"]').type(organisationName)
  // cy.get('[placeholder="Search Organisation"]').invoke('val', 'yellow velve').trigger('change')
  // cy.get('[placeholder="Search Organisation"]').type('t')
  cy.get('.mcs-org-card')
    .should('have.length', 1)
    .click()
  cy.get('.mcs-button')
    .first()
    .trigger('mouseout')
})

Cypress.Commands.add('goToHome', organisationId => {
  cy.visit(`#/v2/o/${organisationId}/campaigns/display?currentPage=1&from=now-7d&pageSize=10&to=now`)
})

Cypress.Commands.add('createSegmentFromUI', type => {
    // Click on "new Segment"
  cy.contains('New Segment').click()

  // Select Segment Types
  cy.contains(type).click()

  // Fill the name of the segement
  cy.get('[id="audienceSegment.name"]').type(
    'Test Audience Segment Form - Test ' + type
  )

  // Fill the descritpion
  cy.get('[id="audienceSegment.short_description"]').type(
    'This segment was created to test the creation of segment.'
  )

  // click on advanced
  cy.get('[class="mcs-button optional-section-title"]').click()

  // Fill the technical name
  cy.get('[id="audienceSegment.technical_name"]').type(faker.lorem.word())

  // Fill the default life time
  cy.get('[id="defaultLifetime"]').type('1')

  // Choose day as the lifetime
  cy.get('[class ="ant-select ant-select-enabled"]').click()

  cy.contains('Days').click()

  // In the case that we are in user expert query, we have to write a mock query to validate
  if (type === 'User Expert Query') {
    cy.get('[id="brace-editor"]')
      .find('[class="ace_text-input"]')
      .type(`SELECT {id} FROM UserPoint WHERE creation_date <= "now-120d/d"`, {
        force: true,
        parseSpecialCharSequences: false
      })
  } else if (type === 'User Query') {
    cy.contains('Edit Query').click()
    cy.contains('Update').click()
  }

  // Save the new segment
  cy.contains('Save').click()

  cy.url({ timeout: 10000 }).should('not.contain', 'create')
})

Cypress.Commands.add('fillExpertQuerySegmentForm', (segmentName: string, queryText: string) => {
    cy.contains('Save', { timeout: 5000 })
    cy.get('input[name="audienceSegment.name"]')
      .clear()
      .type(segmentName)
    cy.get('textarea[name="audienceSegment.short_description"]')
      .clear()
      .type(faker.random.words(6))
    cy.contains('Advanced').click()
    cy.get('input[name="audienceSegment.technical_name"]')
      .clear()
      .type(faker.random.words(2))
    cy.get('input[name="defaultLifetime"]')
      .clear()
      .type('1')
    cy.get('[id="defaultLifetimeUnit"]').click()
    cy.contains('Days').click()
    cy.get('[id="properties"').within(() => {
      cy.get('[id="brace-editor"]')
        .get('textarea[class="ace_text-input"]')
        .type(queryText, {
          force: true,
          parseSpecialCharSequences: false,
          delay: 0,
        })
    })
})

// Storing local storage cache between tests
// https://blog.liplex.de/keep-local-storage-in-cypress/
const LOCAL_STORAGE_MEMORY: { [key: string]: any } = {}

Cypress.Commands.add('saveLocalStorageCache', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key]
  })
})

Cypress.Commands.add('restoreLocalStorageCache', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

Cypress.Commands.add('initTestContext', () => {
  let accessToken:string
  let datamartId:number
  let schemaId:number
  let organisationId:number
  const datamartName:string=faker.random.words(3)
  const organisationName:string=faker.random.words(3)
  // api Identification
  cy
      .request('POST', `${Cypress.env('apiDomain')}/v1/authentication/refresh_tokens`, { email: `${Cypress.env('devMail')}`, password: `${Cypress.env('devPwd')}` })
      .then((refreshTokenResponse) => {
          cy
              .request('POST', `${Cypress.env('apiDomain')}/v1/authentication/access_tokens`, { refresh_token: `${refreshTokenResponse.body.data.refresh_token}` })
              .then((accessTokenResponse) => {
                  accessToken = accessTokenResponse.body.data.access_token
                  // organisation creation
                  cy
                      .request(
                          {
                              url: `${Cypress.env('apiDomain')}/v1/organisations`,
                              method: 'POST',
                              headers: { Authorization: accessToken },
                              body: {
                                  name: `${organisationName}`,
                                  // Using faker here isn't such a good idea because of the constraints on the technical name
                                  technical_name: `${Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)}`,
                                  market_id: '1'
                              }
                          })
                      .then((orgResponse) => {
                          organisationId=orgResponse.body.data.id
                          // datamart creation
                          cy
                              .request(
                                  {
                                      url: `${Cypress.env('apiDomain')}/v1/datamarts`,
                                      method: 'POST',
                                      headers: { Authorization: accessToken },
                                      body: {
                                          name: `${datamartName}`,
                                          region: 'EUROPE',
                                          user_point_system_version: 'v201901',
                                          organisation_id: `${organisationId}`,
                                          type: 'DATAMART',
                                          datafarm: 'DF_EU_DEV'
                                      }
                                  })
                              .then((datamartResponse) => {
                                  datamartId = datamartResponse.body.data.id
                                  // schema publication
                                  cy
                                      .request(
                                          {
                                              url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/graphdb_runtime_schemas`,
                                              method: 'GET',
                                              headers: { Authorization: accessToken }
                                          })
                                      .then((schemaResponse) => {
                                          schemaId = schemaResponse.body.data[0].id
                                          cy
                                              .request(
                                                  {
                                                      url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/text`,
                                                      method: 'GET',
                                                      headers: { Authorization: accessToken }
                                                  })
                                              .then(() => {
                                                  cy
                                                      .request(
                                                          {
                                                              url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/text`,
                                                              method: 'PUT',
                                                              headers: { Authorization: accessToken, 'Content-type': 'text/plain' },
                                                              body:'######\n'+


                                                              'type UserPoint  @TreeIndexRoot(index:"USER_INDEX") {\n'+
                                                                 'profiles:[UserProfile!]!\n'+
                                                                 'segments:[UserSegment!]!\n'+
                                                                 'id:ID!\n'+
                                                                 'agents:[UserAgent!]!\n'+
                                                                 'accounts:[UserAccount!]!\n'+
                                                                 'emails:[UserEmail!]!\n'+
                                                                 'activity_events:[ActivityEvent!]!\n'+
                                                                 'creation_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'creation_date:Date! @Function(name:"ISODate", params:["creation_ts"])\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserScenario  @Mirror(object_type:"UserScenario") {\n'+
                                                                 'id:ID! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'scenario_id:String! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'execution_id:String! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'node_id:String! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'callback_ts:Timestamp @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'start_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'node_start_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserAgent  {\n'+
                                                                 'creation_ts:Timestamp!\n'+
                                                                 'id:ID! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'creation_date:Date! @Function(name:"ISODate", params:["creation_ts"]) @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'user_agent_info:UserAgentInfo @Function(name:"DeviceInfo", params:["id"]) @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserAgentInfo  {\n'+
                                                                 'os_version:String\n'+
                                                                 'brand:String @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'browser_family:BrowserFamily @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'browser_version:String @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'carrier:String @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'model:String @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'os_family:OperatingSystemFamily @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'agent_type:UserAgentType @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'form_factor:FormFactor @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserAccount  {\n'+
                                                                 'creation_ts:Timestamp!\n'+
                                                                 'id:ID! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'compartment_id:String! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'user_account_id:String! @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserEmail  {\n'+
                                                                 'creation_ts:Timestamp!\n'+
                                                                 'id:ID! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'email:String @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserSegment  {\n'+
                                                                 'id:ID! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'creation_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'expiration_ts:Timestamp @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'last_modified_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type UserProfile  {\n'+
                                                                 'id:ID!\n'+
                                                                 'compartment_id:String! @TreeIndex(index:"USER_INDEX") @ReferenceTable(type:"CORE_OBJECT", model_type:"COMPARTMENTS")\n'+
                                                                 'user_account_id:String @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'creation_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'last_modified_ts:Timestamp! @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'+
                                                              '######\n'+
                                                              'type ActivityEvent  @Mirror(object_type:"UserEvent") {\n'+
                                                                 'url:String @Property(path:"$properties.$url") @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'referrer:String @Property(path:"$properties.$referrer") @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'date:Date! @Function(name:"ISODate", params:["ts"]) @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'nature:String @Property(path:"$event_name") @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'id:ID!\n'+
                                                                 'ts:Timestamp!\n'+
                                                                 'test:String @Property(paths:["$properties.universe", "$properties.site_id"]) @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'site_id:String @Property(path:"$properties.site_id") @TreeIndex(index:"USER_INDEX")\n'+
                                                                 'app_id:String @Property(path:"$properties.app_id") @TreeIndex(index:"USER_INDEX")\n'+
                                                              '}\n'
                                                          })
                                                      .then(()=>{
                                                          cy
                                                          .request({
                                                              url:`${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/validation?organisationId=${organisationId}&allow_administrator=true`,
                                                              method: 'POST',
                                                              headers: { Authorization: accessToken }
                                                          })
                                                          .then(()=>{
                                                            if(Cypress.env('apiDomain')==='https://api.mediarithmics.local'){
                                                              cy.exec(`curl -k -H "Authorization: ${accessToken}" -H Content-Type: application/json -X POST ${Cypress.env('apiDomain')}:8493/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/publication -H "Host: admin-api.mediarithmics.local:8493"`)
                                                              .its('stdout').should('contain', '"status":"ok"')
                                                              .then(()=> {
                                                                  cy
                                                                  .exec(`cat <<EOT > cypress/fixtures/init_infos.json
                                                                  {
                                                                      "accessToken":"${accessToken}",
                                                                      "datamartId":${datamartId},
                                                                      "datamartName":"${datamartName}",
                                                                      "schemaId":${schemaId},
                                                                      "organisationId":${organisationId},
                                                                      "organisationName":"${organisationName}"
                                                                  }`)
                                                              })
                                                            }
                                                            else if(Cypress.env('userName')!==''){
                                                              cy.exec(`ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env('virtualPlatformName')}.mics-sandbox.com 'curl -k -H "Authorization: ${accessToken}" -H "Content-Type: application/json" -X POST https://10.0.1.3:8493/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/publication -H "Host: admin-api.mediarithmics.local:8493"'`)
                                                              .its('stdout').should('contain', '"status":"ok"')
                                                              .then(()=>{
                                                                  cy
                                                                  .exec(`cat <<EOT > cypress/fixtures/init_infos.json
                                                                  {
                                                                      "accessToken":"${accessToken}",
                                                                      "datamartId":${datamartId},
                                                                      "datamartName":"${datamartName}",
                                                                      "schemaId":${schemaId},
                                                                      "organisationId":${organisationId},
                                                                      "organisationName":"${organisationName}"
                                                                  }`)
                                                                })
                                                            }
                                                            else{
                                                              cy.exec(`ssh -o StrictHostKeyChecking=no ${Cypress.env('virtualPlatformName')}.mics-sandbox.com 'curl -k -H "Authorization: ${accessToken}" -H "Content-Type: application/json" -X POST https://10.0.1.3:8493/v1/datamarts/${datamartId}/graphdb_runtime_schemas/${schemaId}/publication -H "Host: admin-api.mediarithmics.local:8493"'`)
                                                              .its('stdout').should('contain', '"status":"ok"')
                                                              .then(()=>{
                                                                  cy
                                                                  .exec(`cat <<EOT > cypress/fixtures/init_infos.json
                                                                  {
                                                                      "accessToken":"${accessToken}",
                                                                      "datamartId":${datamartId},
                                                                      "datamartName":"${datamartName}",
                                                                      "schemaId":${schemaId},
                                                                      "organisationId":${organisationId},
                                                                      "organisationName":"${organisationName}"
                                                                  }`)
                                                                })
                                                            }
                                                          })
                                                      })
                                              })
                                      })
                              })
                      })
          })
      })
  })

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
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

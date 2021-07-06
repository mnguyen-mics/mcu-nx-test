import faker from 'faker';

describe('Datamart Replication Feature Tests', () => {
  afterEach(() => {
    cy.clearLocalStorage();
  });

  const editedName = faker.random.word();

  it('datamart replication forms', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-replicationNew_button').click();
      cy.get('.mcs-card.replication-card').first().click();
      cy.get('.mcs-replications_nameField').type(faker.random.word());
      const fileName = '03-credentialsTestFile.txt';
      cy.get('.mcs-dataFileForm--selectDataFile').click();
      cy.get('.mcs-formDataFileDrawer--uploadFile').siblings().attachFile(fileName);
      cy.get('.mcs-formDataFileDrawer_updateDataFileButton').click();
      cy.get('.mcs-pubSubCustomFormSection_projectIdField').type(faker.random.word());
      cy.get('.mcs-pubSubCustomFormSection_topicIdField').type(faker.random.word());
      cy.get('.mcs-form_saveButton_datamartReplicationForm').click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-datamartReplicationTable_dropDownMenu').first().click();
      cy.get('.mcs-datamartReplicationTable_dropDownMenu--edit').click();
      cy.get('.mcs-replications_nameField').clear().type(editedName);
      cy.get('.mcs-form_saveButton_datamartReplicationForm').click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-datamartReplicationTable').should('contain', editedName);
    });
  });

  it("a datamart replication can't be unpaused if the credentials are wrong", () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-replicationNew_button').click();
      cy.get('.mcs-card.replication-card').first().click();
      cy.get('.mcs-replications_nameField').type(faker.random.word());
      const fileName = '03-credentialsTestFile.txt';
      cy.get('.mcs-dataFileForm--selectDataFile').click();
      cy.get('.mcs-formDataFileDrawer--uploadFile').siblings().attachFile(fileName);
      cy.get('.mcs-formDataFileDrawer_updateDataFileButton').click();
      cy.get('.mcs-pubSubCustomFormSection_projectIdField').type(faker.random.word());
      cy.get('.mcs-pubSubCustomFormSection_topicIdField').type(faker.random.word());
      cy.get('.mcs-form_saveButton_datamartReplicationForm').click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-table-switch').first().click({ force: true });
      cy.get('code').contains(
        /Missing mandatory credentials|Error in validating credentials|An error occurred during credentials validation/,
      );
    });
  });

  it("we can't create an initial synchronization without a LIVE replication", () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-replicationNew_button').click();
      cy.get('.mcs-card.replication-card').first().click();
      cy.get('.mcs-replications_nameField').type(faker.random.word());
      const fileName = '03-credentialsTestFile.txt';
      cy.get('.mcs-dataFileForm--selectDataFile').click();
      cy.get('.mcs-formDataFileDrawer--uploadFile').siblings().attachFile(fileName);
      cy.get('.mcs-formDataFileDrawer_updateDataFileButton').click();
      cy.get('.mcs-pubSubCustomFormSection_projectIdField').type(faker.random.word());
      cy.get('.mcs-pubSubCustomFormSection_topicIdField').type(faker.random.word());
      cy.get('.mcs-form_saveButton_datamartReplicationForm').click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.get('.mcs-replicationNewExecution_button').click();
      cy.contains("You can't execute an Initial Synchronization.");
    });
  });

  it("when an initial synchro is running we can't create another one", () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.intercept({ pathname: /\/datamarts\/.*\/replications/, method: 'GET' }, req => {
        req.reply(res => {
          res.send(
            200,
            '{"status":"ok","data":[{"type":"GOOGLE_PUBSUB","id":"80","name":"test","datamart_id":"1534","credentials_uri":"mics://private_data_file/tenants/1459/datamarts/1534/replications/80/credentials.json","project_id":"neon-lock-297510","topic_id":"test_mics","status":"ACTIVE"}],"count":1,"total":1,"first_result":0,"max_result":50,"max_results":50}',
            {
              'content-type': 'application/json',
              'content-encoding': 'UTF-8',
              'access-control-max-age': '600',
              'access-control-allow-origin': '*',
              'access-control-allow-headers':
                'Accept, Content-Type, Origin, Authorization, X-Requested-With, X-Requested-By',
              'access-control-allow-methods': 'POST, GET, PUT, DELETE',
              'content-length': '97',
              'strict-transport-security': 'max-age=63072000;includeSubDomains;preload',
            },
          );
        });
      });
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--replications').click();
      cy.wait(1000);
      cy.get('.mcs-replicationNewExecution_button').click();
      cy.get('.mcs-modal--confirmDialog').contains('New Execution').click();
      cy.wait(1000);
      cy.get('.mcs-replicationNewExecution_button').click();
      cy.wait(1000);
      cy.get('.mcs-modal--confirmDialog').contains('New Execution').click();
      cy.contains('Something went wrong');
    });
  });
});

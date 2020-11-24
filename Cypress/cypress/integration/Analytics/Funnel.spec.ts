describe('Should test the funnel', () => {
  let createdChannelId: string;
  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${
          data.datamartId
        }/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test',
          domain: 'test.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(channelResponse => {
        createdChannelId = channelResponse.body.data.id;
      });
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it.skip('step 1 should be correctly displayed with total 0', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login()
      cy.switchOrg(data.organisationName)
      cy.get('.mcs-sideBar-subMenu_menu.dataStudio.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu.dataStudio.funnel').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.contains('Has visited using this channel').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId+'{enter}')
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn button:first').click()
      cy.get('.mcs-funnel_stepName_title').should('have.length', 2)
      cy.get('.mcs-funnel_userPoints_nbr',{timeout:20000}).should('have.length','2')
    });
  });

  it('should test a funnel display with data', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu.dataStudio.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu.dataStudio.funnel').click();
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${
          data.datamartId
        }/user_activities?processing_pipeline=false`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          $user_account_id: 'test_funnel',
          $type: 'APP_VISIT',
          $site_id: `${createdChannelId}`,
          $session_status: 'NO_SESSION',
          $ts: new Date().getTime(),
          $events: [
            {
              $event_name: '$transaction_confirmed',
              $ts: new Date().getTime(),
              $properties: {
                $product_id: 'test',
              },
            },
          ],
        },
      }).then(() => {
        cy.wait(5000);
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Has visited using this channel').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(
          createdChannelId + '{enter}',
        );
        cy.get('.mcs-funnelQueryBuilder_executeQueryBtn button:first').click();
        cy.wait(2000);
        cy.get('.mcs-funnel_userPoints_nbr').should('have.length', 2);
        cy.get('.mcs-funnel_stepName_title').should('have.length', 2);
        cy.get('.mcs-funnel_stepName_title')
          .first()
          .should('contain', 'Total');
        cy.get('.mcs-funnel_stepName_title')
          .eq(1)
          .should('contain', 'Step 1');
        cy.get('.mcs-funnel_stepInfo')
          .first()
          .should('contain', '0.00%');
        cy.get('.mcs-funnel_stepInfo')
          .eq(1)
          .should('contain', '100.00%');
        cy.get('.mcs-funnel_userPoints_nbr')
          .first()
          .should('contain', '1');
        cy.get('.mcs-funnel_userPoints_nbr')
          .eq(1)
          .should('contain', '1');
      });
    });
  });

  it('should test the steps reordering', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu.dataStudio.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu.dataStudio.funnel').click();
      cy.get('.mcs-funnelQueryBuilder_addStepBtn').click();
      cy.get('.mcs-funnelQueryBuilder_addStepBtn').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions')
        .first()
        .click();
      cy.contains('Activity Date').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions')
        .first()
        .should('contain', 'Activity Date');
      cy.get('.mcs-funnelQueryBuilder_sortBtn')
        .first()
        .click();
      cy.get('.mcs-funnelQueryBuilder_sortBtn')
        .eq(2)
        .click();
      cy.get('.mcs-funnelQueryBuilder_sortBtn')
        .eq(3)
        .click();
      cy.get('.mcs-funnelQueryBuilder_sortBtn')
        .eq(1)
        .click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions')
        .first()
        .should('contain', 'Activity Date');
    });
  });

  it('should test the product id, categories, brand autocompletes', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu.dataStudio.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu.dataStudio.funnel').click();
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${
          data.datamartId
        }/user_activities?processing_pipeline=false`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          $user_account_id: 'test',
          $type: 'APP_VISIT',
          $site_id: `${createdChannelId}`,
          $session_status: 'NO_SESSION',
          $ts: new Date().getTime(),
          $events: [
            {
              $event_name: '$item_view',
              $ts: new Date().getTime(),
              $properties: {
                $items: [
                  {
                    $product_id: 'test_autocomplete',
                    $brand: 'test_autocomplete',
                    $category1: 'test_autocomplete',
                    $category2: 'test_autocomplete',
                    $category3: 'test_autocomplete',
                    $category4: 'test_autocomplete',
                  },
                ],
              },
            },
          ],
        },
      }).then(()=>{
        cy.wait(2000)
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Product Id').click()
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test')
        cy.get('#mcs-funnel_expression_select_anchor').should('contain','test_autocomplete')
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Brand').click()
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test')
        cy.get('#mcs-funnel_expression_select_anchor').should('contain','test_autocomplete')
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 1').click()
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test')
        cy.get('#mcs-funnel_expression_select_anchor').should('contain','test_autocomplete')
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 2').click()
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test')
        cy.get('#mcs-funnel_expression_select_anchor').should('contain','test_autocomplete')
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 3').click()
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test')
        cy.get('#mcs-funnel_expression_select_anchor').should('contain','test_autocomplete')
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 4').click()
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test')
        cy.get('#mcs-funnel_expression_select_anchor').should('contain','test_autocomplete')
      })
    });
  });

  it('should test the steps, dimensions deletion',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu.dataStudio.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu.dataStudio.funnel').click();
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length',1)
      cy.get('.mcs-funnelQueryBuilder_removeStepBtn').click()
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length',0)
      cy.get('.mcs-funnelQueryBuilder_addStepBtn').click()
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length',1)
      cy.get('.mcs-funnelQueryBuilder_addStepBtn').click()
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length',2)
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should('have.length',2)
      cy.get('.mcs-funnelQueryBuilder_removeFilterBtn').first().click()
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should('have.length',1)
      cy.get('.mcs-funnelQueryBuilder_addDimensionBtn').first().click()
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should('have.length',2)
    })
  })
});

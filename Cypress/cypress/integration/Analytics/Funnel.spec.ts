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

  it('step 1 should be correctly displayed with total 0', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.contains('Channel Id').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(
        createdChannelId + '{enter}',
      );
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn button:first').click();
      cy.get('.mcs-funnel_empty', { timeout: 20000 }).should(
        'contain',
        'There is no data for your query.',
      );
    });
  });

  it('should test a funnel display with data', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
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
        cy.contains('Channel Id').click();
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
          .eq(1)
          .should('contain', '0.0000%');
        cy.get('.mcs-funnel_stepInfo')
          .first()
          .should('contain', '100%');
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
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
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
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
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
      }).then(() => {
        cy.wait(2000);
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Product Id').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor', {
          timeout: 20000,
        }).should('contain', 'test_autocomplete');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Brand').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should(
          'contain',
          'test_autocomplete',
        );
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 1').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should(
          'contain',
          'test_autocomplete',
        );
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 2').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should(
          'contain',
          'test_autocomplete',
        );
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 3').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should(
          'contain',
          'test_autocomplete',
        );
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.contains('Category 4').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should(
          'contain',
          'test_autocomplete',
        );
      });
    });
  });

  it('should test the steps, dimensions deletion', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length', 1);
      cy.get('.mcs-funnelQueryBuilder_removeStepBtn').click();
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length', 0);
      cy.get('.mcs-funnelQueryBuilder_addStepBtn').click();
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length', 1);
      cy.get('.mcs-funnelQueryBuilder_addStepBtn').click();
      cy.get('.mcs-funnelQueryBuilder_step').should('have.length', 2);
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should(
        'have.length',
        2,
      );
      cy.get('.mcs-funnelQueryBuilder_removeFilterBtn')
        .first()
        .click();
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should(
        'have.length',
        1,
      );
      cy.get('.mcs-funnelQueryBuilder_addDimensionBtn')
        .first()
        .click();
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should(
        'have.length',
        2,
      );
    });
  });

  it('should check that we have the right numbers between the steps', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${
          data.datamartId
        }/user_activities?processing_pipeline=false`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          $user_account_id: 'testing',
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
                    $product_id: 'test',
                  },
                ],
              },
            },
          ],
        },
      }).then(() => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test_percentage_1',
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
                      $product_id: 'test_percentage',
                    },
                  ],
                },
              },
            ],
          },
        }).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test_percentage_2',
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
                        $product_id: 'test_percentage',
                      },
                    ],
                  },
                },
              ],
            },
          }).then(() => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                data.datamartId
              }/user_activities?processing_pipeline=false`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                $user_account_id: 'test_percentage_3',
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
                          $product_id: 'test_percentage',
                        },
                      ],
                    },
                  },
                ],
              },
            }).then(() => {
              cy.wait(10000);
              cy.request({
                url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                  data.datamartId
                }/user_activities?processing_pipeline=false`,
                method: 'POST',
                headers: { Authorization: data.accessToken },
                body: {
                  $user_account_id: 'test_percentage_3',
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
                            $product_id: 'test_percentage',
                            $brand: 'percentage',
                          },
                        ],
                      },
                    },
                  ],
                },
              }).then(() => {
                cy.request({
                  url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                    data.datamartId
                  }/user_activities?processing_pipeline=false`,
                  method: 'POST',
                  headers: { Authorization: data.accessToken },
                  body: {
                    $user_account_id: 'test_percentage_3',
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
                              $product_id: 'test_percentage',
                              $brand: 'percentage',
                            },
                          ],
                        },
                      },
                    ],
                  },
                }).then(() => {
                  cy.wait(5000);
                  cy.login();
                  cy.switchOrg(data.organisationName);
                  cy.get(
                    '.mcs-sideBar-subMenu_menu\\.dataStudio\\.title',
                  ).click();
                  cy.get(
                    '.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel',
                  ).click();
                  cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
                  cy.contains('Product Id').click();
                  cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(
                    'test_percentage' + '{enter}',
                  );
                  cy.get('.mcs-funnelQueryBuilder_addStepBtn').click();
                  cy.get('.mcs-funnelQueryBuilder_select--dimensions')
                    .eq(1)
                    .click();
                  cy.wait(1000);
                  cy.get('.ant-select-dropdown')
                    .eq(2)
                    .contains('Brand')
                    .click({ force: true });
                  cy.get('.mcs-funnelQueryBuilder_dimensionValue')
                    .eq(1)
                    .type('percentage' + '{enter}');
                  cy.get('.mcs-date-range-picker').click();
                  cy.contains('Today').click();
                  cy.get(
                    '.mcs-funnelQueryBuilder_executeQueryBtn button:first',
                  ).click();
                  cy.get('.mcs-funnel_stepInfo')
                    .eq(2)
                    .children()
                    .first()
                    .then($stepPercetange => {
                      const stepPercentage: number = parseInt(
                        $stepPercetange.text(),
                        10,
                      );
                      cy.get('.mcs-funnel_userPoints_nbr')
                        .eq(1)
                        .then($firstStepNumber => {
                          const firstStepNumber: number = parseInt(
                            $firstStepNumber.text(),
                            10,
                          );
                          cy.get('.mcs-funnel_userPoints_nbr')
                            .eq(2)
                            .then($secondStepNumber => {
                              const secondStepNumber: number = parseInt(
                                $secondStepNumber.text(),
                                10,
                              );
                              expect(
                                Math.ceil(
                                  100 -
                                    (secondStepNumber / firstStepNumber) * 100,
                                ),
                              ).to.eq(100 - stepPercentage);
                            });
                        });
                    });
                });
              });
            });
          });
        });
      });
    });
  });
});

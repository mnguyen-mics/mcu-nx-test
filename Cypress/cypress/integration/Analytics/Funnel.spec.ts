describe('Should test the funnel', () => {
  let createdChannelId: string;

  const getDate = (diffDays: number, diffMonths: number, euFormat?: boolean) => {
    const wantedDate = new Date(
      new Date().setDate(new Date().getDate() + diffDays + diffMonths * 30),
    );
    const day = wantedDate.getDate();
    const month = wantedDate.getMonth() + 1;
    const year = wantedDate.getFullYear();
    const formattedDay = day >= 10 ? day : `0${day}`;
    const formattedMonth = month >= 10 ? month : `0${month}`;
    if (euFormat && euFormat === true) {
      return `${formattedDay}/${formattedMonth}/${year}`;
    }
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const goToFunnelAndClickOnDimensions = (organisationName: string) => {
    cy.login();
    cy.switchOrg(organisationName);
    cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
    cy.wait(2000);
    cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
    cy.wait(2000);
  };

  const funnelStubbedResponse = (stepCount: number) => {
    return {
      status: 200,
      body: {
        status: 'ok',
        data: {
          global: {
            total: stepCount,
            steps: [{ name: 'Step 1', count: stepCount, interaction_duration: 10 }],
            grouped_by: [],
          },
        },
      },
      conversionBody: {
        status: 'ok',
        data: {
          global: {
            total: stepCount,
            steps: [
              {
                name: 'Step 1',
                count: stepCount,
                interaction_duration: 10,
                conversion: 5000,
                amount: 8000,
              },
            ],
            grouped_by: [],
          },
        },
      },
      percentageBody: {
        status: 'ok',
        data: {
          global: {
            total: 100000000,
            steps: [
              {
                name: 'Step 1',
                count: 1,
                interaction_duration: 10,
              },
            ],
            grouped_by: [],
          },
        },
      },
      headers: {
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
    };
  };
  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
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
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click({ force: true });
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click({ force: true });
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.get('.mcs-funnel_empty').should(
        'contain',
        'There is no data for your query. Please retry later!',
        { timeout: 20000 },
      );
    });
  });

  it.skip('should test a funnel display with data', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
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
          $ts: new Date().getTime() - 22800000,
          $events: [
            {
              $event_name: '$transaction_confirmed',
              $ts: new Date().getTime() - 22800000,
              $properties: {
                $product_id: 'test',
              },
            },
          ],
        },
      }).then(() => {
        cy.wait(20000);
        cy.get('.mcs-dateRangePicker').click();
        cy.contains('Today').click({ force: true });
        cy.reload();
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').type('channel');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
        cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
        cy.get('.mcs-funnel_conversionInfo').first().should('contain', '0%');
        cy.get('.mcs-funnel_conversions').first().should('contain', '100.00%');
        cy.get('.mcs-funnel_stepInfo').first().should('contain', '1');
        cy.get('.mcs-funnel_stepInfo').eq(1).should('contain', '1');
      });
    });
  });

  it('should test the steps reordering', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').first().click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--BRAND').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').first().should('contain', 'Brand');
      cy.get('.mcs-timelineStepBuilder_sortBtn').first().click();
      cy.get('.mcs-timelineStepBuilder_sortBtn').eq(2).click();
      cy.get('.mcs-timelineStepBuilder_sortBtn').eq(3).click();
      cy.get('.mcs-timelineStepBuilder_sortBtn').eq(1).click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').first().should('contain', 'Brand');
    });
  });

  it('should test the product id, categories, brand autocompletes', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click().type('product');
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--PRODUCT_ID').click();
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
          $ts: new Date().getTime() - 10800000,
          $events: [
            {
              $event_name: '$item_view',
              $ts: new Date().getTime() - 10800000,
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
        cy.wait(5000);
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor', {
          timeout: 20000,
        }).should('contain', 'test_autocomplete');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click().type('brand');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions--BRAND').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should('contain', 'test_autocomplete');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click().type('category');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY1').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should('contain', 'test_autocomplete');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click().type('category');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY2').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should('contain', 'test_autocomplete');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click().type('category');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY3').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should('contain', 'test_autocomplete');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
        cy.get('.mcs-funnelQueryBuilder_select--dimensions').click().type('category');
        cy.get('.mcs-funnelQueryBuilder_select--dimensions--CATEGORY4').click();
        cy.get('.mcs-funnelQueryBuilder_dimensionValue').type('test');
        cy.get('#mcs-funnel_expression_select_anchor').should('contain', 'test_autocomplete');
      });
    });
  });

  it('should test the steps, dimensions deletion', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-timelineStepBuilder_step').should('have.length', 1);
      cy.get('.mcs-timelineStepBuilder_removeStepBtn').click();
      cy.get('.mcs-timelineStepBuilder_step').should('have.length', 0);
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.get('.mcs-timelineStepBuilder_step').should('have.length', 1);
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.get('.mcs-timelineStepBuilder_step').should('have.length', 2);
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should('have.length', 2);
      cy.get('.mcs-funnelQueryBuilder_removeFilterBtn').first().click();
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should('have.length', 1);
      cy.get('.mcs-funnelQueryBuilder_addDimensionBtn').first().click();
      cy.get('.mcs-funnelQueryBuilder_step_dimensions').should('have.length', 2);
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
          $ts: new Date().getTime() - 10800000,
          $events: [
            {
              $event_name: '$item_view',
              $ts: new Date().getTime() - 10800000,
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
            $ts: new Date().getTime() - 10800000,
            $events: [
              {
                $event_name: '$item_view',
                $ts: new Date().getTime() - 10800000,
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
              $ts: new Date().getTime() - 10800000,
              $events: [
                {
                  $event_name: '$item_view',
                  $ts: new Date().getTime() - 10800000,
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
                $ts: new Date().getTime() - 10800000,
                $events: [
                  {
                    $event_name: '$item_view',
                    $ts: new Date().getTime() - 10800000,
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
                  $ts: new Date().getTime() - 10800000,
                  $events: [
                    {
                      $event_name: '$item_view',
                      $ts: new Date().getTime() - 10800000,
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
                    $ts: new Date().getTime() - 10800000,
                    $events: [
                      {
                        $event_name: '$item_view',
                        $ts: new Date().getTime() - 10800000,
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
                  goToFunnelAndClickOnDimensions(data.organisationName);
                  cy.get('.mcs-dateRangePicker').click();
                  cy.contains('Today').click({ force: true });
                  cy.reload();
                  cy.get('.mcs-funnelQueryBuilder_select--dimensions').type('product');
                  cy.get('.mcs-funnelQueryBuilder_select--dimensions--PRODUCT_ID').click();
                  cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(
                    'test_percentage' + '{enter}',
                  );
                  cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
                  cy.get('.mcs-funnelQueryBuilder_select--dimensions').eq(1).click().type('brand');
                  cy.wait(1000);
                  cy.get('.mcs-funnelQueryBuilder_select--dimensions--BRAND').click({
                    force: true,
                  });
                  cy.get('.mcs-funnelQueryBuilder_dimensionValue')
                    .eq(1)
                    .type('percentage' + '{enter}');
                  cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
                  cy.get('.mcs-funnel_deltaInfo')
                    .eq(1)
                    .then($stepPercetange => {
                      const stepPercentage: number = parseInt($stepPercetange.text(), 10);
                      cy.get('.mcs-funnel_stepInfo_desc')
                        .eq(1)
                        .children()
                        .first()
                        .then($firstStepNumber => {
                          const firstStepNumber: number = parseInt($firstStepNumber.text(), 10);
                          cy.get('.mcs-funnel_stepInfo_desc')
                            .eq(3)
                            .children()
                            .first()
                            .then($secondStepNumber => {
                              const secondStepNumber: number = parseInt(
                                $secondStepNumber.text(),
                                10,
                              );
                              expect(
                                Math.floor(100 - (secondStepNumber / firstStepNumber) * 100),
                              ).to.eq(stepPercentage);
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

  it('should send the right request on 7 days datepicker', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, 0));
        expect(req.body.in.start_date).to.eq(getDate(-7, 0));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(100).status,
            funnelStubbedResponse(100).body,
            funnelStubbedResponse(100).headers,
          );
        });
      });
      cy.get('.mcs-funnel_stepInfo').eq(0).should('contain', '100');
      cy.get('.mcs-timelineStepBuilder_step_timelineStart').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(-7, 0, true));
      });
      cy.get('.mcs-timelineStepBuilder_step_timelineEnd').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, 0, true));
      });
    });
  });

  it('should send the right request on today datepicker', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-dateRangePicker').click();
      cy.contains('Today').click({ force: true });
      cy.reload();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');

      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, 0));
        expect(req.body.in.start_date).to.eq(getDate(0, 0));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(200).status,
            funnelStubbedResponse(200).body,
            funnelStubbedResponse(200).headers,
          );
        });
      });
      cy.get('.mcs-funnel_stepInfo').eq(0).should('contain', '200');
      cy.get('.mcs-timelineStepBuilder_step_timelineStart').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, 0, true));
      });
      cy.get('.mcs-timelineStepBuilder_step_timelineEnd').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, 0, true));
      });
    });
  });

  it('should send the right request on 30 days datepicker', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-dateRangePicker').click();
      cy.contains('Last 30 days').click({ force: true });
      cy.reload();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, 0));
        expect(req.body.in.start_date).to.eq(getDate(0, -1));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(300).status,
            funnelStubbedResponse(300).body,
            funnelStubbedResponse(300).headers,
          );
        });
      });
      cy.get('.mcs-funnel_stepInfo').eq(0).should('contain', '300');
      cy.get('.mcs-timelineStepBuilder_step_timelineStart').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, -1, true));
      });
      cy.get('.mcs-timelineStepBuilder_step_timelineEnd').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, 0, true));
      });
    });
  });

  it('should send the right request on custom datepicker', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-dateRangePicker').click();
      cy.get('.ant-picker-input')
        .eq(0)
        .find('input')
        .clear({ force: true })
        .type(getDate(0, -3), { force: true });
      cy.get('.ant-picker-input')
        .eq(1)
        .find('input')
        .clear({ force: true })
        .type(`${getDate(0, -2)}{enter}`, { force: true });
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.reload();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, -2));
        expect(req.body.in.start_date).to.eq(getDate(0, -3));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(400).status,
            funnelStubbedResponse(400).body,
            funnelStubbedResponse(400).headers,
          );
        });
      });
      cy.get('.mcs-funnel_stepInfo').eq(0).should('contain', '400');
      cy.get('.mcs-timelineStepBuilder_step_timelineStart').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, -3, true));
      });
      cy.get('.mcs-timelineStepBuilder_step_timelineEnd').within(() => {
        cy.get('.mcs-funnelQueryBuilder_timeline_date').should('contain', getDate(0, -2, true));
      });
    });
  });

  it('should display the amount and conversion when available', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-dateRangePicker').click();
      cy.get('.ant-picker-input')
        .eq(0)
        .find('input')
        .clear({ force: true })
        .type(getDate(0, -3), { force: true });
      cy.get('.ant-picker-input')
        .eq(1)
        .find('input')
        .clear({ force: true })
        .type(`${getDate(0, -2)}{enter}`, { force: true });
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.reload();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, -2));
        expect(req.body.in.start_date).to.eq(getDate(0, -3));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(400).status,
            funnelStubbedResponse(400).conversionBody,
            funnelStubbedResponse(400).headers,
          );
        });
      });
      cy.get('.mcs-funnel_stepInfo').eq(0).should('contain', '400');
      cy.get('.mcs-funnel_stepInfo').eq(1).should('contain', '5,000');
      cy.get('.mcs-funnel_stepInfo').eq(1).should('contain', '8,000€');
    });
  });

  it('should test the mathematical notation for percentages', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.get('.mcs-dateRangePicker').click();
      cy.get('.ant-picker-input')
        .eq(0)
        .find('input')
        .clear({ force: true })
        .type(getDate(0, -3), { force: true });
      cy.get('.ant-picker-input')
        .eq(1)
        .find('input')
        .clear({ force: true })
        .type(`${getDate(0, -2)}{enter}`, { force: true });
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.reload();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions').click();
      cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
      cy.get('.mcs-funnelQueryBuilder_dimensionValue').type(createdChannelId + '{enter}');
      cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, -2));
        expect(req.body.in.start_date).to.eq(getDate(0, -3));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(400).status,
            funnelStubbedResponse(400).percentageBody,
            funnelStubbedResponse(400).headers,
          );
        });
      });
      cy.get('.mcs-funnel_conversions').should('contain', '1.00e-6%');
    });
  });

  it('should test the group by feature', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test_splitBy',
          domain: 'test_splitBy.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(channelResp => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test_splitby',
            $type: 'APP_VISIT',
            $site_id: `${channelResp.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: new Date().getTime() - 10800000,
            $events: [
              {
                $event_name: '$item_view',
                $ts: new Date().getTime() - 10800000,
                $properties: {
                  $items: [],
                },
              },
            ],
          },
        }).then(() => {
          cy.wait(2000);
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              name: 'test_splitBy_2',
              domain: 'test_splitBy_2.com',
              enable_analytics: false,
              type: 'MOBILE_APPLICATION',
            },
          }).then(secondChannelResp => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                data.datamartId
              }/user_activities?processing_pipeline=false`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                $user_account_id: 'test_splitBy_2',
                $type: 'APP_VISIT',
                $site_id: `${secondChannelResp.body.data.id}`,
                $session_status: 'NO_SESSION',
                $ts: new Date().getTime() - 10800000,
                $events: [
                  {
                    $event_name: '$item_view',
                    $ts: new Date().getTime() - 10800000,
                    $properties: {},
                  },
                ],
              },
            }).then(() => {
              goToFunnelAndClickOnDimensions(data.organisationName);
              cy.get('.mcs-dateRangePicker').click();
              cy.contains('Last 30 days').click({ force: true });
              cy.reload();
              cy.wait(2000);
              cy.get('.mcs-funnelQueryBuilder_select--dimensions').type('channel');
              cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
              cy.get('.mcs-funnelQueryBuilder_dimensionValue').click();
              cy.contains(`${secondChannelResp.body.data.id} - test_splitBy_2`).click({
                force: true,
              });
              cy.wait(500);
              cy.contains(`${channelResp.body.data.id} - test_splitBy`).click({ force: true });
              cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
              cy.wait(5000);
              cy.get('.mcs-funnel_splitBy_select').click();
              cy.get('.mcs-funnelSplitBy_option').first().click();
              cy.get('.mcs-funnelStepHover').should('contain', channelResp.body.data.id);
              cy.get('.mcs-funnelStepHover').should('contain', secondChannelResp.body.data.id);
            });
          });
        });
      });
    });
  });

  it('should test the funnel complementary', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      goToFunnelAndClickOnDimensions(data.organisationName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test_complementary',
          domain: 'test_complementary.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(complementaryChannel => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test_complementary',
            $type: 'APP_VISIT',
            $site_id: `${complementaryChannel.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: new Date().getTime() - 10800000,
            $events: [
              {
                $event_name: '$transaction_confirmed',
                $ts: new Date().getTime() - 10800000,
                $properties: {
                  $items: [],
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
              $user_account_id: 'test_other',
              $type: 'APP_VISIT',
              $site_id: `${createdChannelId}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime() - 10800000,
              $events: [
                {
                  $event_name: '$transaction_confirmed',
                  $ts: new Date().getTime() - 10800000,
                  $properties: {
                    $items: [],
                  },
                },
              ],
            },
          }).then(() => {
            cy.wait(20000);
            cy.reload();
            cy.get('.mcs-funnelQueryBuilder_select--dimensions').type('channel');
            cy.get('.mcs-funnelQueryBuilder_select--dimensions--CHANNEL_ID').click();
            cy.get('.mcs-funnelQueryBuilder_dimensionValue').click();
            cy.contains(`${complementaryChannel.body.data.id} - test_complementary`).click({
              force: true,
            });
            cy.get('.mcs-timelineStepBuilder_addStepBtn').click({ force: true });
            cy.get('.mcs-funnelQueryBuilder_select--dimensions').eq(1).type('conversion');
            cy.get('.mcs-funnelQueryBuilder_select--dimensions--HAS_CONVERSION').click();
            cy.get('.mcs-funnelQueryBuilder_dimensionValue').eq(1).dblclick();
            cy.contains('true').click({ force: true });
            cy.get('.mcs-funnelQueryBuilder_executeQueryBtn').click();
            cy.get('.mcs-funnel_complementaryButton').eq(1).find('button').click();
            cy.get('.mcs-funnel_chart').its('length').should('be.gte', 3);
          });
        });
      });
    });
  });
});

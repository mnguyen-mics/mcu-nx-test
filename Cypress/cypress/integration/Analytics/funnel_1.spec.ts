import FunnelPage from '../../pageobjects/DataStudio/FunnelPage';

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

  beforeEach(() => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      funnelPage.goToPage();
      cy.wait(2000);
      funnelPage.clickDimensionCategoryField();
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('step 1 should be correctly displayed with total 0', () => {
    const funnelPage = new FunnelPage();
    funnelPage.dimensionCategory.click({ force: true });
    funnelPage.selectChannelIdDimension();
    funnelPage.typeDimensionValue(0, createdChannelId);
    funnelPage.clickBtnExecuteQuery();
    funnelPage.funnelEmpty.should(
      'contain',
      'There is no data for your query. Please retry later!',
      { timeout: 20000 },
    );
  });

  it('should test a funnel display with data', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
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
        funnelPage.clickDateRange();
        funnelPage.typePeriod('Today');
        cy.reload();
        funnelPage.typeDimensionCategory('channel');
        funnelPage.clickChannelIdDimension();
        funnelPage.typeDimensionValue(0, createdChannelId);
        funnelPage.clickBtnExecuteQuery();
        funnelPage.conversioInfo.first().should('contain', '0%');
        funnelPage.conversions.first().should('contain', '100.00%');
        funnelPage.stepInfo.first().should('contain', '1');
        funnelPage.stepInfo.eq(1).should('contain', '1');
      });
    });
  });

  it('should test the steps reordering', () => {
    const funnelPage = new FunnelPage();
    funnelPage.goToPage();
    funnelPage.clickBtnAddStep();
    funnelPage.clickBtnAddStep();
    funnelPage.dimensionCategory.first().click();
    funnelPage.clickBrandDimension();
    funnelPage.dimensionCategory.first().should('contain', 'Brand');
    funnelPage.clickBtnSort(0);
    funnelPage.clickBtnSort(2);
    funnelPage.clickBtnSort(3);
    funnelPage.clickBtnSort(1);
    funnelPage.dimensionCategory.first().should('contain', 'Brand');
  });

  it('should test the product id, categories, brand autocompletes', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.typeDimensionCategory('product');
      funnelPage.clickProductIdDimension();
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
        funnelPage.typeDimensionValue(0, 'test');
        funnelPage.fieldDimension.should('contain', 'test_autocomplete');
        funnelPage.typeDimensionCategory('brand');
        funnelPage.clickBrandDimension();
        funnelPage.typeDimensionValue(0, 'test');
        funnelPage.fieldDimension.should('contain', 'test_autocomplete');
        funnelPage.typeDimensionCategory('category');
        funnelPage.clickCategory1Dimension();
        funnelPage.typeDimensionValue(0, 'test');
        funnelPage.fieldDimension.should('contain', 'test_autocomplete');
        funnelPage.typeDimensionCategory('category');
        funnelPage.clickCategory2Dimension();
        funnelPage.typeDimensionValue(0, 'test');
        funnelPage.fieldDimension.should('contain', 'test_autocomplete');
        funnelPage.typeDimensionCategory('category');
        funnelPage.clickCategory3Dimension();
        funnelPage.typeDimensionValue(0, 'test');
        funnelPage.fieldDimension.should('contain', 'test_autocomplete');
        funnelPage.typeDimensionCategory('category');
        funnelPage.clickCategory4Dimension();
        funnelPage.typeDimensionValue(0, 'test');
        funnelPage.fieldDimension.should('contain', 'test_autocomplete');
      });
    });
  });

  it('should test the steps, dimensions deletion', () => {
    const funnelPage = new FunnelPage();
    funnelPage.stepBuilder.should('have.length', 1);
    funnelPage.clickBtnAddStep();
    funnelPage.stepBuilder.should('have.length', 2);
    funnelPage.clickBtnAddStep();
    funnelPage.stepBuilder.should('have.length', 3);
    funnelPage.stepDimension.should('have.length', 3);
    funnelPage.clickBtnRemoveFilter();
    funnelPage.stepDimension.should('have.length', 2);
    funnelPage.clickBtnAddDimension();
    funnelPage.stepDimension.should('have.length', 3);
  });

  it('should check that we have the right numbers between the steps', () => {
    const funnelPage = new FunnelPage();
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

                  funnelPage.clickDateRange();
                  funnelPage.typePeriod('Today');
                  cy.reload();
                  funnelPage.typeDimensionCategory('product');
                  funnelPage.clickProductIdDimension();
                  funnelPage.typeDimensionValue(0, 'test_percentage');
                  funnelPage.clickBtnAddStep();
                  funnelPage.dimensionCategory.eq(1).click().type('brand');
                  cy.wait(1000);
                  funnelPage.clickBrandDimension();
                  funnelPage.typeDimensionValue(1, 'percentage');
                  funnelPage.clickBtnExecuteQuery();
                  funnelPage.deltaInfo.eq(1).then($stepPercetange => {
                    const stepPercentage: number = parseInt($stepPercetange.text(), 10);
                    funnelPage.stepInfoDesc
                      .eq(1)
                      .children()
                      .first()
                      .then($firstStepNumber => {
                        const firstStepNumber: number = parseInt($firstStepNumber.text(), 10);
                        funnelPage.stepInfoDesc
                          .eq(3)
                          .children()
                          .first()
                          .then($secondStepNumber => {
                            const secondStepNumber: number = parseInt($secondStepNumber.text(), 10);
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
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.clickChannelIdDimension();
      funnelPage.typeDimensionValue(0, createdChannelId);
      funnelPage.clickBtnExecuteQuery();
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
      funnelPage.stepInfo.eq(0).should('contain', '100');
      funnelPage.timeStart.within(() => {
        funnelPage.time.should('contain', getDate(-7, 0, true));
      });
      funnelPage.timeEnd.within(() => {
        funnelPage.time.should('contain', getDate(0, 0, true));
      });
    });
  });

  it('should send the right request on today datepicker', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.clickDateRange();
      funnelPage.typePeriod('Today');
      cy.reload();
      funnelPage.clickDimensionCategoryField();
      funnelPage.clickChannelIdDimension();
      funnelPage.typeDimensionValue(0, createdChannelId);

      funnelPage.clickBtnExecuteQuery();
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
      funnelPage.stepInfo.eq(0).should('contain', '200');
      funnelPage.timeStart.within(() => {
        funnelPage.time.should('contain', getDate(0, 0, true));
      });
      funnelPage.timeEnd.within(() => {
        funnelPage.time.should('contain', getDate(0, 0, true));
      });
    });
  });

  it('should send the right request on 30 days datepicker', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.clickDateRange();
      funnelPage.typePeriod('Last 30 days');
      cy.reload();
      funnelPage.clickDimensionCategoryField();
      funnelPage.clickChannelIdDimension();
      funnelPage.typeDimensionValue(0, createdChannelId);
      funnelPage.clickBtnExecuteQuery();
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
      funnelPage.stepInfo.eq(0).should('contain', '300');
      funnelPage.timeStart.within(() => {
        funnelPage.time.should('contain', getDate(0, -1, true));
      });
      funnelPage.timeEnd.within(() => {
        funnelPage.time.should('contain', getDate(0, 0, true));
      });
    });
  });

  it('should send the right request on custom datepicker', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.clickDateRange();
      funnelPage.typeDate(0, getDate(0, -3));
      funnelPage.typeDate(1, `${getDate(0, -2)}{enter}`);
      funnelPage.clickDimensionCategoryField();
      cy.reload();
      funnelPage.clickDimensionCategoryField();
      funnelPage.clickChannelIdDimension();
      funnelPage.typeDimensionValue(0, createdChannelId);
      funnelPage.clickBtnExecuteQuery();
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
      funnelPage.stepInfo.eq(0).should('contain', '400');
      funnelPage.timeStart.within(() => {
        funnelPage.time.should('contain', getDate(0, -3, true));
      });
      funnelPage.timeEnd.within(() => {
        funnelPage.time.should('contain', getDate(0, -2, true));
      });
    });
  });
});

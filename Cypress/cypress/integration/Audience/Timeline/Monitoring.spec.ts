describe('Timeline', () => {
  const second = 1000

  before(() => {
    // Login
    cy.login()

    cy.url({ timeout: 10 * second }).should(
      'contain',
      Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display'
    )
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName)

      // Go to Segment menu
      cy.contains('Audience').click()

      cy.contains('Monitoring').click()

      cy.contains(data.organisationName).click()

      cy.contains('User Lookup').click()

      cy.get('.ant-input').type('47d0e002-9ff5-42d9-b337-73a164a0fe37')

      cy.contains('Submit').click()
    })
  })

  beforeEach(() => {
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it.skip('Check the existence cards', () => {
    cy.get('.content-title').should(
      'have.text',
      '47d0e002-9ff5-42d9-b337-73a164a0fe37'
    )
    cy.get('.mcs-profileCard').should('be.visible')
    cy.get('.mcs-accountIdCard').should('be.visible')
    cy.get('.mcs-segmentCard').should('be.visible')
    cy.get('.mcs-deviceCard').should('be.visible')
    cy.get('.mcs-emailCard').should('be.visible')
    cy.get('.mcs-userChoicesCard').should('be.visible')
  })

  it.skip('Check the content profile card', () => {
    cy.get(
      '.mcs-profileCard > div:nth-child(2) > div > div:nth-child(2) > div > div.sub-title > div'
    ).should('have.text', 'user_id_0')

    cy.get(
      '.mcs-profileCard > div:nth-child(2) > div > div:nth-child(2) > div > div.custom-object-renderer > span > span > span'
    ).within(() => {
      cy.get('div:nth-child(1) > span > span > span').should(
        'have.text',
        'name 31'
      )
      cy.get('div:nth-child(2) > span > span > span').should(
        'have.text',
        '75008'
      )
      cy.get('div:nth-child(3) > span > span > span').should(
        'have.text',
        '75 rue d\'amsterdam'
      )
      cy.get('div:nth-child(4) > span > span > span').should(
        'have.text',
        'France'
      )
      cy.get('div:nth-child(5)').contains('2020-05-27, 01:10:24')
      cy.get('button > span').click()
      cy.get('div:nth-child(6) > span > span > span').should(
        'have.text',
        '1592'
      )
      cy.get('div:nth-child(7) > span > span > span').should(
        'have.text',
        'last name 31'
      )
      cy.get('div:nth-child(8)').contains('2020-05-27, 01:10:24')
    })
  })

  it.skip('Check the content of segment card', () => {
    cy.get('.mcs-segmentCard > div:nth-child(2) > div > span').should(
      'have.text',
      'AB partition (58/100)'
    )
  })

  it.skip('Check the content of user account id card', () => {
    cy.get('.mcs-accountIdCard > div:nth-child(2) > div > span > div').should(
      'have.text',
      'user_id_0'
    )
  })

  it.skip('Check timeline page with APP_VISIT activities', () => {
    cy.get(
      '#mcs-main-layout > div.ant-layout > div.ant-layout > div.ant-row-flex.ant-row-flex-space-between.ant-row-flex-middle.mcs-actionbar > div.left-part-margin > button'
    ).click()
    cy.get('.ant-select-selection').click()
    cy.get('.ant-select-dropdown-menu > .ant-select-dropdown-menu-item')
      .contains('User Account Id')
      .click()
    cy.get('.ant-input').clear()
    cy.get('.ant-input').type('user_id_2')
    cy.get('[style="width: 20%;"] > .ant-select-selection').click()
    cy.get('.ant-select-dropdown-menu-item')
      .contains('1592')
      .click()
    cy.get('.ant-modal-footer > .ant-btn-primary').click()
    cy.get('.mcs-activityCard > .mcs-card-header > .ant-col-24').contains(
      'App: ahpacbnw'
    )
    cy.get('.ant-col-19 > .section-title').contains('event name')
  })

  it.skip('Should display json source modal', () => {
    cy.get('.ant-timeline-item')
      .eq(1)
      .find('.mcs-card-inner-action')
      .first()
      .as('view_json_source')
    cy.get('@view_json_source')
      .should('have.text', 'View JSON source')
      .click()
    cy.get('.ant-modal-content').should('be.visible')
    cy.get('.ant-modal-confirm-title').should('have.text', 'Activity JSON')
    cy.get('.ant-modal-confirm-btns .ant-btn')
      .should('have.text', 'Close')
      .click()
    cy.get('.ant-modal-content').should('not.be.visible')
  })
})

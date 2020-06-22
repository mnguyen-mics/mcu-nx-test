before(()=>{
    cy.login()
})
beforeEach(() => {
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

it('should test the cleaning rules update form', () => {
    // Using readFile instead of fixtures because fixtures caches the file(this unwanted behavior was fixed on a more recent cypress version)
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.switchOrg(data.organisationName)
        cy.get('.mcs-options').click({force:true})
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`).click()
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click()
        // Add cleaning rule
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.get('.text-center').should('contain','for')
        // Using force true because we can get error notifications on a vagrant
        cy.get('button').contains('Save User Event Cleaning Rule').click({force:true})
        cy.contains('DRAFT').parent().parent().parent().should('contain','KEEP')
        cy.contains('DRAFT').parent().parent().parent().should('contain','1 day')
        cy.contains('DRAFT').parent().parent().parent().get('td').eq(3).should('contain','All')
        cy.contains('DRAFT').parent().parent().parent().get('td').eq(4).should('contain','All')
        cy.contains('DRAFT').parent().parent().parent().should('contain','No filter')
        cy.request(
            {
                url:`${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
                method: 'POST',
                headers: { Authorization: data.accessToken },
                body:{
                    'name': 'test',
                    'domain': 'test.com',
                    'enable_analytics': false,
                    'type': 'SITE'
                }
            }
        )
        .then((response)=>{
            const channelId:number=response.body.data.id
            cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click()
            cy.contains('View').click()
            // Update the cleaning rule
            cy.contains('KEEP').click()
            cy.contains('DELETE').click()
            cy.get('.text-center').should('contain','after')
            cy.get('.ant-input-number-input').type('999')
            cy.contains('All').click()
            cy.contains('APP_VISIT').click()
            cy.contains('No filter').click()
            cy.contains(`${channelId}`).click()
            cy.get('#eventNameFilter').type('test_1')
            cy.contains('Save User Event Cleaning Rule').click({force:true})
            // Check that the cleaning rule got updated
            cy.contains('DRAFT').parent().parent().parent().should('contain','DELETE')
            cy.contains('DRAFT').parent().parent().parent().should('contain','5 years, 5 months, 20 days')
            cy.contains('DRAFT').parent().parent().parent().should('contain',channelId)
            cy.contains('DRAFT').parent().parent().parent().should('contain','APP_VISIT')
            cy.contains('DRAFT').parent().parent().parent().should('contain','test_1')
        })
        })

    })

it('should test that only DRAFT cleaning rules can be deleted and updated',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.get('.mcs-options').click({force:true})
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`).click()
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click()
        cy.url().should('contain','datamart/cleaning_rules')
        // Add new cleaning rule
        cy.get('button').contains('New Cleaning Rule').click({force:true})
        cy.get('div.title').contains(`${data.datamartName}`).click()
        cy.get('#eventNameFilter').type('test_2')
        cy.get('button').contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.contains('test_1').parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','false')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','false')
        cy.contains('test_1').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').click()
        cy.contains('test_1').parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
        cy.contains('test_1').parent().parent().contains('Archive the rule').click()
        cy.contains('Confirm').click()
        cy.contains('test_1').parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
    })
})

it('should check that we can only have 3 different life durations for user event cleaning rules with content filters',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.get('.mcs-options').click({force:true})
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`).click()
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click()
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.get('input.ant-input-number-input').type('5')
        cy.get('#eventNameFilter').type('test_3')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.contains('15 day').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').click()
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.get('input.ant-input-number-input').type('1')
        cy.get('#eventNameFilter').type('test_3')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.contains('11 days').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').click()
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.get('input.ant-input-number-input').type('2')
        cy.get('#eventNameFilter').type('test_3')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.contains('12 days').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').click()
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.get('input.ant-input-number-input').type('3')
        cy.get('#eventNameFilter').type('test_3')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.contains('13 days').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').click()
        cy.get('span').should('contain','Maximum 3 different life durations can be used for USER_EVENT_CLEANING_RULE with content filters')
        // TODO add the case where we change the event name filter of the previously added cleaning rules
    })
})

// TODO add test that checks that we have to have at least one event cleaning rule with DELETE action
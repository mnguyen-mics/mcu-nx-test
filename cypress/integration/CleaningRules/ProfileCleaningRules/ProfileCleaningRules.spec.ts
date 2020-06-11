beforeEach( () =>{
    cy.initTestContext()
})

it('should test the profile cleaning rules forms',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.login()
        cy.switchOrg(data.organisationName)
        cy.get('.mcs-options').click({force:true})
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`).click()
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click()
        cy.contains('Profile Based Cleaning Rules').click()
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.contains('DELETE').parent().parent().parent().should('have.class','ant-select-disabled')
        cy.get('.text-center').should('contain','after')
        cy.get('button').contains('Save User Profile Cleaning Rule').click({force:true})
        cy.get('table').find('tbody>tr').should('have.length',1)
        cy.contains('DRAFT').parent().parent().parent().should('contain','DELETE')
        cy.contains('DRAFT').parent().parent().parent().should('contain','1 day')
        cy.contains('DRAFT').parent().parent().parent().should('contain','All')
        cy.request(
            {
                url:`${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
                method:'GET',
                headers: { Authorization: data.accessToken }
            }
        )
        .then((response)=>{
            const compartmentId:number=response.body.data[0].compartment_id
            cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click()
            cy.contains('View').click()
            // Update the cleaning rule
            cy.contains('DELETE').parent().parent().parent().should('have.class','ant-select-disabled')
            cy.get('.text-center').should('contain','after')
            cy.get('.ant-input-number-input').type('999')
            cy.contains('No filter').click()
            cy.contains(`${compartmentId}`).click()
            cy.get('button').contains('Save User Profile Cleaning Rule').click({force:true})
            cy.contains('DRAFT').parent().parent().parent().should('contain','DELETE')
            cy.contains('DRAFT').parent().parent().parent().should('contain','5 years, 5 months, 20 days')
            cy.contains('DRAFT').parent().parent().parent().should('contain',compartmentId)
            // Delete the compartment filter
            cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click()
            cy.contains('View').click()
            cy.contains('DELETE').parent().parent().parent().should('have.class','ant-select-disabled')
            cy.get('.text-center').should('contain','after')
            cy.contains(`${compartmentId}`).click()
            cy.contains('No filter').click()
            cy.get('button').contains('Save User Profile Cleaning Rule').click({force:true})
            cy.contains('DRAFT').parent().parent().parent().should('contain','DELETE')
            cy.contains('DRAFT').parent().parent().parent().should('contain','5 years, 5 months, 20 days')
            cy.contains('DRAFT').parent().parent().parent().should('contain','All')
            // Delete the rule
            cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click()
            cy.contains('Delete').click()
            cy.contains('Delete now').click()
            cy.get('table').find('tbody>tr').should('have.length',0)
        })
    })
})

it('should check that only draft profile cleaning rules can be updated',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.login()
        cy.switchOrg(data.organisationName)
        cy.get('.mcs-options').click({force:true})
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`).click()
        cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click()
        cy.contains('Profile Based Cleaning Rules').click()
        cy.contains('New Cleaning Rule').click({force:true})
        cy.contains(`${data.datamartName}`).click()
        cy.get('button').contains('Save User Profile Cleaning Rule').click({force:true})
        cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','false')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','false')
        cy.contains('Activate the rule').click()
        cy.contains('Confirm').click()
        cy.contains('LIVE').parent().parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
        cy.contains('Archive the rule').click()
        cy.contains('Confirm').click()
        cy.contains('LIVE').parent().parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
    })
})

// TODO add test for content filter behavior once it's defined with the PMS
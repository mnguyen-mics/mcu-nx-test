class LeftMenu {
  goToHomePage = () => {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.home').click();
  };
}

export default LeftMenu;

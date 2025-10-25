/**
 * Custom Cypress Commands
 */

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to sign up
       * @example cy.signup('user@example.com', 'password', 'John Doe', 'investor')
       */
      signup(email: string, password: string, fullName: string, role: 'investor' | 'advisor'): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('signup', (email: string, password: string, fullName: string, role: 'investor' | 'advisor') => {
  cy.visit('/signup')
  
  // Select role
  if (role === 'advisor') {
    cy.contains('Advisor').click()
  }
  
  // Fill form
  cy.get('input[name="fullName"]').type(fullName)
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  
  // Submit
  cy.get('button[type="submit"]').click()
})

export {}

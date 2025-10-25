/**
 * Authentication E2E Tests
 */

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display homepage', () => {
    cy.contains('Find Your Perfect').should('be.visible')
    cy.contains('Financial Advisor').should('be.visible')
  })

  it('should navigate to signup page', () => {
    cy.contains('Get Started as Investor').click()
    cy.url().should('include', '/signup')
    cy.contains('Join Fynly').should('be.visible')
  })

  it('should navigate to login page', () => {
    cy.visit('/login')
    cy.contains('Welcome Back').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
  })

  it('should show validation errors on empty form submission', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').click()
    
    // HTML5 validation will prevent submission
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('should allow role selection on signup', () => {
    cy.visit('/signup')
    
    // Default is investor
    cy.contains('Investor').parent().should('have.class', 'border-primary-600')
    
    // Switch to advisor
    cy.contains('Advisor').click()
    cy.contains('Advisor').parent().should('have.class', 'border-primary-600')
  })

  it('should require all fields for signup', () => {
    cy.visit('/signup')
    
    cy.get('input[name="fullName"]').should('be.visible')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    
    cy.get('button[type="submit"]').should('be.visible')
  })
})

describe('Protected Routes', () => {
  it('should redirect unauthenticated users to login', () => {
    cy.visit('/investor/dashboard')
    cy.url().should('include', '/login')
  })

  it('should redirect unauthenticated users from advisor dashboard', () => {
    cy.visit('/advisor/dashboard')
    cy.url().should('include', '/login')
  })

  it('should redirect unauthenticated users from admin dashboard', () => {
    cy.visit('/admin/dashboard')
    cy.url().should('include', '/login')
  })
})

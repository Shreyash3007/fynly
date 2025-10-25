/**
 * Cypress E2E Support File
 * Loaded before test files
 */

// Import commands
import './commands'

// Hide fetch/XHR requests in command log for cleaner output
const app = window.top

if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')
  app.document.head.appendChild(style)
}

// Preserve cookies between tests (Cypress 10+ uses cy.session)
// Cookies are now preserved by default
// For specific cookie handling, use cy.session() in individual tests

// Example: Set viewport for all tests
beforeEach(() => {
  cy.viewport(1280, 720)
})

export {}

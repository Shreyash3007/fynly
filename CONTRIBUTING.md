# Contributing to Fynly

Thank you for your interest in contributing to Fynly! This document provides guidelines and best practices for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone. Please be respectful and constructive in all interactions.

### Expected Behavior

- ✅ Use welcoming and inclusive language
- ✅ Be respectful of differing viewpoints
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards other contributors

### Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Trolling or insulting comments
- ❌ Public or private harassment
- ❌ Publishing others' private information
- ❌ Other unprofessional conduct

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fynly.git
   cd fynly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   supabase db reset
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## 💻 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions or updates
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Unit tests
npm run test

# E2E tests (if applicable)
npm run test:e2e
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add advisor search filters"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 📝 Coding Standards

### TypeScript

- **Strict mode enabled** - No `any` types
- **Explicit return types** for functions
- **Proper interfaces** for all data structures

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  role: UserRole
}

function getUser(id: string): Promise<User | null> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- **Functional components** with TypeScript
- **Props interfaces** explicitly defined
- **Client/Server components** clearly marked

```typescript
// ✅ Good
'use client'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={`btn btn-${variant}`}>{label}</button>
}

// ❌ Bad
export function Button(props: any) {
  return <button>{props.label}</button>
}
```

### File Organization

- **Colocation** - Keep related files together
- **Index files** for cleaner imports
- **Naming conventions:**
  - Components: `PascalCase.tsx`
  - Utilities: `camelCase.ts`
  - Types: `types.ts` or `index.d.ts`

### CSS/Tailwind

- **Utility-first** with Tailwind CSS
- **Custom classes** in `globals.css` for reusable patterns
- **Responsive design** with mobile-first approach

```tsx
// ✅ Good
<div className="card card-hover">
  <h2 className="font-display text-2xl font-bold">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// ❌ Bad - inline styles
<div style={{ padding: '20px', borderRadius: '8px' }}>
  <h2 style={{ fontSize: '24px' }}>Title</h2>
</div>
```

---

## 🧪 Testing Requirements

### Unit Tests

- **Coverage target:** 80% minimum
- **Test location:** `tests/unit/`
- **Naming:** `*.test.ts` or `*.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals'
import { calculateBayesianRating } from '@/lib/utils/ratings'

describe('calculateBayesianRating', () => {
  it('should calculate weighted average correctly', () => {
    const result = calculateBayesianRating(4.5, 10, 3.5, 5)
    expect(result).toBeCloseTo(4.17, 2)
  })
})
```

### E2E Tests

- **Coverage:** Critical user flows
- **Test location:** `tests/e2e/`
- **Naming:** `*.cy.ts`

```typescript
describe('Booking Flow', () => {
  it('should complete booking with payment', () => {
    cy.login('investor@test.com', 'password')
    cy.visit('/advisors')
    cy.contains('Book Now').first().click()
    // ... test steps
  })
})
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test -- --coverage

# E2E tests
npm run test:e2e
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Linting and type checking pass
- [ ] Documentation updated if needed
- [ ] No new warnings or errors
- [ ] Self-review completed

### PR Template

When creating a PR, use the provided template:

```markdown
## Description
Clear description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe test coverage

## Screenshots (if applicable)
Add relevant screenshots
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Feedback addressed** and changes made
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

### After Merge

- Your branch will be automatically deleted
- Changes will be deployed in next release
- You'll be credited in release notes

---

## 💬 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Test additions or updates
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

### Examples

```bash
# Feature
feat(advisor): add expertise filter to search

# Bug fix
fix(payment): resolve webhook race condition

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(auth)!: migrate to Supabase v2 auth

BREAKING CHANGE: Auth API has changed
```

### Scope (Optional)

Common scopes:
- `auth` - Authentication
- `advisor` - Advisor features
- `investor` - Investor features
- `admin` - Admin panel
- `payment` - Payment processing
- `video` - Video functionality
- `ui` - UI components

---

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Update to latest version
3. Try to reproduce consistently

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 18.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Before Requesting

1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation approach

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution**
How you envision the feature

**Describe alternatives**
Other solutions you've considered

**Additional context**
Mockups, examples, etc.
```

---

## 🎯 Areas Needing Help

We're especially looking for contributions in:

- 🎨 **UI/UX improvements**
- 📝 **Documentation**
- 🧪 **Test coverage**
- 🌐 **Internationalization**
- ♿ **Accessibility**
- 🚀 **Performance optimization**

---

## 📞 Questions?

- **Slack:** [Join our community](https://fynly.slack.com)
- **Email:** dev@fynly.com
- **GitHub Discussions:** [Start a discussion](https://github.com/your-org/fynly/discussions)

---

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Thank you for helping make Fynly better!

---

**Happy Coding! 🚀**


# Goal

- Accurately implement given requirements
- Write practical and maintainable frontend code
- Avoid unnecessary abstraction or over-engineering
- Maintain production-ready quality

---

# Core Principles

1. Requirements First
- Do not add features beyond the requested scope
- Avoid speculative implementations

2. Simplicity First
- Prefer straightforward implementations
- Avoid unnecessary patterns, layers, or abstractions

3. Implement Only What Is Needed
- Do not over-design for hypothetical future expansion
- Keep architecture flexible but lightweight

4. Readability First
- Use clear naming and predictable flow
- Prioritize maintainability over cleverness

5. Practical Component Design
- Reference SRP, but prioritize cohesion and maintainability
- Avoid excessive component splitting
- Keep related logic close when reasonable

6. Stability & UX
- Handle loading, error, and empty states
- Prevent obvious runtime failures
- Ensure reasonable fallback behavior

7. Explain Before Executing
- Before creating/modifying files or executing commands:
  - explain intent and purpose
  - describe affected files/components
  - provide relevant code context first

---

# Frontend Rules

## React Rules
- Use React 19 features when appropriate
- Prefer functional components and hooks
- Avoid class components
- Keep render logic simple and readable

## Component Rules
- Components should primarily focus on UI rendering
- Extract reusable business logic into hooks/services
- Avoid oversized components when possible
- Do not split components excessively without clear benefit

## State Management
- Prefer local state first
- Use Context only for:
  - authentication
  - theme
  - global UI state

Avoid unnecessary global state.

## Data Fetching
- API calls must exist only in service modules
- Components must never directly call Axios/fetch
- Async orchestration should be handled in hooks when appropriate

## Routing
- Use React Router 7 conventions
- Protect authenticated routes appropriately
- Keep route structure predictable and maintainable

## Styling Rules
- Use Tailwind CSS v4 utilities directly
- Avoid excessive custom CSS
- Prefer composition over deeply nested utility chains
- Maintain responsive mobile-first layouts

## UI/UX Rules
Every async UI must provide:
- loading state
- error state
- empty state (when applicable)

User-triggered async actions should provide feedback:
- toast
- inline feedback
- modal feedback

## Performance
- Prevent unnecessary re-renders
- Memoize only when beneficial
- Avoid premature optimization

---

# Directory Rules

## components/
Reusable UI components only.

## pages/
Route-level page composition.

## hooks/
Reusable business logic and side effects.

## services/
API communication layer.

## context/
Global shared state only.

## utils/
Pure utility/helper functions.

## types/
Shared interfaces and types.

---

# API Rules

- Use centralized API service modules
- Keep API contracts consistent with backend DTOs
- Normalize API errors before UI handling
- Never expose raw server errors directly to users

## Authentication
- JWT-based authentication
- Access token stored according to project requirements
- Inject auth headers through Axios interceptors

---

# Work Process

## 1. Requirement Summary
- Briefly summarize only the core requirements

## 2. Design
- List required components/hooks/services
- Explain responsibility and data flow simply

## 3. Code Implementation
- Write executable and practical code
- Avoid unnecessary abstraction/refactoring
- Keep implementation understandable

## 4. Self Verification (Required)
Check for:
- logical issues
- missing edge cases
- maintainability concerns
- unnecessary complexity
- performance issues
- security concerns
- responsive/mobile UX issues

Review once more before modifying code.

---

# Output Format

1. Requirement Summary
2. Design
3. Code
4. Verification Result
   - issues
   - acceptable parts
   - improvements needed (if any)
5. Implementation Notes
  - Briefly explain the overall code flow and key implementation decisions
  - Explain important or non-obvious parts when necessary
  - Focus on practical understanding rather than detailed theory
  - Keep explanations concise and relevant
---

# Anti-Patterns

Avoid:
- excessive refactoring
- unnecessary abstraction
- over-engineering
- massive global state
- direct API calls inside components
- deeply nested component trees
- business logic directly inside JSX
- premature optimization
- adding libraries without clear necessity

---

# Final Standard

Always evaluate:

- Is this production-usable?
- Is this easy to understand?
- Is this appropriately simple?
- Is the structure maintainable?
- Does the UX remain stable and predictable?

Maintain these standards consistently.
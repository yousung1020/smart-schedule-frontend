# Goal

- Implement requirements accurately
- Write practical, maintainable, production-ready backend code
- Avoid unnecessary abstraction, refactoring, or over-engineering

---

# Core Principles

1. Requirements First
- Do not add features beyond the requested scope
- Avoid speculative implementations

2. Simplicity & Maintainability
- Prefer simple and practical solutions
- Avoid excessive patterns, layers, and abstractions
- Prioritize readability over cleverness
- Keep responsibilities cohesive and practical

3. Consistency First
- Follow existing project patterns and conventions
- Reuse established structures when possible
- Maintain architectural consistency

4. Stability & Reliability
- Handle null, exception, and failure cases properly
- Prevent obvious runtime risks
- Ensure predictable application behavior

5. Standard & Current Practices
- Prefer well-established Spring/JPA patterns
- Use web search when necessary to verify:
  - framework conventions
  - library usage
  - deprecated APIs
  - security/performance best practices

6. Explain Before Executing
- Before modifying files or running commands:
  - explain intent and purpose
  - describe affected files/components
  - provide relevant code context when necessary

---

# Backend Rules

## Architecture
- Maintain Controller -> Service -> Repository flow
- Keep business logic inside the Service layer
- Avoid unnecessary layer separation

## Transactions
- Use transactions only where necessary
- Prefer method-level transactions
- Keep transaction scope minimal and explicit

## JPA & Database
- Be careful about:
  - N+1 problems
  - unnecessary queries
  - inefficient fetching
  - improper lazy loading usage
- Use fetch strategies intentionally
- Avoid unnecessary DTO/Mapper separation

## Exception Handling
- Handle exceptions consistently
- Prefer unchecked exceptions
- Prefer Optional or explicit exceptions over returning null
- Never expose internal errors directly to clients

## Security
- Validate authentication and authorization flow carefully
- Avoid trusting client-side data blindly
- Handle sensitive data safely

## API Design
- Keep request/response structures predictable
- Maintain consistency with existing API conventions
- Validate incoming requests properly

## Performance
- Avoid premature optimization
- Prevent obvious bottlenecks
- Optimize only when there is clear value

---

# Recommended Structure

```txt
src/
 ├── controller/
 ├── service/
 ├── repository/
 ├── domain/
 ├── dto/
 ├── config/
 ├── exception/
 ├── security/
 └── util/
```

---

# Work Process

## 1. Requirement Summary
- Summarize core requirements briefly

## 2. Design
- List required classes/services/components
- Explain responsibilities and data flow briefly

## 3. Code Implementation
- Write executable and understandable code
- Avoid unnecessary abstraction or refactoring

## 4. Self Verification
Check for:
- logical issues
- missing edge cases
- maintainability concerns
- performance issues
- security risks
- transaction or query issues

Review once more before finalizing code.

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
   - explain overall flow and key decisions briefly
   - explain important or non-obvious parts when necessary
   - keep explanations concise and practical

---

# Anti-Patterns
Avoid:
- excessive refactoring
- unnecessary abstraction
- over-engineering
- unnecessary DTO/Mapper splitting
- business logic inside controllers
- overly complex query structures
- premature optimization
- adding libraries without clear necessity

---

# Final Standard

Always ensure:
- production usability
- readability
- practical simplicity
- maintainable structure
- stable and predictable behavior
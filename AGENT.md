# AGENT.md

## 1. Role

- You are the lead software engineer for Project EDEN.
- Build production-quality code.
- Think like a senior engineer, not a code generator.
- Every implementation must follow PROJECT.md.

---

## 2. Goal

Your objective is to build EDEN into an Artificial Society Engine.

Never optimize for speed of coding.
Always optimize for correctness, maintainability, and long-term scalability.

---

## 3. Development Priority

Always prioritize in this order:

1. PROJECT.md
2. PRD.md
3. Architecture consistency
4. Correctness
5. Simplicity
6. Performance
7. New Features

If a request conflicts with PROJECT.md, stop and ask for clarification.

---

## 4. General Rules

- Never assume requirements.
- Never invent systems outside the PRD.
- Ask if requirements are ambiguous.
- Prefer modular architecture.
- Avoid coupling.
- Everything must be extensible.

---

## 5. Coding Rules

- Clean Architecture
- SOLID
- DRY
- KISS
- YAGNI
- Strong typing
- Modular components
- Small functions
- Self-documenting code

---

## 6. Documentation Rules

If implementation changes:

- Update documentation.
- Keep docs synchronized.
- Never leave outdated documentation.

Documentation is part of the feature.

---

## 7. Git Rules

Every maximum three logical changes:

1. Verify project builds.
2. Update documentation.
3. Commit.
4. Push.

Never accumulate large uncommitted changes.

Branch naming:

feature/*
fix/*
refactor/*
docs/*

Commit message:

feat:
fix:
refactor:
docs:
test:
chore:

---

## 8. Testing Rules

Every feature must include:

- Unit Test
- Integration Test (if needed)

Never merge broken code.

---

## 9. Refactoring Rules

Refactor only if:

- Reduces complexity
- Improves readability
- Removes duplication
- Improves scalability

Never refactor unrelated code.

---

## 10. Forbidden

Never:

- Hardcode logic
- Create scripted events
- Fake emergence
- Ignore PROJECT.md
- Ignore PRD
- Skip tests
- Duplicate code
- Introduce technical debt knowingly
- Remove documentation

---

## 11. Decision Framework

Before implementing:

PROJECT.md

↓

PRD.md

↓

Architecture

↓

Development

↓

Implement

If any layer conflicts,
STOP.

---

## 12. Before Commit Checklist

□ Build passes

□ Tests pass

□ Lint passes

□ Documentation updated

□ No duplicated code

□ Naming consistent

□ Commit created

□ Push completed

---

## 13. Code Quality Standard

Every code must be:

- Readable
- Testable
- Maintainable
- Scalable
- Reusable

Optimize for humans first.

---

## 14. Communication

When reporting progress:

- What changed
- Why
- Files modified
- Risks
- Next task

Never give unnecessary explanations.

---

## 15. Definition of Done

A task is complete only if:

✓ Feature implemented

✓ Tests passed

✓ Documentation updated

✓ Build successful

✓ Commit created

✓ Push completed

Otherwise, the task is NOT complete.

# AI Agent Principle

Build EDEN as if it will be maintained for the next 10 years.

Never choose the easiest solution.

Choose the solution that keeps the architecture clean, scalable, and consistent with the vision of EDEN.
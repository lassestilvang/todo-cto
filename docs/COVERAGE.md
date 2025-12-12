# Test Coverage Guide

This document explains the test coverage setup for the FocusFlow project.

## Overview

The project uses **Bun Test** for running tests with built-in coverage reporting capabilities. We've achieved **100% code coverage** for both functions and lines across our core utility modules.

## Coverage Commands

### Basic Coverage Report
```bash
bun test:coverage
```
This generates a text summary and LCOV file for CI integration.

### Detailed HTML Coverage Report
```bash
bun test:coverage:open
```
This generates an HTML coverage report that you can open in your browser for detailed line-by-line analysis.

### Watch Mode with Coverage
```bash
bun test --coverage --watch
```
Run tests in watch mode with coverage reporting.

## Coverage Configuration

### Package.json Scripts
- `bun test` - Run tests without coverage
- `bun test:coverage` - Run tests with text and LCOV coverage reports
- `bun test:coverage:open` - Run tests with text and HTML coverage reports

### Coverage Reports Location
- **Text output**: Displayed in terminal
- **LCOV file**: `coverage/lcov.info` (for CI integration)
- **HTML report**: `coverage/html/index.html` (for detailed analysis)

## CI Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Test Job**: Runs tests with coverage and uploads LCOV to Codecov
2. **Lint Job**: Runs ESLint checks
3. **Coverage Upload**: Automatically uploads coverage data to Codecov.io

### Required GitHub Secrets
For the CI workflow to upload coverage to Codecov:
1. Add `CODECOV_TOKEN` to your GitHub repository secrets
2. The token can be obtained from [Codecov.io](https://codecov.io/)

## Coverage Badge

The README includes a Codecov badge that automatically updates:
```markdown
[![codecov](https://codecov.io/gh/Inskape/forge/branch/main/graph/badge.svg)](https://codecov.io/gh/Inskape/forge)
```

**Note**: Update the repository path (`Inskape/forge`) to match your actual repository.

## Current Coverage Status

- **Functions**: 100.00% (7/7 functions covered)
- **Lines**: 100.00% (32/32 lines covered)
- **Test Files**: 3 test files
- **Total Tests**: 26 tests passing

### Covered Modules
- `lib/utils.ts` - Utility functions (100% coverage)
- `lib/hooks/useSearch.ts` - Search functionality (100% coverage)
- `test/setup.ts` - Test setup (100% coverage)

## Adding New Tests

When adding new functionality:

1. Write tests first (TDD approach recommended)
2. Ensure all new code paths are covered
3. Run `bun test:coverage` to verify coverage
4. Check HTML report: `bun test:coverage:open`

### Test Structure
```typescript
import { describe, expect, test } from "bun:test";
import { yourFunction } from "@/lib/your-module";

describe("your module", () => {
  test("should work correctly", () => {
    // Test implementation
  });
});
```

## Coverage Thresholds

While we currently have 100% coverage, consider setting minimum thresholds for future development:
- **Functions**: 90% minimum
- **Lines**: 90% minimum

You can configure these in your CI workflow or add them as npm scripts.

## Troubleshooting

### Coverage Not Generating
1. Ensure Bun is up to date: `bun --version`
2. Check that test files are in `__tests__/` directory
3. Verify imports in test files are correct

### Low Coverage
1. Review uncovered lines in the HTML report
2. Add tests for edge cases and error conditions
3. Consider simplifying complex functions to improve testability

### CI Coverage Upload Fails
1. Verify `CODECOV_TOKEN` is set in GitHub secrets
2. Check that the repository path in the badge matches your actual repo
3. Ensure LCOV file is being generated in the coverage directory
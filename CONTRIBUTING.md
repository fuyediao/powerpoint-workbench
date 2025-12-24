# Contributing to Gemini PPT Workbench

Thank you for your interest in contributing to Gemini PPT Workbench! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/powerpoint-workbench.git
   cd powerpoint-workbench
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/powerpoint-workbench.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

If you need to use Google Gemini API, create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

For local AI development:
- Ensure Ollama is running on `http://localhost:11434`
- Ensure ComfyUI is running on `http://localhost:8188`

### 3. Start Development Server

**Web Application Mode:**
```bash
npm run dev
```

**Electron Desktop Application Mode:**
```bash
npm run electron:dev
```

The application will be available at `http://localhost:5173`.

## Code Standards

### TypeScript Guidelines

1. **No `any` Types**: All code must have proper type definitions. Using `any` is strictly prohibited.

   ```typescript
   // ❌ Wrong
   const data: any = fetchData();

   // ✅ Correct
   const data: SlideData[] = fetchData();
   ```

2. **Type Definitions**: Define types in `src/types/index.ts` for shared interfaces and enums.

3. **Strict Mode**: TypeScript strict mode is enabled. All code must pass type checking.

### Naming Conventions

- **Variables and Functions**: Use `camelCase`
  ```typescript
  const slideData: SlideData = {...};
  const apiKey: string = "...";
  ```

- **Components**: Use PascalCase for Vue components
  ```typescript
  // File: SlidePreview.vue
  export default defineComponent({
    name: 'SlidePreview'
  })
  ```

- **Constants**: Use `UPPER_SNAKE_CASE` for constants
  ```typescript
  const MAX_SLIDES = 50;
  ```

### SOLID Principles

Follow SOLID principles in your code:

- **Single Responsibility Principle (SRP)**: Each class/function should have one reason to change
- **Open-Closed Principle (OCP)**: Open for extension, closed for modification
- **Liskov Substitution Principle (LSP)**: Derived classes must be substitutable for their base classes
- **Interface Segregation Principle (ISP)**: Clients should not depend on interfaces they don't use
- **Dependency Inversion Principle (DIP)**: Depend on abstractions, not concretions

### Code Quality

1. **ESLint**: All code must pass ESLint checks (ESLint 9.15)
   ```bash
   npm run lint
   ```

2. **Auto-fix Issues**: Use the auto-fix command when possible
   ```bash
   npm run lint:fix
   ```

3. **Stylelint**: CSS and Vue styles must pass Stylelint checks
   ```bash
   npm run lint:style
   ```

4. **Type Checking**: Run TypeScript type checking
   ```bash
   npx tsc --noEmit
   ```

### File Organization

- **Components**: Place reusable components in `src/components/`
- **Pages**: Place page-level components in `src/pages/`
- **Services**: Place business logic in `src/services/`
- **Composables**: Place Vue composables in `src/composables/`
- **Types**: Place TypeScript types in `src/types/`
- **Utils**: Place utility functions in `src/utils/`

## Project Structure

```
powerpoint-workbench/
├── electron/              # Electron desktop application
├── src/                   # Source code
│   ├── components/        # Reusable Vue components
│   ├── composables/       # Vue composables
│   ├── i18n/              # Internationalization
│   ├── pages/             # Page components
│   ├── services/          # Business logic
│   ├── stores/            # Pinia state management
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── scripts/               # Build scripts
└── dist/                  # Build output
```

## Making Changes

### 1. Create a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the code standards outlined above
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

- Test in both web and Electron modes
- Verify ESLint and Stylelint pass
- Check TypeScript compilation
- Test in different browsers (if applicable)

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add dark mode toggle button"
```

Commit message format (following [Conventional Commits](https://www.conventionalcommits.org/)):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

## Submitting Pull Requests

### Before Submitting

Ensure your PR meets these requirements:

1. ✅ Code passes ESLint checks (`npm run lint`)
2. ✅ Styles pass Stylelint checks (`npm run lint:style`)
3. ✅ All type definitions are correct, no `any` types
4. ✅ Follows project code standards (camelCase naming, SOLID principles)
5. ✅ Includes necessary comments and documentation
6. ✅ Updates relevant internationalization translation files (if UI changes)
7. ✅ Branch is up to date with `main`

### PR Process

1. **Update Your Branch**: Sync with upstream before submitting
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create Pull Request**:
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description**: Include:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots (if UI changes)

4. **Review Process**:
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Keep your branch updated during review

## Internationalization

### Adding Translations

When adding new UI elements, you must add translations for all supported languages:

1. **Supported Languages**:
   - `en` - English
   - `zh-CN` - Simplified Chinese
   - `zh-TW` - Traditional Chinese

2. **Translation Files**: Located in `src/i18n/locales/`
   - `en.json` - English
   - `zh-CN.json` - Simplified Chinese
   - `zh-TW.json` - Traditional Chinese

3. **Using Translations**:
   ```typescript
   import { useI18n } from '@/composables/useI18n'
   
   const { t } = useI18n()
   const message = t('app.title')
   ```

4. **Translation Key Format**: Use nested keys with dot notation
   ```json
   {
     "app": {
       "title": "Gemini PPT Workbench"
     }
   }
   ```

5. **Adding New Languages**: See [README.md](README.md#adding-new-languages) for detailed instructions.

### i18n Ally Plugin

The project uses the i18n Ally plugin for VS Code/Cursor. Install it for better translation management:

1. Open extensions panel (`Ctrl+Shift+X`)
2. Search for "i18n Ally"
3. Install and reload

Features:
- Hover preview of translations
- Inline editing
- Missing key detection
- Usage tracking

## Testing

### Manual Testing

Before submitting, test your changes:

1. **Web Mode**: `npm run dev`
2. **Electron Mode**: `npm run electron:dev`
3. **Build Test**: `npm run build` and `npm run electron:build`
4. **Lint Test**: `npm run lint` and `npm run lint:style`

### Testing Checklist

- [ ] Code compiles without errors
- [ ] ESLint passes with no errors
- [ ] Stylelint passes with no errors
- [ ] TypeScript type checking passes
- [ ] Feature works in web mode
- [ ] Feature works in Electron mode
- [ ] Translations are added for all languages
- [ ] Dark mode works correctly (if UI changes)
- [ ] No console errors or warnings

## Documentation

### Code Comments

- Add JSDoc comments for public functions and classes
- Explain complex logic with inline comments
- Keep comments up to date with code changes

### Documentation Updates

When adding features, update:

1. **README.md**: Update relevant sections
2. **CHANGELOG.md**: Add entry for significant changes
3. **Type Definitions**: Update `src/types/index.ts` if needed

### Documentation Format

Follow existing documentation style:
- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI changes
- Keep formatting consistent

## Common Issues and Solutions

### Port Already in Use

If port 5173 is occupied:

**Windows:**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version (>= 18.0.0):
   ```bash
   node --version
   ```

3. Rebuild Electron:
   ```bash
   npm run rebuild
   ```

### Type Errors

1. Run type checking:
   ```bash
   npx tsc --noEmit
   ```

2. Check for missing type definitions
3. Ensure no `any` types are used

## Getting Help

If you need help:

1. Check existing [Issues](https://github.com/fuyediao/powerpoint-workbench/issues)
2. Search [Discussions](https://github.com/fuyediao/powerpoint-workbench/discussions)
3. Create a new Issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Gemini PPT Workbench! 🎉


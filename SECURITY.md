# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

We take the security of Gemini PPT Workbench seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisory**: Use the [GitHub Security Advisory](https://github.com/fuyediao/powerpoint-workbench/security/advisories/new) feature to report vulnerabilities privately.

2. **Email**: If you prefer, you can email security concerns directly to the project maintainers (contact information available in the repository).

### What to Include

When reporting a security vulnerability, please include:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s) related to the manifestation of the issue**
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Updates**: We will keep you informed of our progress every 7-14 days
- **Resolution**: We will work with you to understand and resolve the issue quickly

### Disclosure Policy

- We will work with you to understand and resolve the issue quickly
- We will not disclose the vulnerability publicly until a fix is available
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will notify you when the vulnerability is publicly disclosed

## Security Best Practices

### For Users

1. **API Key Security**:
   - Never share your API keys publicly
   - Use environment variables or secure storage for API keys
   - Rotate your API keys regularly
   - Do not commit API keys to version control

2. **Local Data Storage**:
   - In Electron mode, sensitive data is stored in a local SQLite database
   - The database is located in the application's user data directory
   - Ensure your system has proper file permissions set
   - Be cautious when sharing application data directories

3. **Network Security**:
   - Use HTTPS endpoints for API calls
   - Verify proxy endpoints before use
   - Be cautious when using custom proxy configurations

4. **File Uploads**:
   - Only upload files from trusted sources
   - Be aware that uploaded files are processed by AI services
   - Review file contents before uploading sensitive documents

### For Developers

1. **Dependency Management**:
   - Keep all dependencies up to date
   - Regularly review and update `package.json` dependencies
   - Use `npm audit` to check for known vulnerabilities:
     ```bash
     npm audit
     npm audit fix
     ```

2. **Code Security**:
   - Follow secure coding practices
   - Avoid using `eval()` or similar dangerous functions
   - Validate and sanitize all user inputs
   - Use parameterized queries for database operations

3. **Electron Security**:
   - Context isolation is enabled (see `electron/preload.ts`)
   - Node.js integration is disabled in the renderer process
   - Only necessary APIs are exposed through the preload script
   - Developer tools are disabled in production mode

4. **Environment Variables**:
   - Never commit `.env` files or API keys to version control
   - Use `.env.local` for local development (already in `.gitignore`)
   - Document required environment variables in README

## Known Security Considerations

### Electron Application

- **Context Isolation**: Enabled to prevent renderer process from accessing Node.js APIs directly
- **Node Integration**: Disabled in renderer process for security
- **Preload Script**: Used to safely expose only necessary APIs
- **Local Storage**: Sensitive data stored in SQLite database in user data directory

### Web Application

- **LocalStorage**: Used as fallback for configuration storage in web mode
- **API Keys**: Stored in browser localStorage (consider browser security implications)
- **CORS**: API calls are made directly from the browser

### Data Handling

- **API Keys**: Stored locally and never transmitted except to intended API endpoints
- **User Files**: Processed locally and sent to AI services as needed
- **No Backend**: This is a client-side application with no backend server storing user data

## Security Updates

Security updates will be released as new patch versions (e.g., 0.1.4 → 0.1.5). Critical security vulnerabilities will be addressed as quickly as possible.

## Security Checklist for Contributors

Before submitting a pull request, ensure:

- [ ] No hardcoded API keys or secrets
- [ ] All user inputs are validated and sanitized
- [ ] No use of `eval()` or similar dangerous functions
- [ ] Dependencies are up to date and free of known vulnerabilities
- [ ] Security-sensitive code follows Electron security best practices
- [ ] No sensitive data is logged or exposed in error messages

## Additional Resources

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Questions?

If you have questions about this security policy, please open a [GitHub Discussion](https://github.com/fuyediao/powerpoint-workbench/discussions) (for general questions) or use the security advisory feature (for security concerns).

---

**Thank you for helping keep Gemini PPT Workbench and our users safe!**


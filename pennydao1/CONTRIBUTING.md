# Contributing to PennyDAO

Thank you for your interest in contributing to PennyDAO! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/pennydao.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## 🏗️ Development Setup

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your UniSat API key to .env

# Start development server
npm run dev

# Run tests
npm test
\`\`\`

## 📝 Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 🧪 Testing

- Add tests for new features
- Ensure all tests pass before submitting PR
- Test both dry-run and live scenarios
- Validate with different proposal types

## 📋 Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit PR with clear description

## 🐛 Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

## 💡 Feature Requests

- Describe the feature clearly
- Explain the use case
- Consider implementation complexity
- Discuss with maintainers first

## 🔐 Security

Report security issues privately to security@pennydao.org

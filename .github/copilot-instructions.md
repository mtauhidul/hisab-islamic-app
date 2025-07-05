<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HisabDaily (حساب) - Islamic Web App

This is a privacy-first Islamic web application built with React, TypeScript, and Firebase.

## Development Guidelines

### Architecture

- Use React 18 with TypeScript for type safety
- Implement offline-first patterns with service workers
- Follow clean architecture principles
- Use Firebase Auth (username/password only) and Firestore
- Implement proper error boundaries and loading states

### UI/UX Standards

- Follow Islamic design principles with respectful color palette
- Use Arabic Naskh-style fonts for headings (Amiri)
- Maintain 100% accessibility compliance
- Support both light and dark modes
- Ensure mobile-first responsive design

### Code Quality

- Write JSDoc comments for all public functions
- Follow semantic commit conventions (feat:, fix:, chore:)
- Use TypeScript strict mode
- Implement proper error handling
- Write unit tests for utilities and components

### Firebase Integration

- Store minimal data: only {uid, date, count}
- Never store deed text or verdicts
- Use proper Firestore security rules
- Implement offline sync capabilities

### Performance

- Optimize for Lighthouse PWA score of 100
- Implement code splitting and lazy loading
- Use React.memo for expensive components
- Minimize bundle size with proper imports

### Islamic Considerations

- Respect Islamic principles in all UI text
- Use appropriate Arabic terminology
- Ensure content is appropriate for all ages
- Implement proper prayer time considerations

# Release Process

This project uses a manual release process.

## Steps to Release

1. **Update version in package.json**

2. **Build the package**
   ```bash
   npm run build
   ```
   
3. **Push changes and create GitHub release**
   ```bash
   git push
   git push --tags
   ```
   
4. **Create GitHub Release**
   - Go to GitHub repository
   - Click "Releases" → "Create a new release"
   - Select the version tag
   - Write release notes
   - Publish release

5. **Publish to npm**
   ```bash
   npm publish --access public
   ```

## Prerequisites

- Make sure you're logged into npm: `npm whoami`
- Make sure you have write access to the `@evermade/overflow-slider` package
- Make sure you're on the main branch with latest changes

## Notes

- The `npm version` command automatically updates package.json and creates a git tag
- Use `npm publish --dry-run` first if you want to test without actually publishing
- The package is public, so `--access public` ensures it's published correctly

That's it! Simple and reliable manual process.

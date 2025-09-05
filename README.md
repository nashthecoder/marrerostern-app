# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Local Development Sync

To pull and sync the latest changes from your local development environment:

### Using npm script (recommended):
```bash
npm run pull-local
```

### Using bash script directly:
```bash
./scripts/pull-local.sh
```

These commands will:
1. Check for uncommitted changes (and warn if any exist)
2. Fetch the latest changes from the remote repository
3. Pull changes to the current branch
4. Update dependencies if package.json has changed
5. Build the project to verify everything works correctly

**Note**: Make sure to commit or stash any local changes before running the pull command.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase Storage Uploads (Image Evidence)

- To allow travelers to upload images (e.g., damage photos) with incident reports, you must:
  1. Upload the image to Firebase Storage from the form.
  2. Save the download URL in Firestore (not the file object).

- **Firebase Storage Rules:**
  - On the Spark (free) plan, you cannot set custom storage rules. You must upgrade to Blaze (pay-as-you-go) to allow authenticated users to upload files:
    ```js
    service firebase.storage {
      match /b/{bucket}/o {
        match /{allPaths=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```
  - After upgrading, set these rules in the Firebase Console → Storage → Rules and click Publish.

- If you see CORS or permission errors when uploading, check your Storage rules and plan.

- The incident report form will upload the image and save the URL in Firestore automatically if rules and plan are correct.

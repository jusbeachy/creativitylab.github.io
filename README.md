# Creativity Lab

A minimalist, quirky daily creativity journal for a 10-minute routine:

1. Notice one interesting thing from your day.
2. Describe it in an exaggerated way.
3. Connect it to something unrelated.
4. Turn it into a tiny idea, image, sentence, joke, sketch, or question.

## Features

- Today entry form
- Save entries to browser localStorage
- History list view
- View, edit, and delete entries
- Search and sort history
- Export entries as JSON
- Spark generator for days when the brain is soup
- No backend, no build step, no dependencies

## GitHub Pages upload

1. Create a new GitHub repository.
2. Upload these files to the root of the repository:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.

GitHub will publish the site as a static website.

## Note on data storage

Entries are saved in the browser's localStorage. This means entries stay on the same device/browser unless exported. There is no cloud database.

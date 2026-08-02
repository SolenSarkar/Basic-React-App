# GitHub Pages Deployment - Task Tracker

## Steps
- [x] 1. Add `base: '/Basic-React-App/'` to `client/vite.config.js`
- [x] 2. Add `homepage`, `predeploy`, `deploy` scripts + `gh-pages` dep to `client/package.json`
- [x] 3. Make API base URL configurable via `VITE_API_URL` in `client/src/components/ItemList.jsx`
- [x] 4. Create `.github/workflows/deploy.yml` to build & publish to `gh-pages` branch
- [x] 5. Update `README.md` with GitHub Pages deployment instructions
- [x] 6. Verify: run client production build with new `base` setting


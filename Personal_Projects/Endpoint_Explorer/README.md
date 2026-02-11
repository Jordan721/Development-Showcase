# Endpoint Explorer

A lightweight API playground built right in the browser. Test endpoints, inspect responses, and debug APIs without leaving your tab.

## Features

- **HTTP Methods** — GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS, each color-coded for quick identification
- **Query Parameters** — Add key-value pairs with toggleable checkboxes to include or exclude them from the request
- **Custom Headers** — Pre-filled with Content-Type and Accept for JSON; add, remove, or toggle any header
- **Request Body** — Supports JSON, plain text, and form data for POST/PUT/PATCH requests
- **Authentication** — Bearer token, Basic Auth, and API Key options built in
- **Response Viewer** — Syntax-highlighted JSON with color-coded status badges, response time, and size
- **Response Headers** — View all returned headers in a sortable table
- **Request History** — Every request is saved to the sidebar and persisted in localStorage across sessions
- **Keyboard Shortcuts** — Press Enter in the URL bar to send; Tab inserts spaces in the body editor

## Files

| File | Description |
|------|-------------|
| `index.html` | Landing page with usage instructions |
| `app.html` | The API playground |
| `landing.css` | Styles for the landing page |
| `style.css` | Styles for the playground |
| `app.js` | All request handling, UI logic, and history management |
| `favicon.svg` | SVG favicon |

## Usage

1. Open `index.html` in a browser
2. Click **Launch Explorer** to open the playground
3. Select an HTTP method, enter a URL, and hit **Send**
4. Configure params, headers, body, or auth using the tabs below the URL bar
5. View the response body and headers in the response panel
6. Click any item in the history sidebar to reload a past request

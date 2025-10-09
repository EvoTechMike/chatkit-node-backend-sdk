# ChatKit Node.js SDK Documentation

This directory contains the documentation for the ChatKit Node.js SDK.

## Building and Viewing the Documentation

### Prerequisites

Install MkDocs and the Material theme:

```bash
pip install mkdocs mkdocs-material
```

### Serve Documentation Locally

From the `chatkit-node` directory, run:

```bash
# Using npm script
npm run docs:serve

# Or directly with mkdocs
mkdocs serve
```

This will start a local server at `http://127.0.0.1:8000` where you can browse the documentation.

### Build Static Documentation

To build static HTML files:

```bash
# Using npm script
npm run docs:build

# Or directly with mkdocs
mkdocs build
```

This will create a `site/` directory with static HTML files.

## Documentation Structure

- **index.md** - Home page
- **server.md** - Server integration guide with examples
- **actions.md** - Actions system documentation
- **widgets.md** - Widget components reference
- **assets/** - Logo and other assets
- **images/** - Favicon and images
- **stylesheets/** - Custom CSS

## Quick Start (Without Installing MkDocs)

If you just want to read the markdown files directly:

- [Home](index.md)
- [Server Integration](server.md)
- [Actions](actions.md)
- [Widgets](widgets.md)

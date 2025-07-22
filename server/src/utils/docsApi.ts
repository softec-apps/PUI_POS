export const docViewers = [
  {
    path: '/rapi',
    title: 'Rapi',
    html: `<!DOCTYPE html>
        <html>
        <head>
          <title>EMITTO API - RAPI</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        </head>
        <body>
            <rapi-doc
              spec-url="/api-json"
              layout="column"
              render-style="view"
              theme="light"
              allow-try="true"
              allow-server-selection="true"
              show-info="false"
              show-header="false"
              regular-font="Inter, -apple-system, sans-serif"
              mono-font="'SF Mono', monospace"
              fill-request-fields-with-example="true"
            >
            </rapi-doc>
          </div>
        </body>
        </html>`,
  },
  {
    path: '/openapi',
    title: 'OpenApi',
    html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>PUI POS - API</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <script
            id="api-reference"
            data-url="/api-json"
            ></script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>`,
  },
]

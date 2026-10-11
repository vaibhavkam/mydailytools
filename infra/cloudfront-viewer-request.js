// Source of truth for the CloudFront Function `mydailytool-rewrite`
// (viewer-request on distribution E2XXH01ZE4SICS, runtime cloudfront-js-2.0).
//
// Two jobs, in order:
//   1. 301 the JSON / XML / YAML tools that duplicated json-indent.com,
//      xml-indent.com and yaml-indent.com. Those URLs never got indexed here
//      (GSC: "Crawled - currently not indexed" on every one, 0 impressions for
//      56 days after the 2026-08-19 narrowing) while the -indent sites rank
//      for the same queries. The static site also ships a noindex meta-refresh
//      page for each slug (SLUG_REDIRECTS in lib/tools.ts), so the redirect
//      works even if this function is behind; this is the real 301.
//   2. Rewrite directory paths to index.html, which the private OAC origin
//      needs (ADR-006): `/foo/` and `/foo` (no extension) -> `/foo/index.html`.
//
// Deploy: see docs/INFRA.md "Updating the CloudFront Function".

var REDIRECTS = {
  '/tools/json-formatter': 'https://json-indent.com/',
  '/tools/json-diff': 'https://json-indent.com/diff.html',
  '/tools/json-to-xml': 'https://json-indent.com/converter.html',
  '/tools/json-to-yaml': 'https://json-indent.com/converter.html',
  '/tools/json-to-csv': 'https://json-indent.com/converter.html',
  '/tools/yaml-formatter': 'https://yaml-indent.com/',
  '/tools/yaml-to-json': 'https://yaml-indent.com/converter.html',
  '/tools/yaml-to-xml': 'https://yaml-indent.com/converter.html',
  '/tools/yaml-to-csv': 'https://yaml-indent.com/converter.html',
  '/tools/xml-formatter': 'https://xml-indent.com/',
  '/tools/xml-to-json': 'https://xml-indent.com/converter.html',
  '/tools/xml-to-yaml': 'https://xml-indent.com/converter.html',
  '/tools/xml-to-csv': 'https://xml-indent.com/converter.html'
};

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var key = uri.replace(/\/index\.html$/, '').replace(/\/+$/, '');
  var target = REDIRECTS[key];
  if (target) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: target },
        'cache-control': { value: 'public, max-age=86400' }
      }
    };
  }

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}

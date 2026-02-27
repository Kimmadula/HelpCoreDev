const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const purify = DOMPurify(window);
const html = '<p style="text-align: center;">Hello\tWorld</p>';
console.log(purify.sanitize(html));

import { imports } from '@shgysk8zer0/importmap';
import { addTrustedTypePolicy, addScriptSrc, addImageSrc, useDefaultCSP } from '@aegisjsproject/http-utils/csp.js';

addScriptSrc(
	'https://unpkg.com/@aegisjsproject/',
	'https://unpkg.com/@shgysk8zer0/',
);

addImageSrc('https://i.imgur.com/');

addTrustedTypePolicy('aegis-sanitizer#html');

export default {
	routes: {
		'/': '@aegisjsproject/dev-server',
		'/favicon.svg': '@aegisjsproject/dev-server/favicon',
	},
	open: true,
	requestPreprocessors: [
		'@aegisjsproject/http-utils/request-id.js',
	],
	responsePostprocessors: [
		'@aegisjsproject/http-utils/compression.js',
		'@aegisjsproject/http-utils/cors.js',
		useDefaultCSP(),
		(response, { request }) => {
			if (request.destination === 'document') {
				response.headers.append('Link', `<${imports['@shgysk8zer0/polyfills']}>; rel="preload"; as="script"; fetchpriority="high"; crossorigin="anonymous"; referrerpolicy="no-referrer"`);
			}
		},
	],
};

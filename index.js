var convert = require('./convert');
exports.handler = function (event, context) {
	'use strict';

	if (!event.key || !event.fromBucket || !event.toBucket) {
		console.error('check params:', event);
		return context.fail('One or more parameters missing');
	}

	const target = 'pdf';
	if (event.target) {
		target = event.target;
	} else {
		console.error('No target type given, defaulting to pdf');
	}
	convert(event.fromBucket, event.key, target, event.toBucket)
		.then(context.done, context.fail);
};

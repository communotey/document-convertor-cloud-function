/*global require, module, console */
var path = require('path'),
	fs = require('fs'),
	os = require('os'),
	pandoc = require('pandoc-aws-lambda-binary'),
	s3 = require('./s3-util');

/**
 * @param {string} fromBucket
 * @param {string} fileKey previous file
 * @param {string} target new format
 * @param {string} toBucket
 */
module.exports = function convert(fromBucket, fileKey, target, toBucket) {
	'use strict';
	var targetPath, sourcePath;
	console.log('converting', fromBucket, fileKey);
	return s3.download(fromBucket, fileKey).then(function (downloadedPath) {
		sourcePath = downloadedPath;
		const uuid = (Math.random() * 0xFFFFFF << 0).toString(16) + (Math.random() * 0xFFFFFF << 0).toString(16);
		targetPath = path.join(os.tmpdir(), uuid + target);
		return pandoc(sourcePath, targetPath);
	}).then(function () {
		var uploadKey = fileKey.replace(/^in/, 'out').replace(/\.[A-z0-9]+$/, target);
		console.log('got to upload', targetPath, sourcePath);
		return s3.upload(toBucket, uploadKey, targetPath);
	}).then(function () {
		console.log('deleting', targetPath, sourcePath);
		fs.unlinkSync(targetPath);
		fs.unlinkSync(sourcePath);
	});
};

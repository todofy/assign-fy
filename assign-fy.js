/**
 * Main source code to identify the potential assignees for a todo
 * based on line of code & the blame around the line of code
 * @returns: at max 'n' number of usernames who could be potential
 * assignees along with scores.
 */

'use strict';

// var githubAuthCookies = require('./githubAuthCookies');
var fs = require('fs');
var sprintf = require('sprintf').sprintf;
var config = require('./config');

// TODO: find an alternative to this module, as it is not
// scalable as per author of the module
var request = require('sync-request');

// Create a cache folder if not exists
if (!fs.existsSync(config.server.cachePath)){
    fs.mkdirSync(config.server.cachePath);
}

// function to syncronously download (or load from cache)
// the html for blame file, for a given repo
function downloadBlame(repo, branch, file, cachePath) {
	// Create a custom cache file path
	var cacheFilePath = sprintf(
		"%s/%s",
		cachePath,
		sprintf("%s_%s_%s", repo, branch, file).replace(/\//g, '.')
	);

	// check if the file exist in cache, for debugging purpose
	if (fs.existsSync(cacheFilePath)) {
		console.log('loading file from cache...');
		return (fs.readFileSync(cacheFilePath));
	}

	var url = sprintf("https://github.com/%s/blame/%s/%s", repo, branch, file);
	// download the HTML data
	var res = request('GET', url, {
		'headers': {
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) '
				+ 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
			'Connection' : 'keep-alive'
		}
	});

	// cache the HTML output
	console.log('caching the file...');	
	fs.writeFileSync(cacheFilePath, res.body.toString());

	// return the data
	return res.body.toString();
}

// Sync function to parse blame HTML data and return a 
// structured array data
function parseBlame(blameHTML) {
	var re = /(rel="(?:author|contributor)">([^<]+)<\/a> authored|<tr class="blame-line">)/g;
	var lines = [];
	var currentAuthor = null;
	var match;

	while (match = re.exec(blameHTML)) {
		if (match[2]) {
	      	currentAuthor = match[2];
	    } else {
	      	lines.push(currentAuthor);
	    }
	}

	return lines;
}

// function to return a dictionery with distict score
// for each user, from blameData.
// initial score for each user = 0;
function distinctUsers(users) {
	var dUsers = {};
	users.forEach(function(user, index) {
		if (typeof dUsers[user] == 'undefined') {
			dUsers[user] = 0;
		}
	});

	return dUsers;
}

// function to compute score for each user based on
// linear formula.
// TODO: check various versions of this formula
function computeScore(score, blameData, lineNo) {
	var M = 1;
	var C = 0;

	// from lineNo to zero.
	var t = lineNo;
	while (--t>= 0) {
		score[blameData[t]] += M / ((lineNo - t) + 1) + C;
	}

	t = lineNo;
	while (++t < blameData.length) {
		score[blameData[t]] += M / ((t - lineNo) + 1) + C;
	}

	var final = {};
	var sum = 0;
	Object.keys(score).forEach(function(user) {
		sum += score[user];
	});

	Object.keys(score).forEach(function(user) {
		final[user] = score[user] / sum;
	});

	return final;
}

// function to sort a @param: dict on value and
// return at max @param: max no of values
function sortAndCut(dict, max) {
	// this is needed to sort values as integers
	function sortNumber(a,b) {
	   return b - a;
	}

	// Create items array
	var items = Object.keys(dict).map(function(key) {
	    return [key, dict[key]];
	});

	// Sort the array based on the second element
	items.sort(function(first, second) {
	    return second[1] - first[1];
	});

	// Create a new array with only the first max items
	items = items.slice(0, max);
	var nDict = {};
	items.forEach(function(item, index) {
		nDict[item[0]] = item[1];
	});

	return nDict;
}

// function to find the potential assignee for a
// given repo, branch, file and lineNo
function findAssignees(repo, branch, file, lineNo) {
	// Download the blame file
	var blameHTML = downloadBlame(repo, branch, file, config.server.cachePath);

	// Parse the blame file
	var blameData = parseBlame(blameHTML);
	var maxLines = blameData.length;

	// Get the score for each distict user
	var score = distinctUsers(blameData);

	// Now score each user based on the blame data
	return sortAndCut(
		computeScore(score, blameData, lineNo),
		config.assignFy.maxAssignment
	);
}

module.exports = {
	findAssignees: findAssignees
};
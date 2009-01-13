var CORE = {
	asyncWhen : function asyncWhen(whenFn, execFn, timeout, timesLeft) {
		timeout = timeout || 500;
		timesLeft = timesLeft || 20;
		if (timesLeft === 0) {
			throw "this asychronous event never happened\n" + whenFn.toString();
		}
		if (whenFn()) {
			execFn();
		} else {
			setTimeout(function() {
						CORE.asyncWhen(whenFn, execFn, timeout, timesLeft - 1);
					}, timeout);
		}
	},
	getFunctionName : function getFunctionName(fn) {
		var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
		return m ? m[1] : "";
	},
	removeElementFromArray : function(array, element) {
		var ii = 0;
		for (; ii < array.length; ii += 1) {
			if (array[ii] == element) {
				break;
			}
		}
		array.splice(ii, 1);
	},
	convertJsonListToObject : function(list, ObjectConstructor) {
		var retList = [];
		for (var i = 0; i < list.length; i++) {
			retList.push(new ObjectConstructor(list[i]));
		}
		return retList;
	},
	logToBase : function(x, base) {
		// Created 1997 by Brian Risk. http://members.aol.com/brianrisk
		return (Math.log(x)) / (Math.log(base));
	},
	trackEvent : function(category, action, label, value) {
		this.asyncWhen(function() {
					return CORE.pageTracker !== undefined;
				}, function() {
					CORE.pageTracker
							._trackEvent(category, action, label, value);
				}, 1000);
	}
};

if (typeof Object.create !== 'function') {
	Object.create = function(o) {
		function F() {
		}
		F.prototype = o;
		return new F();
	};
}

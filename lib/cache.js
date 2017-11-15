class MemcachedAdapter {
	constructor(hosts) {
		const Memcached = require('memcached');
		this.memcached = new Memcached(hosts);
	}

	get(key, cb) {
		this.memcached.get(key, (err, result) => {
			cb(err, result ? result.data : null);
		});
	}

	upsert(key, data, cb) {
		this.memcached.get(key, (err, result) => {
			if (err) {
				return cb(err);
			}
			if (!result) {
				this.memcached.set(key, {data: data}, 0, (err) => {
					if (err) {
						return cb(err);
					}
					cb(null, true);
				});
			} else {
				cb(null, false);
			}
		});
	}
}

class NodeCacheAdapter {

	constructor() {
		this.nodecache = require('memory-cache');
		this.maximum_waittime = 2147483647; // no longer max wait time supported
	}

	get(key, cb) {
		let c = this.nodecache.get(key);
		cb(null, c ? c.data : null);
	}

	upsert(key, data, cb) {
		let c = this.nodecache.get(key);
		if (!c) {
			this.nodecache.put(key, {data: data}, this.maximum_waittime);
			cb(null, true);
		} else {
			cb(null, false);
		}
	}
}

class NullCacheAdapter {
	constructor() {
	}

	get(key, cb) {
		cb();
	}

	upsert(key, data, cb) {
		cb(null, false);
	}
}

module.exports.initCache = (options) => {
	if (options.type === 'memcached') {
		return new MemcachedAdapter(options.memcached);
	}
	if (options.type === 'internal') {
		return new NodeCacheAdapter();
	}
	return new NullCacheAdapter();
};
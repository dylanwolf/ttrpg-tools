import { isNumeric } from "./mathHelpers";

declare global {
	interface Array<T> {
		groupBy(keyFunc: (obj: T) => string): GroupByResult<T>[];
		any(predicate: (obj: T) => boolean): boolean;
		all(predicate: (obj: T) => boolean): boolean;
		distinct(): T[];
		first(predicate?: (obj: T) => boolean | undefined): T | undefined;
		last(predicate?: (obj: T) => boolean | undefined): T | undefined;
		orderBy<TKey>(sortFunc: (obj: T) => TKey): T[];
		sum(selectFunc?: (obj: T) => number | undefined): number | undefined;
	}
}

export interface GroupByResult<T> {
	key: string;
	items: T[];
}

export function registerArrayHelpers() {
	if (!Array.prototype.any) {
		Array.prototype.any = function any<T>(
			predicate: (obj: T) => boolean
		): boolean {
			for (var i = 0; i < this.length; i++) {
				if (predicate(this[i])) return true;
			}
			return false;
		};
	}

	if (!Array.prototype.all) {
		Array.prototype.all = function all<T>(
			predicate: (obj: T) => boolean
		): boolean {
			if (this.length === 0) return false;

			for (var i = 0; i < this.length; i++) {
				if (!predicate(this[i])) return false;
			}
			return true;
		};
	}

	if (!Array.prototype.distinct) {
		Array.prototype.distinct = function distinct<T>() {
			return this.reduce(function (prev: T[], cur: T) {
				return prev.includes(cur) ? prev : prev.concat(cur);
			}, []);
		};
	}

	if (!Array.prototype.first) {
		Array.prototype.first = function first<T>(
			predicate?: (obj: T) => boolean | undefined
		): T | undefined {
			if (predicate === undefined) return this[0] || undefined;
			for (var i = 0; i < this.length; i++) {
				if (predicate(this[i])) return this[i];
			}
			return undefined;
		};
	}

	if (!Array.prototype.last) {
		Array.prototype.last = function first<T>(
			predicate?: (obj: T) => boolean | undefined
		): T | undefined {
			if (predicate === undefined) return this[this.length - 1] || undefined;
			for (var i = this.length - 1; i >= 0; i--) {
				if (predicate(this[i])) return this[i];
			}
			return undefined;
		};
	}

	if (!Array.prototype.groupBy) {
		Array.prototype.groupBy = function groupBy<T>(
			keyFunc: (obj: T) => string
		): GroupByResult<T>[] {
			var result: GroupByResult<T>[] = [];
			var resultDict: { [key: string]: GroupByResult<T> } = {};

			this.forEach((itm) => {
				var key = keyFunc(itm);
				if (!resultDict[key]) {
					var r = { key: key, items: [] };
					result.push(r);
					resultDict[key] = r;
				}
				resultDict[key].items.push(itm);
			});

			return result;
		};
	}

	if (!Array.prototype.orderBy) {
		Array.prototype.orderBy = function orderBy<T, TKey>(
			sortFunc: (obj: T) => TKey
		): T[] {
			var clone = this.slice();
			clone.sort(function (us, them) {
				var usValue = sortFunc(us);
				var themValue = sortFunc(them);
				return usValue === themValue ? 0 : usValue > themValue ? 1 : -1;
			});
			return clone;
		};
	}

	if (!Array.prototype.sum) {
		Array.prototype.sum = function orderBy<T, TKey>(
			sortFunc?: (obj: T) => TKey | undefined
		): number | undefined {
			if (this.length === 0) return 0;

			var values = this.map((x) => (sortFunc ? sortFunc(x) : x));
			if (!values.any((x) => isNumeric(x))) return undefined;

			return values.reduce(
				(prev, cur) => prev + (isNumeric(cur) ? Number(cur) : 0),
				0
			);
		};
	}
}

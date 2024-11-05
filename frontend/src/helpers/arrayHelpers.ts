import { isNumeric } from "./mathHelpers";

declare global {
	interface Array<T> {
		/**
		 * Groups an array by the results of the given field.
		 * @param keyFunc The function that returns the key for grouping
		 */
		groupBy(keyFunc: (obj: T) => string): GroupByResult<T>[];

		/**
		 * Returns true if any item in the array returns true for the predicate function; otherwise, return false.
		 * @param predicate
		 */
		any(predicate: (obj: T) => boolean): boolean;

		/**
		 * Returns true if all items in the array return true for the predicate function; otherwise, return false.
		 * @param predicate
		 */
		all(predicate: (obj: T) => boolean): boolean;

		/**
		 * Returns an array of distict values from this array.
		 */
		distinct(): T[];

		/**
		 * Returns the first item in the array for which the predicate function is true.
		 * @param predicate
		 */
		first(predicate?: (obj: T) => boolean | undefined): T | undefined;

		/**
		 * Returns the last item in the array for which the predicate function is true.
		 * @param predicate
		 */
		last(predicate?: (obj: T) => boolean | undefined): T | undefined;

		/**
		 * Returns an array that is sorted by the results of the sorting function.
		 * @param sortFunc
		 */
		orderBy<TKey>(sortFunc: (obj: T) => TKey): T[];

		/**
		 * Returns the minimum value for the select function among items in the array.
		 * @param selectFunc
		 */
		min(selectFunc?: (obj: T) => any): T | undefined;

		/**
		 * Returns the maximum value for the select function among items in the array.
		 * @param selectFunc
		 */
		max(selectFunc?: (obj: T) => any): T | undefined;

		/**
		 * Returns the sum of all values of the select function across items in the array. Ignores items that return undefined.
		 * @param selectFunc
		 */
		sum(selectFunc?: (obj: T) => number | undefined): number | undefined;
	}
}

/**
 * Provides the esults of an Array.groupBy function.
 */
export interface GroupByResult<T> {
	key: string;
	items: T[];
}

/**
 * Adds the array helpers to the Array interface.
 */
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
		Array.prototype.sum = function <T>(
			selectFunc?: (obj: T) => number | undefined
		): number | undefined {
			if (this.length === 0) return 0;

			var values = this.map((x) => (selectFunc ? selectFunc(x) : x));
			if (!values.any((x) => isNumeric(x))) return undefined;

			return values.reduce(
				(prev, cur) => prev + (isNumeric(cur) ? Number(cur) : 0),
				0
			);
		};
	}

	if (!Array.prototype.min) {
		Array.prototype.min = function orderBy<T, TKey>(
			selectFunc?: (obj: T) => any
		): any | undefined {
			if (this.length === 0) return undefined;

			var resultObject: T | undefined = undefined;
			var resultValue: any = undefined;

			this.forEach((currentObject) => {
				var currentValue = selectFunc
					? selectFunc(currentObject)
					: currentObject;
				if (resultObject === undefined || resultValue > currentObject) {
					resultObject = currentObject;
					resultValue = currentValue;
				}
			});

			return resultObject;
		};
	}

	if (!Array.prototype.max) {
		Array.prototype.max = function orderBy<T, TKey>(
			selectFunc?: (obj: T) => any
		): any | undefined {
			if (this.length === 0) return undefined;

			var resultObject: T | undefined = undefined;
			var resultValue: any = undefined;

			this.forEach((currentObject) => {
				var currentValue = selectFunc
					? selectFunc(currentObject)
					: currentObject;
				if (resultObject === undefined || resultValue < currentObject) {
					resultObject = currentObject;
					resultValue = currentValue;
				}
			});

			return resultObject;
		};
	}
}

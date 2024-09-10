import { action, computed, makeObservable, observable } from "mobx";
import { StepControlProps, StepModel } from "../../models/StepModel";
import {
	DragAndDropBucket,
	DragAndDropLinkedState,
} from "react-drag-drop-assignment";
import { observer } from "mobx-react-lite";

interface BucketDefinition {
	Name: string;
	Locked?: boolean | undefined;
	MaxCount?: number | undefined;
}

class Bucket<TItem> {
	Name: string;
	Items: TItem[] = [];
	Locked: boolean;
	MaxCount: number | undefined;

	constructor(def: BucketDefinition) {
		this.Name = def.Name;
		this.Locked = def.Locked || false;
		this.MaxCount = def.MaxCount;
	}
}

class BucketCollection<TItem> {
	@observable.shallow ByIndex: Bucket<TItem>[] = [];
	@observable.shallow ByName: { [name: string]: Bucket<TItem> } = {};

	constructor() {
		makeObservable(this);
	}

	@action setBuckets(buckets: Bucket<TItem>[]) {
		this.ByIndex.splice(0, this.ByIndex.length);
		Object.keys(this.ByName).forEach((key) => {
			delete this.ByName[key];
		});

		buckets.forEach((bucket) => {
			this.ByIndex.push(bucket);
			this.ByName[bucket.Name] = bucket;
		});
	}
}

export class AssignItemsStepModel<TModel, TItem> extends StepModel<TModel> {
	Available: TItem[] = [];
	Buckets: BucketCollection<TItem> = new BucketCollection<TItem>();

	@observable Label: string;
	@observable.shallow _lastItemList: TItem[] = [];
	@observable.shallow _lastBucketList: BucketDefinition[] = [];

	@observable Values: { [name: string]: TItem[] } = {};
	DragAndDropState: DragAndDropLinkedState<TItem>;

	_itemListFunc: (model: TModel) => TItem[];
	_bucketsFunc: (model: TModel) => BucketDefinition[];
	_equalityFunc: (us: TItem, them: TItem) => boolean;
	_buildDefaultValue: (
		items: TItem[],
		oldValue: { [name: string]: TItem[] }
	) => { [name: string]: TItem[] };
	_itemRenderer: (item: TItem) => JSX.Element;

	constructor(
		name: string,
		label: string,
		itemListFunc: (model: TModel) => TItem[],
		bucketsFunc: (model: TModel) => BucketDefinition[],
		equalityFunc: (us: TItem, them: TItem) => boolean,
		buildDefaultValue: (
			items: TItem[],
			oldValue: { [name: string]: TItem[] }
		) => { [name: string]: TItem[] },
		itemRenderer: (item: TItem) => JSX.Element
	) {
		super(name);

		this.Label = label;

		this._itemListFunc = itemListFunc;
		this._bucketsFunc = bucketsFunc;
		this._itemRenderer = itemRenderer;
		this._equalityFunc = equalityFunc;
		this._buildDefaultValue = buildDefaultValue;

		this.DragAndDropState = new DragAndDropLinkedState<TItem>().addCallback(
			() => this.updateValues()
		);

		makeObservable(this);
	}

	@action.bound updateValues() {
		// Remove nonexistent buckets from values
		Object.keys(this.Values)
			.filter(
				(key) => this.Buckets.ByIndex.filter((b) => b.Name === key).length === 0
			)
			.forEach((key) => {
				delete this.Values[key];
			});

		// Update bucket values
		this.Buckets.ByIndex.forEach((b) => {
			this.Values[b.Name] = b.Items;
		});

		console.log(this.isCompleted);
		if (this.isCompleted)
			this.Container?.onStepProgression(this.Container.ByIndex.indexOf(this));
	}

	@computed get isCompleted(): boolean {
		return this.Available.length === 0 && this.Buckets.ByIndex.length > 0;
	}

	@action.bound resetState(buckets: BucketDefinition[], items: TItem[]) {
		// Clone available items list
		var available = [...items];

		// Clone values
		var defaultValue = this._buildDefaultValue(items, this.Values);

		// Clear the current available bucket
		this.Available.splice(0, this.Available.length);

		// Rebuild buckets, populating with items from the last value (if available)
		var newBuckets: Bucket<TItem>[] = [];
		buckets.forEach((b) => {
			var bucket = new Bucket<TItem>(b);

			(defaultValue[b.Name] || []).forEach((val) => {
				var match =
					available.filter((x) => this._equalityFunc(val, x))[0] || undefined;
				if (match) {
					bucket.Items.push(match);
					available.splice(available.indexOf(match), 1);
				}
			});

			newBuckets.push(bucket);
		});
		this.Buckets.setBuckets(newBuckets);

		// Rebuild available list
		available.forEach((i) => {
			this.Available.push(i);
		});

		this.updateValues();
	}

	@action.bound refresh(options: TModel, refreshingSelf: boolean): void {
		if (refreshingSelf) return;

		var itemList = this._itemListFunc(options);
		var buckets = this._bucketsFunc(options);

		this.resetState(buckets, itemList);
	}

	@action completed(options: TModel): void {}

	render(model: TModel, stepIdx: number): JSX.Element {
		return (
			<AssignItemsStepControl model={model} step={this} stepIndex={stepIdx} />
		);
	}
}

export const AssignItemsStepControl = observer(
	<TModel, TItem>(
		props: StepControlProps<TModel, AssignItemsStepModel<TModel, TItem>>
	) => {
		return (
			<div className={`step step-assignitems step-${props.step.Name}`}>
				<div className="buckets">
					{props.step.Buckets.ByIndex.map((b) => (
						<div
							className="bucket"
							key={`AssignItems-${props.step.Name}-${b.Name}`}
						>
							<div className="bucket-name">{b.Name}</div>
							<DragAndDropBucket
								dragState={props.step.DragAndDropState}
								items={b.Items}
								isLocked={() => b.Locked}
								maxCount={b.MaxCount}
								itemRenderer={props.step._itemRenderer}
							/>
						</div>
					))}
				</div>
				<div className="available">
					<DragAndDropBucket
						dragState={props.step.DragAndDropState}
						items={props.step.Available}
						itemRenderer={props.step._itemRenderer}
					/>
				</div>
			</div>
		);
	}
);

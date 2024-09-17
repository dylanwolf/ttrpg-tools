import { StepModel, StepState } from "../../models/StepModel";
import "./AssignItemsStep.css";

export interface BucketDefinition<TItem> {
	Name: string;
	Locked?: boolean | undefined;
	MaxCount?: number | undefined;
	FixedValues?: TItem[] | undefined;
}

export interface AssignItemsStepState<TItem> extends StepState {
	Available: TItem[];
	Value: { [name: string]: TItem[] } | undefined;
	Buckets: BucketDefinition<TItem>[];
}

interface DragState<TItem> {
	dragging?: TItem | undefined;
	draggingFromName?: string | null | undefined;
	draggingToName?: string | null | undefined;
}

function updateValue<TItem>(
	oldValue: { [name: string]: TItem[] },
	dragged: TItem,
	draggedFromName: string | null,
	draggedToName: string | null
) {
	var newValue: { [name: string]: TItem[] } = {};

	var addedTo = false;

	Object.keys(oldValue).forEach((name) => {
		var items = [...oldValue[name]];

		if (draggedFromName === name) {
			items.splice(items.indexOf(dragged), 1);
		}

		if (draggedToName === name) {
			items.push(dragged);
			addedTo = true;
		}

		newValue[name] = items;
	});

	if (!addedTo && draggedToName) newValue[draggedToName] = [dragged];

	return newValue;
}

function updateState<TItem>(
	newState: AssignItemsStepState<TItem>,
	equalityFunc: (us: TItem, them: TItem) => boolean,
	items: TItem[],
	buckets: BucketDefinition<TItem>[]
) {
	var remaining = [...items];
	var newValue: { [name: string]: TItem[] } = {};

	buckets.forEach((b) => {
		var selectedItems: TItem[] = [];
		var currentValue =
			b.FixedValues ||
			(newState && newState.Value && newState.Value[b.Name]) ||
			[];

		currentValue.forEach((v: TItem) => {
			var match = remaining.filter((x) => equalityFunc(x, v))[0];
			if (match) {
				remaining.splice(remaining.indexOf(match), 1);
				selectedItems.push(match);
			}
		});

		newValue[b.Name] = selectedItems;
	});

	newState.Available = remaining;
	newState.Buckets = buckets;
	newState.Value = newValue;
	newState.IsCompleted = remaining.length === 0;
	newState.IsVisible = true;
}

function isValidDrag<TItem>(item: TItem, isLocked: boolean, bucket: TItem[]) {
	return !isLocked && bucket.includes(item);
}

function isValidDrop<TItem>(
	item: TItem,
	isLocked: boolean,
	maxCount: number | undefined,
	bucket: TItem[]
) {
	return (
		!isLocked &&
		(maxCount === undefined || maxCount > bucket.length) &&
		!bucket.includes(item)
	);
}

export class AssignItemsStep<TSource, TData, TItem> extends StepModel<
	TSource,
	TData,
	AssignItemsStepState<TItem>
> {
	GetItemsList: (source: TSource, data: TData) => TItem[];
	ItemEquals: (us: TItem, them: TItem) => boolean;
	GetBuckets: (
		source: TSource,
		data: TData,
		lst: TItem[]
	) => BucketDefinition<TItem>[];
	GetDefaultValue: (
		source: TSource,
		data: TData,
		lst: TItem[]
	) => { [name: string]: TItem[] };
	RenderItem: (item: TItem) => JSX.Element;

	constructor(
		name: string,
		getItemsList: (source: TSource, data: TData) => TItem[],
		itemEqualsFunc: (us: TItem, them: TItem) => boolean,
		getBuckets: (
			source: TSource,
			data: TData,
			lst: TItem[]
		) => BucketDefinition<TItem>[],
		getDefaultValue: (
			source: TSource,
			data: TData,
			lst: TItem[]
		) => { [name: string]: TItem[] },
		renderItem: (item: TItem) => JSX.Element,
		updateCharacter: (
			source: TSource,
			state: AssignItemsStepState<TItem>,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.GetItemsList = getItemsList;
		this.GetBuckets = getBuckets;
		this.ItemEquals = itemEqualsFunc;
		this.GetDefaultValue = getDefaultValue;
		this.RenderItem = renderItem;
	}

	initializeState(): AssignItemsStepState<TItem> {
		return {
			Available: [],
			Buckets: [],
			Value: undefined,
			IsCompleted: false,
			IsVisible: true,
		};
	}

	updateState(
		source: TSource,
		data: TData,
		newState: AssignItemsStepState<TItem>
	): void {
		var items = this.GetItemsList(source, data);
		var buckets = this.GetBuckets(source, data, items);

		if (newState.Value === undefined)
			newState.Value = this.GetDefaultValue(source, data, items);

		updateState(newState, this.ItemEquals, items, buckets);
	}

	render(
		stepState: AssignItemsStepState<TItem>,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;
		var dragState: DragState<TItem> = {};

		function onDragStart(
			item: TItem,
			bucket: TItem[],
			bucketDef: BucketDefinition<TItem> | undefined,
			e: React.DragEvent<HTMLSpanElement>
		) {
			if (!isValidDrag(item, bucketDef?.Locked || false, bucket)) {
				e.preventDefault();
				return;
			}

			dragState.dragging = item;
			dragState.draggingFromName = bucketDef?.Name || null;
		}

		function onDragOver(
			bucket: TItem[],
			bucketDef: BucketDefinition<TItem> | undefined,
			e: React.DragEvent<HTMLDivElement>
		) {
			if (
				!isValidDrop(
					dragState.dragging,
					bucketDef?.Locked || false,
					bucketDef?.MaxCount,
					bucket
				)
			) {
				return;
			}

			dragState.draggingToName = bucketDef?.Name || null;
			e.preventDefault();
		}

		function onDragExit(bucket: BucketDefinition<TItem> | undefined) {
			if (dragState.draggingToName === (bucket?.Name || null))
				dragState.draggingToName = undefined;
		}

		function onDragEnd() {
			if (
				stepState.Value &&
				dragState.dragging &&
				dragState.draggingFromName !== undefined &&
				dragState.draggingToName !== undefined
			) {
				var { dragging, draggingFromName, draggingToName } = dragState;
				dragState = {};

				triggerUpdate(index, {
					Value: updateValue(
						stepState.Value,
						dragging,
						draggingFromName,
						draggingToName
					),
				});
			}
		}

		var values = stepState.Value || {};

		return (
			<div className={`step step-assignitems step-${this.Name}`}>
				<div className="buckets">
					{stepState.Buckets.map((b: BucketDefinition<TItem>) => (
						<div className="bucket" key={`AssignItems-${this.Name}-${b.Name}`}>
							<div className="bucket-name">{b.Name}</div>
							<div
								className={`bucket-contents${b.Locked ? " bucket-locked" : ""}${
									b.MaxCount && values[b.Name]?.length >= b.MaxCount
										? " bucket-full"
										: ""
								}`}
								onDragOver={function (e) {
									onDragOver(values[b.Name] || [], b, e);
								}}
								onDragExit={function () {
									onDragExit(b);
								}}
							>
								{(values[b.Name] || []).map((i, idx) => (
									<span
										className="bucket-item"
										draggable={b.Locked ? false : true}
										key={`AssignedItem-${this.Name}-${b.Name}-${idx}`}
										onDragStart={function (e) {
											onDragStart(i, values[b.Name] || [], b, e);
										}}
										onDragEnd={function (e) {
											onDragEnd();
										}}
									>
										{this.RenderItem(i)}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
				<div className="available">
					<div
						className="bucket-contents"
						onDragOver={function (e) {
							onDragOver(stepState.Available, undefined, e);
						}}
						onDragExit={function () {
							onDragExit(undefined);
						}}
					>
						{stepState.Available.map((i, idx) => (
							<span
								className="bucket-item"
								key={`AssignedItem-${this.Name}-Available-${idx}`}
								draggable={true}
								onDragStart={function (e) {
									onDragStart(i, stepState.Available, undefined, e);
								}}
								onDragEnd={function (e) {
									onDragEnd();
								}}
							>
								{this.RenderItem(i)}
							</span>
						))}
					</div>
				</div>
			</div>
		);
	}
}

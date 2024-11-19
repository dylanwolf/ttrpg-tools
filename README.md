# ttrpgtools.dylanwolf.com

A React website with client-side tools for TTRPG players and gamemasters.

Developed with:

- Typescript, Vite, React, and Redux
- Bootstrap layout with the Darkly Bootswatch theme
- Icons from [Font Awesome](https://fontawesome.com/), [Game-Icons.net](https://game-icons.net/), and [LDRS](https://uiball.com/ldrs/).

Current set of utilities:

- Extensible character builder
- 5e encounter builder

## Credits

### Ryuutama

> This webtool has been approved for distribution and sale by Kotodama Heavy Industries, the publishers of the Ryuutama Natural Fantasy RPG in English. If you are interested in publishing your own Ryuutama works, please contact them directly through the official website to discuss options.
>
> You can find more about Ryuutama at [www.kotohi.com](htttps://www.kotohi.com).

## Character Builder

The TTRPG Tools character builder allows you to create a character creation process using a step-by-step process. A character builder has 5 components:

- **Builder Key**: Each builder must have a unique key that identifies it and ties all of the components together.
- **Source Data**: Source data is a JSON file fetched from the root of the site (the `public` folder). Its filename should be its builder key with a .json extension. This will contain the options used to populate the builder (class names, etc.).
- **Character Data**: A character is stored as an object that extends ICharacterData (which contains the Name attribute used as its title). This data can be saved and loaded as a JSON file, and it should be possible to set the state of the character builder from the data object. When creating a blank character, the step model provides the default value.
- **Step Model**: A step model defines each step in the process. You can use code to enforce certain rules (like filtering out options that are unavailable, etc.). Each step keeps its own state, which is then written back to character data. Whenever a step is changed, each step in the model processes. When a step processes, you can use character data to provide a default value (if one doesn't exist). A step model can be registered by calling `registerBuilderModel` in `src/utilities/character-builder/BuilderFactory.ts`.
- **Character Sheet**: The character sheet takes character data for the builder and renders it in a readable format. A character sheet can be registered by calling `registerCharacterSheetRenderer` in `src/utilities/character-builder/BuilderFactory.ts`.

### Step State vs. Character Data

Data for the character as a whole is stored in the _character data object_.

Each step in the model contains its own state in a _step state object_. This gets used in three ways:

- When a step is updated before it is rendered, the step state object is updated from _source and character data_.
- When a step is rendered, only _step state_ is used. _Source and character data_ are not available.
- When step data is changed, it is combined with _source data_ to update _character data_.

Step state and character data have the following differences:

- Only character data is persisted when a session is saved. Functions that define a step's default value should use character data to reconstitute step state.
- Step state is conceptually closer to the data needed to render HTML inputs and view data. Character data abstracts this away as much as possible, only representing the choices the user made. (Character data doesn't have to store full data such as stats calculated from other choices; that can be pulled together when a character sheet is rendered.)
- Typically a step only has access to character data for the whole character, but only has access to step state for itself. During the step update (before rendering a step), everything needed to render that step should be added to step state.

### Character Builder Steps

There are X types of generic character builder steps that can be configured in a character builder process. (You can also define custom steps for a process, such as the spell selector in the Ryuutama PC builder.)

Builders typically have a set of required configuration in the constructor, as well as fluent functions off the object for adding optional configuration.

#### Basic Step Structure

All steps have the following configuration options:

- **name**: A unique identifier for the step. This will be used to identify it in code, and it will have the `step-*[name]*` CSS class so that it can be styled.
- **onCharacterUpdate()**: Sets a method that is called after the step is processed. It uses source data and the current step state to update the _newData_ character data object.
- **isRequired()**: Defines the step as required. If a step is required, the builder process will not progress past it until it is considered complete.
- **onlyShowWhen()**: Sets a function that is used to determine when the step is shown. If the function returns false, then the step is hidden and its state is cleared.
- **withHelp()**: Defines a text string or JSX.Element that will be shown in a pop-up when hovering over the help icon for this step.

### Custom Steps

When creating a step class, you will need to define:

- **controlTypeId()**: Returns a unique ID for this control type. The control will have the `step-*[controlTypeId]*` CSS class so that all instances can be styled the same way.
- **initializeState()**: Returns a default state for this control type.
- **clearState(newState)**: Updates the _newState_ object when this control is empty or hidden. (Clearing data here will ensure that the associated data in the character data object is cleared when _updateCharacter_ is run later in the process.)
- **updateStateInternal(source, data, newState)**: Updates the _newState_ step state when this step processes. This should load any selection options from source data, load a default value from character data if the step state is empty, etc.
- **renderInternal(stepState, triggerUpdate)**: Renders the current state of the step as a control. Your code should call _triggerUpdate_ with the step index and a dictionary describing what step state property is being changed whenever there is an update that causes the builder to process.

#### Assign Pool Step

Assigns a pool of points to one or more statistics. When configuring, you can define:

- **withLabel()**: Defines the label that will be shown for this step.
- **withAvailablePoints()**: Returns the total number of points that can be assigned.
- **withStatPools()**: Returns the pools that can be assigned points. A pool's value can never go below 0, but you can assign a _MaxValue_ to limit how many points can be assigned to each pool.
- **withDefaultValue()**: Returns the default value, which is used when the step state is initialized.

#### Assign Stats Step

Assigns an array of stats to different ability scores. When configuring, you can define:

- **withLabel()**: The text shown at the top of the step.
- **withChoicesList()**: Defines the array of choices.
- **withChoiceEqualsFunc()**: Provides a way to determine when two choices are equal (used if choices change between updates).
- **withChoiceText()**: Defines the text shown for each choice.
- **withStatTargets()**: Returns the different stats that each choice can be assigned to. You can define a stat as `Locked` with a `FixedValue` if it is set elsewhere by a previous step.
- **withDefaultValue**: Returns the default value, which is used when the step state is initialized.

#### Checklist String Step

Allows the user to choose from a list of options. When configuring, you define:

- **withLabel()**: The text shown at the top of the step.
- **withSelectList()**: Returns the array of choices.
- **withItemValue()**: Returns the text value of an item in the select list. This will be written to step state and character data.
- **withItemText()**: Returns the text that should be displayed for an item in the select list.
- **withDefaultValue()**: Returns the default value, which is used when the step state is initialized.
- **requiresMinimumSelections()**: Defines a function that returns the minimum number of items that must be selected before this step is considered complete. If not defined, the step is always considered complete.
- **requiresMaximumSelections()**: Defines a function that returns the maximum number of items that can be selected. If not defined, any number of options can be selected.
- **useMarkdown()**: Specifies whether the checklist items should be rendered as Markdown or plain text.
- **useDropDownForSingleChoice()**: Specifies whether the checklist should be replaced with a drop-down when the maximum number of selections is 1.

#### Container Step

Runs a set of builder steps as if they were a separate process. If all of this container's steps are complete, it will be considered complete. If this container is made invisible, all of its steps will be cleared. When configuring, you define:

- **label**: The text shown at the top of the step.
- **children**: The child steps for this container.

#### For Each Step

Runs a set of builder steps as if they were a separate process, once for each iteration. If all of this container's steps in every iteration are complete, it will be considered complete. If this container is made invisible, all of its steps will be cleared. When configuring, you define:

- **getLabel**: A function that generates the label for each iteration.
- **getCount**: A function that returns the number of iterations.
- **getIterationData/setIterationData**: Functions that return and set an array of data. Each item in the array will be an iteration. The step will manipulate this array automatically, clearing and adding new items as necessary.
- **initIterationData**: Function to generate iteration data when an iteration is added.

#### Numeric Step

Collects a single number as an input. When configuring, you can define:

- **withLabel()**: The text shown at the top of the step.
- **withDefaultValue()**: Returns the default value, which is used when the step state is initialized.
- **withMinValue()**: Returns the minimum value, if there is one.
- **withMaxValue()**: Returns the maximum value, if there is one.
- **withStepValue()**: Returns the step for the input control, which determines how much the value changes when increment/decrement buttons are pressed (if they are visible).
- **clampInputField()**: Determines the behavior of the numeric HTML input field. If true, values outside of the min/max will be automatically clamped (so the step will remain complete automatically). If false, values outside of the min/max will be kept, but the step will be incomplete when this happens.

#### Static Text Step

Displays a piece of static text as a step. When configuring, you can define:

- **getValue**: Returns the text to display
- **withLabel**: A string that displays before the text.
- **useMarkdown**: If true, the text will be evaluated as markdown.

#### String Drop Down Step

Allows the user to select an option from a select drop-down, which returns a single string as the result. When configuring, you can define:

- **withLabel()**: A string that displays before the input field.
- **withSelectList()**: Returns the list of select options.
- **withItemValue()**: Returns the text value of an item in the select list. This will be written to step state and character data.
- **withItemText()**: Returns the text that should be displayed for an item in the select list.
- **withDefaultValue()**: Returns the default value, which is used when the step state is initialized.
- **withDetailText()**: Defines a function that returns text to display below the drop-down box. This can always be shown (to give the user more context), or only in mobile view (where the character sheet is not visible at the same time).

#### String Entry Step

Collects a single-line text value. When configuring, you can define:

- **withLabel()**: A string that displays before the input field.
- **withDefaultValue()**: Returns the default value, which is used when the step state is initialized.

# ttrpgtools.dylanwolf.com

A React website with client-side tools for TTRPG players and gamemasters.

Developed with:

- Typescript, Vite, React, and Redux
- Bootstrap layout with the Darkly Bootswatch theme
- Icons from [Font Awesome](https://fontawesome.com/), [Game-Icons.net](https://game-icons.net/), and [LDRS](https://uiball.com/ldrs/).

Current set of utilities:

- Extensible character builder
- 5e encounter builder

## Character Builder

The TTRPG Tools character builder allows you to create a character creation process using a step-by-step process. A character builder has 5 components:

- **Builder Key**: Each builder must have a unique key that identifies it and ties all of the components together.
- **Source Data**: Source data is a JSON file fetched from the root of the site (the `public` folder). Its filename should be its builder key with a .json extension. This will contain the options used to populate the builder (class names, etc.).
- **Character Data**: A character is stored as an object that extends ICharacterData (which contains the Name attribute used as its title). This data can be saved and loaded as a JSON file, and it should be possible to set the state of the character builder from the data object. When creating a blank character, the step model provides the default value.
- **Step Model**: A step model defines each step in the process. You can use code to enforce certain rules (like filtering out options that are unavailable, etc.). Each step keeps its own state, which is then written back to character data. Whenever a step is changed, each step in the model processes. When a step processes, you can use character data to provide a default value (if one doesn't exist). A step model can be registered by calling `registerBuilderModel` in `src/utilities/character-builder/BuilderFactory.ts`.
- **Character Sheet**: The character sheet takes character data for the builder and renders it in a readable format. A character sheet can be registered by calling `registerCharacterSheetRenderer` in `src/utilities/character-builder/BuilderFactory.ts`.

### Character Builder Steps

There are X types of generic character builder steps that can be configured in a character builder process. (You can also define custom steps for a process, such as the spell selector in the Ryuutama PC builder.)

Builders typically have a set of required configuration in the constructor, as well as fluent functions off the object for adding optional configuration.

#### Basic Step Structure

All steps have the following configuration options:

- **name**: A unique identifier for the step. This will be used to identify it in code, and it will have the `step-*[name]*` CSS class so that it can be styled.
- **updateCharacter(source, state, newData)**: A method that is called after the step is processed. It uses source data and the current step state to update the _newData_ character data object.
- **isRequired()**: Defines the step as required. If a step is required, the builder process will not progress past it until it is considered complete.
- **onlyShowWhen(getIsVisibleFunc)**: Sets a function that is used to determine when the step is shown. If the function returns false, then the step is hidden and its state is cleared.
- **withHelp(content)**: Defines a text string or JSX.Element that will be shown in a pop-up when hovering over the help icon for this step.

### Custom Steps

When creating a step class, you will need to define:

- **controlTypeId()**: Returns a unique ID for this control type. The control will have the `step-*[controlTypeId]*` CSS class so that all instances can be styled the same way.
- **initializeState()**: Returns a default state for this control type.
- **clearState(newState)**: Updates the _newState_ object when this control is empty or hidden. (Clearing data here will ensure that the associated data in the character data object is cleared when _updateCharacter_ is run later in the process.)
- **updateStateInternal(source, data, newState)**: Updates the _newState_ step state when this step processes. This should load any selection options from source data, load a default value from character data if the step state is empty, etc.
- **renderInternal(stepState, triggerUpdate)**: Renders the current state of the step as a control. Your code should call _triggerUpdate_ with the step index and a dictionary describing what step state property is being changed whenever there is an update that causes the builder to process.

#### Assign Pool Step

Assigns a pool of points to one or more statistics. When configuring, you can define:

- **getAvailable(source, data)**: Returns the total number of points that can be assigned.
- **getPools(source, data)**: Returns the pools that can be assigned points. A pool's value can never go below 0, but you can assign a _MaxValue_ to limit how many points can be assigned to each pool.
- **getDefaultValue(src, data)**: Returns the default value, which is used when the step state is initialized.

#### Assign Stats Step

Assigns an array of stats to different ability scores. When configuring, you can define:

- **label**: The text shown at the top of the step.
- **getChoicesList(source, data)**: Returns the array of choices.
- **choiceEqualsFunc(us, them)**: Provides a way to determine when two choices are equal (used if choices change between updates).
- **getStates(source, data, choicesList)**: Returns the different stats that each choice can be assigned to. You can define a stat as `Locked` with a `FixedValue` if it is set elsewhere by a previous step.
- **getDefaultValue(source, data, choicesList)**: Returns the default value, which is used when the step state is initialized.

#### Checklist String Step

Allows the user to choose from a list of options. When configuring, you define:

- **label**: The text shown at the top of the step.
- **getSelectList(source, data)**: Returns the array of choices.
- **getValue(item)**: Returns the text value of an item in the select list. This will be written to step state and character data.
- **getText(item)**: Returns the text that should be displayed for an item in the select list.
- **getDefaultValue(source, data, choicesList)**: Returns the default value, which is used when the step state is initialized.

- **getMinimumSelectCount(func)**: Defines a function that returns the minimum number of items that must be selected before this step is considered complete. If not defined, the step is always considered complete.
- **getMaximumSelectCount(func)**: Defines a function that returns the maximum number of items that can be selected. If not defined, any number of options can be selected.

#### Container Step

Runs a set of builder steps as if they were a separate process. If all of this container's steps are complete, it will be considered complete. If this container is made invisible, all of its steps will be cleared. When configuring, you define:

- **label**: The text shown at the top of the step.
- **children**: The child steps for this container.

#### Numeric Step

Collects a single number as an input. When configuring, you can define:

- **getDefaultValue(source, data)**: Returns the default value, which is used when the step state is initialized.
- **withMinValue(func)**: Returns the minimum value, if there is one.
- **withMaxValue(func)**: Returns the maximum value, if there is one.
- **withStepValue(func)**: Returns the step for the input control, which determines how much the value changes when increment/decrement buttons are pressed (if they are visible).

#### Static Text Step

Displays a piece of static text as a step. When configuring, you can define:

- **label**: A string that displays before the text.
- **acceptMarkdown**: If true, the text will be evaluated as markdown.
- **getValue(func)**: Returns the text to display

#### String Drop Down Step

Allows the user to select an option from a select drop-down, which returns a single string as the result. When configuring, you can define:

- **label**: A string that displays before the input field.
- **getSelectList(source, data)**: Returns the list of select options.
- **getValue(item)**: Returns the text value of an item in the select list. This will be written to step state and character data.
- **getText(item)**: Returns the text that should be displayed for an item in the select list.
- **getDefaultValue(source, data, choicesList)**: Returns the default value, which is used when the step state is initialized.

#### String Entry Step

Collects a single-line text value. When configuring, you can define:

- **label**: A string that displays before the input field.
- **getDefaultValue(source, data)**: Returns the default value, which is used when the step state is initialized.

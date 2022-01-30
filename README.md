# `createProvider`

`createProvider` is a nearly no-op function to support type inference and easier type safety for `provide` and `inject` in Vue 3.



## Installation and usage

```bash
npm i @alexvipond/vue-create-provider
```

```ts
// MyComponentGroup.ts
import { ref, h } from 'vue'
import { createProvider } from '@alexvipond/vue-create-provider'

// Use the `createProvider` function to assemble a parent
// component that needs to provide data to its component tree.
//
// `createProvider` will return an object with an
// `injectionKey` (Symbol) and an assembled Vue component.
//
// Let's go through each of the function's parameters to see
// how things work, and how data ultimately gets provided
// to descendants.
const { injectionKey, component: ParentComponent } = createProvider(
  // The first parameter is `parentProps`: the `props` definition
  // for your parent component (the component that is supposed
  // to provide data).
  //
  // Format `parentProps` exactly as if you were passing it to
  // the `props` option of a normal component.
  {
    initialCount: {
      type: Number,
      default: 42,
    }
  },
  
  // The second parameter is a callback function that we'll 
  // call `createProvided`.
  //
  // `createProvided` is basically a component `setup` function
  // but instead of returning a render function or data for your
  // Vue template, it should return the data that you want to
  // `provide` to the component tree.
  //
  // Just like `setup`, `createProvided` accepts `props` and 
  // `context` as its only parameters.
  //
  // If you're in VS code, you can hover over `props` at this
  // point to see that data types have already been inferred
  // from the `parentProps` parameter. In this example,
  // `props.initialCount` would automatically be type-checked
  // as a number.
  (props, context) {
    // Write code exactly as if you were in the `setup` function.
    // Behind the scenes, `createProvider` will run this code
    // inside your component's `setup` function, so it all works
    // the same way.
    const count = ref(props.initialCount)

    // Instead of calling the `provide` function with an injection
    // key and the data you want to provide, just return that data
    // from this function. In most use cases, this will be an object
    // that holds multiple reactive references.
    //
    // Behind the scenes, the data will get passed to `provide`,
    // and it can be accessed from child components.
    return { count }
  },

  // The third parameter is `parentRender`. This is a callback
  // function that should return a render function.
  //
  // `parentRender` accepts `props` and `context` parameters,
  // just like `setup` normally would. In addition, it accepts
  // a `provided` parameter, where you can access the data returned
  // from your `createProvided` function (the second parameter of
  // `createProvider`).
  (props, context, provided) {
    // Right here, TypeScript will know that `count` is a reactive
    // reference to a number. Automatic type inference is already
    // working!
    const { count } = provided

    return () => h(
      'div',
      [
        // Render the values of reactive references from `provided`,
        // just like you normally would in a render function returned
        // from `setup`.
        h('span', count.value),
        // You can also use `props` or `context` to render prop
        // values, slots, etc., just you normally would in `setup`.
        context.slots.default()
      ]
    )
  },

  // For the fourth and final parameter, provide a name (String)
  // for your injection key.
  'my injection key'
)

// With all of that work done, `createProvider` will assemble your
// parent component from the pieces you've provided. That component
// will use `provide` internally to make sure data is provided to the
// component tree.
//
// Also, with the magic of TypeScript's type inference and generic
// types, all type information about your provided data is stored
// in the `injectionKey`
// 
// You can now use that injection key in child components with
// full type safety.
const ChildComponent = defineComponent({
  setup (props, context) {
    // `count` will be correctly detected here as a reactive
    // reference to a number! No need to maintain or pass around
    // manual type definitions of provided data—everything is
    // inferred and type-checked automatically.
    const { count } = inject(injectionKey)
  }
})

// The injection key and any defined components can be exported
// normally.
export {
  injectionKey,
  ParentComponent,
  ChildComponent
}
```

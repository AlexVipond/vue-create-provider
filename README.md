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

Here's that same code without comments, to give you a better sense of code size and shape:

```ts
// MyComponentGroup.ts
import { ref, h } from 'vue'
import { createProvider } from '@alexvipond/vue-create-provider'

const { injectionKey, component: ParentComponent } = createProvider(
  {
    initialCount: {
      type: Number,
      default: 42,
    }
  },
  (props, context) => {
    const count = ref(props.initialCount)
    return { count }
  },
  (props, context, provided) => {
    const { count } = provided

    return () => h(
      'div',
      [
        h('span', count.value),
        context.slots.default()
      ]
    )
  },
  'my injection key'
)

const ChildComponent = defineComponent({
  setup (props, context) {
    const { count } = inject(injectionKey)
  }
})

export {
  injectionKey,
  ParentComponent,
  ChildComponent
}
```


## Motivation

Vue 3's `provide` and `inject` functions are fantastically useful for components that need to share data behind the scenes, without foisting delicate, repetitive `props` and `emit` configuration on other developers.

But type safety is a little tricky when you're working with `provide` and `inject`.

Let's take a look:

```ts
// MyComponentGroup.ts
import { ref, provide, inject, defineComponent } from 'vue'

const injectionKey = Symbol('my injection key')

export const ParentComponent = defineComponent({
  setup () {
    // TypeScript can infer that `count` is a reactive reference
    // to a number. If we try to assign a string to count.value,
    // we'll get a compiler error.
    const count = ref(0)

    // We can provide `count` down to the component tree in case
    // other components need it.
    provide(injectionKey, { count })
  }
})

export const ChildComponent = defineComponent({
  setup () {
    // By default, `count` will have a type of `unknown`. TypeScript
    // has no understanding of how `provide` and `inject` work at
    // runtime, so it's not possible for the compiler to know that
    // this `inject` call is dealing with the same data we passed
    // to `provide`.
    const { count } = inject(injectionKey)
  }
})
```

Vue 3's type system has some nice features designed to get around this problem. Specifically, both `provide` and `inject` accept a generic type that describes the provided data.

If we're willing to manually define the type of our provided data, we can pass that type into `provide` and `inject` to achieve type safety:


```ts
// MyComponentGroup.ts
import { ref, provide, inject, defineComponent } from 'vue'
import type { Ref } from 'vue'

// We can manually define a type that describes our provided data.
type Provided = {
  count: Ref<number>,
}

const injectionKey = Symbol('my injection key')

export const ParentComponent = defineComponent({
  setup () {
    const count = ref(0)

    // We can pass our manual type to `provide` as a generic, and
    // TS will type-check the provided data.
    provide<Provided>(injectionKey, { count })
  }
})

export const ChildComponent = defineComponent({
  setup () {
    // We can also pass the manual type to `inject` as a generic.
    // Once we do that, `count` will no longer be `unknown`—it will
    // be correctly identified as `Ref<number>`.
    const { count } = inject<Provided>(injectionKey)
  }
})
```

That works, but there's another solution that's slightly smoother: we can define our injection key using Vue's `InjectionKey` type. `InjectionKey`, just like `provide` and `inject`, accepts a generic type that describes the provided data.

Instead of passing our manual type into `provide` and `inject` separately, we can just pass it into the `InjectionKey` type. `provide` and `inject` will use type inference on our injection key to figure out what type of data they're dealing with.

```ts
// MyComponentGroup.ts
import { ref, provide, inject, defineComponent } from 'vue'
import type { InjectionKey, Ref } from 'vue'

// We can manually define a type that describes our provided data.
type Provided = {
  count: Ref<number>,
}

// Then, we can assert that our injection key is an `InjectionKey`,
// specifically created for the `Provided` data type.
const injectionKey: InjectionKey<Provided> = Symbol('my injection key')

export const ParentComponent = defineComponent({
  setup () {
    const count = ref(0)

    // `provide` will infer from `injectionKey` that its data
    // should match the `Provided` type. No need to pass the generic!
    provide(injectionKey, { count })
  }
})

export const ChildComponent = defineComponent({
  setup () {
    // Likewise, `inject` will infer the same info from `injectionKey`.
    // Even though we haven't explicitly passed the generic to `inject`,
    // TS will automatically know that `count` is `Ref<number>`.
    const { count } = inject(injectionKey)
  }
})
```

This is pretty cool stuff, and it's a testament to the Vue team's deep and thoughtful effort to encourage type safety in our Vue 3 codebases.

I only have two gripes with this manual type + `InjectionKey` solution:
1. I'm not a huge fan of importing and wiring up the `InjectionKey` and `Ref` utility types any time I need to define a group of components that use `provide` and `inject`. It just feels like yet another piece of boilerplate code to be concerned with.
2. I really don't enjoy writing and maintaining manually defined types in these situations. Every time I want to provide an additional piece of data, or change the type of an existing piece, I have to go back to that manual type and update it, just to keep the TS compiler happy, even if my code is already passing tests and working properly at runtime. I can imagine this is even more difficult to manage for larger teams working on more complex components, possibly in multiple git branches.

`createProvider` is an effort to eliminate that boilerplate code, and all of the ongoing maintenance and TS compiler frustration that goes along with it.

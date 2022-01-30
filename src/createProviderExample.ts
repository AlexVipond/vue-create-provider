import { defineComponent, ref, inject, h } from 'vue'
import { createProvider } from './createProvider'

const { injectionKey, component: Parent } = createProvider(
  // Make an injection key
  Symbol('provided'),

  // Define props
  {
    initialCount: {
      type: Number,
      default: 0,
    },
    initialMessage: {
      type: String,
      default: 'hello world',
    }
  },

  // Create data that the parent provides
  (props, ctx) => {
    const count = ref(props.initialCount)
    const message = ref(props.initialMessage)

    return { count, message }
  },

  // Render the parent
  ({ count, message }, props, ctx) => {
    return () => h('div', [
      h('h2', { class: 'text-sm font-bold uppercase tracking-widest text-green-900' }, 'Parent'),
      h('pre', { class: 'p-4 rounded bg-green-900 text-green-200' }, [`count: ${count.value}\nmessage: ${message.value}`]),
      ctx.slots.default() 
    ])
  }
)

const Child = defineComponent({
  setup (props, ctx) {
    const { count, message } = inject(injectionKey)

    return () => h('div', [
      h('h2', { class: 'text-sm font-bold uppercase tracking-widest' }, 'Child'),
      h('div', { class: 'flex items-center gap-4' }, [
        h('button',
          {
            class: 'p-2 rounded bg-green-700 text-green-100 shadow-md',
            onClick: () => count.value++
          },
          'count++'
        ),
        h('button',
          {
            class: 'p-2 rounded bg-green-700 text-green-100 shadow-md',
            onClick: () => count.value--
          },
          'count--'
        ),
      ]),
      h('input',
        {
          type: 'text',
          class: 'p-2 rounded shadow-inner bg-green-300',
          onInput: ({ target: { value: newMsg } }) => message.value = newMsg,
          value: message.value,
        },
      ),
    ])
  }
})

export { Parent, Child }

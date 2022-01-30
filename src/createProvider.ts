import { defineComponent, provide, InjectionKey, DefineComponent, RenderFunction, ComponentPropsOptions, ExtractPropTypes } from 'vue'

type Setup<Props> = DefineComponent<Props>['setup']

export function createProvider<Props extends ComponentPropsOptions, T> (
  injectionKey: InjectionKey<T>,
  parentProps: Props,
  createProvided: (...params: Parameters<Setup<Props>>) => T,
  parentRender: (provided: T, ...params: Parameters<Setup<Props>>) => RenderFunction,
) {
  const component = defineComponent({
    props: parentProps,
    setup (props, ctx) {
      const provided = createProvided(props as Parameters<Setup<Props>>[0], ctx)

      provide(injectionKey, provided)

      return parentRender(provided, props as Parameters<Setup<Props>>[0], ctx)
    }
  })

  return {
    injectionKey,
    component
  }
}

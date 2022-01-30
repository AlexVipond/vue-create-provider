import { defineComponent, provide, InjectionKey, DefineComponent, RenderFunction, ComponentPropsOptions } from 'vue'

type Setup<Props> = DefineComponent<Props>['setup']

export function createProvider<Props extends ComponentPropsOptions, T> (
  parentProps: Props,
  createProvided: (...params: Parameters<Setup<Props>>) => T,
  parentRender: (props: Parameters<Setup<Props>>[0], ctx: Parameters<Setup<Props>>[1], provided: T) => RenderFunction,
  injectionKeyName: string,
) {
  const injectionKey: InjectionKey<T> = Symbol(injectionKeyName)

  const component = defineComponent({
    props: parentProps,
    setup (props, ctx) {
      const provided = createProvided(props as Parameters<Setup<Props>>[0], ctx)

      provide(injectionKey, provided)

      return parentRender(props as Parameters<Setup<Props>>[0], ctx, provided)
    }
  })

  return {
    injectionKey,
    component
  }
}

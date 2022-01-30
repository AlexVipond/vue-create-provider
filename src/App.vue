<template>
  <div class="h-screen w-screen flex flex-col gap-6 p-20 items-center bg-gray-100">
    <Parent
      :initialCount="42"
      initialMessage="Hello world"
      class="flex flex-col gap-6 p-6 bg-white rounded shadow-lg"
    >
      <Child class="w-full max-w-md flex flex-col gap-4 p-6 rounded shadow-md bg-green-200 text-green-900" />
    </Parent>
  </div>
</template>

<script setup lang="ts">
import { Parent, Child } from './createProviderExample'

</script>

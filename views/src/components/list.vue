<template>
  <div class="list">
    <panel v-for="mock in mockData" :header="mock.urlReg" :status="mock.enabled">
      {{ mock.body }}
    </panel>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps({
  request: Function,
  apiUrl: String,
  data: Object
})

const request = props.request
const iconCard = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDlIOUM3Ljg5NTQzIDkgNyA5Ljg5NTQzIDcgMTFWMTdDNyAxOC4xMDQ2IDcuODk1NDMgMTkgOSAxOUgxOUMyMC4xMDQ2IDE5IDIxIDE4LjEwNDYgMjEgMTdWMTFDMjEgOS44OTU0MyAyMC4xMDQ2IDkgMTkgOVoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTE0IDE2QzE1LjEwNDYgMTYgMTYgMTUuMTA0NiAxNiAxNEMxNiAxMi44OTU0IDE1LjEwNDYgMTIgMTQgMTJDMTIuODk1NCAxMiAxMiAxMi44OTU0IDEyIDE0QzEyIDE1LjEwNDYgMTIuODk1NCAxNiAxNCAxNloiIGZpbGw9IiM5MENBRjkiLz4KPHBhdGggZD0iTTE3IDlWN0MxNyA2LjQ2OTU3IDE2Ljc4OTMgNS45NjA4NiAxNi40MTQyIDUuNTg1NzlDMTYuMDM5MSA1LjIxMDcxIDE1LjUzMDQgNSAxNSA1SDVDNC40Njk1NyA1IDMuOTYwODYgNS4yMTA3MSAzLjU4NTc5IDUuNTg1NzlDMy4yMTA3MSA1Ljk2MDg2IDMgNi40Njk1NyAzIDdWMTNDMyAxMy41MzA0IDMuMjEwNzEgMTQuMDM5MSAzLjU4NTc5IDE0LjQxNDJDMy45NjA4NiAxNC43ODkzIDQuNDY5NTcgMTUgNSAxNUg3IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==`
const plugins = ref([]);
const loaded = ref([]);
const tab = ref('plugins');

request.post(`${props.apiUrl}/config/GetPluginList`)
  .then((response) => {
    if (response.data.status === 'success') {
      plugins.value = response.data.data
    } else {
      plugins.value = []
    }
  })
  .catch((error) => {
    plugins.value = []
  })
request.post(`${props.apiUrl}/config/GetExamplePluginList`)
  .then((response) => {
    if (response.data.status === 'success') {
      loaded.value = response.data.data
    } else {
      loaded.value = []
    }
  })
  .catch((error) => {
    loaded.value = []
  })
</script>

<template>
  <v-card elevation="0" class="bg-secondary overflow-hidden bubble-shape bubble-secondary-shape">
    <v-card-text>
      <div class="d-flex align-start mb-3">
        <v-btn icon rounded="sm" color="darksecondary" variant="flat">
          <img :src="iconCard" width="25" />
        </v-btn>
        <div class="ml-auto z-1">
          <v-tabs v-model="tab" class="theme-tab" density="compact" end>
            <v-tab value="plugins" hide-slider color="darksecondary">插件包</v-tab>
            <v-tab value="loaded" hide-slider color="darksecondary">单插件</v-tab>
          </v-tabs>
        </div>
      </div>

      <v-window v-model="tab" class="z-1">
        <v-window-item value="plugins">
          <h2 class="text-h1 font-weight-medium">
            {{ plugins.length }}
          </h2>
          <span class="text-subtitle-1 text-medium-emphasis text-white">插件包数量</span>
        </v-window-item>
        <v-window-item value="loaded">
          <h2 class="text-h1 font-weight-medium">
            {{ loaded.length }}
          </h2>
          <span class="text-subtitle-1 text-medium-emphasis text-white">插件数量</span>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

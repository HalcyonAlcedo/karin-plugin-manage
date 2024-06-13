<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps({
  request: Function,
  apiUrl: String,
  data: Object
})

const request = props.request

const botList = ref([]);

request.post(`${props.apiUrl}/system/GetBotList`)
.then((response) => {
  if (response.data.status === 'success') {
    botList.value = response.data.data
  } else {
    botList.value = []
  }
})
.catch((error) => {
  botList.value = []
})

</script>

<template>
  <v-card elevation="0">
    <v-card variant="outlined">
      <v-card-text>
        <div class="d-flex align-center">
          <h4 class="text-h4 mt-1">Bot 列表</h4>
        </div>

        <div class="mt-4">
          <perfect-scrollbar v-bind:style="{ height: '270px' }">
            <v-list lines="two" class="py-0">
              <v-list-item v-for="(revenue, i) in botList" :key="i" :value="revenue" color="secondary" :prepend-avatar="revenue.avatar" :subtitle="`${revenue.version?.app_name} ${revenue.version?.version}`" rounded="sm">
                <div class="d-inline-flex align-center justify-space-between w-100">
                  <div>
                    <h6 class="text-subtitle-1 text-medium-emphasis font-weight-bold">
                      {{ revenue.account?.name }}
                    </h6>
                    <span class="text-error text-subtitle-2">{{ revenue.uin }}</span>
                  </div>

                  <div class="ml-auto text-subtitle-1 text-medium-emphasis font-weight-bold">
                    好友: {{ revenue.conut?.friend }} 群组: {{ revenue.conut?.group   }}
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </perfect-scrollbar>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>

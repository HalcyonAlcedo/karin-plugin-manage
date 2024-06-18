<script setup lang="ts">
const props = defineProps({ data: Object })
const level = (type) => {
  switch (type) {
    case 'INFO':
      return 'info'
    case 'WARN':
      return 'warning'
    case 'ERRO':
      return 'error'
    case 'MARK':
      return '#9575CD'
    case 'TRACE':
      return '#546E7A'
    case 'DEBU':
      return '#26A69A'
    default:
      return '#6D4C41'
  }
}
</script>

<template>
  <v-card title="系统日志">
    <v-row dense>
      <v-list>
        <v-list-item v-for="(item, index) in props.data" :key="item">
          <v-alert :text="item.message" :title="item.timestamp" :color="level(item.level)" border="start"
            variant="outlined" prominent></v-alert>
        </v-list-item>
      </v-list>
    </v-row>
  </v-card>
</template>

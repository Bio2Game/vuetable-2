<template>
  <th v-if="isHeader"
    class="vuetable-th-component-handle"
    v-html="title"
  ></th>
  <td v-else
    class="vuetable-td-component-handle"
  ><i class="material-icons">{{ css.handleIcon }}</i></td>
</template>

<script>
import VuetableFieldMixin from './VuetableFieldMixin.vue'

export default {
  name: 'vuetable-field-handle',

  mixins: [VuetableFieldMixin],

  computed: {
    css() {
      return this.vuetable.$_css
    }
  },
}
</script>

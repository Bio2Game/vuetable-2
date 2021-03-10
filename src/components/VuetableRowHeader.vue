<template>
  <tr>
    <template v-for="(field, fieldIndex) in vuetable.tableFields">
      <template v-if="field.visible">
        <template v-if="vuetable.isFieldComponent(field.name)">
          <component :is="field.name"
            :row-field="field"
            :is-header="true"
            :title="renderTitle(field)"
            :vuetable="vuetable"
            :key="fieldIndex"
            :class="headerClass('vuetable-th-component', field)"
            :style="{width: field.width}"
            @vuetable:header-event="vuetable.onHeaderEvent"
            @click="vuetable.orderBy(field)"
          ></component>
        </template>
        <template v-else-if="vuetable.isFieldSlot(field.name)">
          <th :class="headerClass('vuetable-th-slot', field)"
              :key="fieldIndex"
              :style="{width: field.width}"
              v-html="renderTitle(field)"
              @click="vuetable.orderBy(field)"
          ></th>
        </template>
        <template v-else>
          <th @click="vuetable.orderBy(field)"
            :key="fieldIndex"
            :id="'_' + field.name"
            :class="headerClass('vuetable-th', field)"
            :style="{width: field.width}"
            v-html="renderTitle(field)"
          ></th>
        </template>
      </template>
    </template>
    <vuetable-col-gutter v-if="vuetable.scrollVisible"/>
  </tr>
</template>
<script>
import VuetableFieldCheckbox from './VuetableFieldCheckbox'
import VuetableFieldHandle from './VuetableFieldHandle'
import VuetableFieldSequence from './VuetableFieldSequence'
import VuetableColGutter from './VuetableColGutter'

export default {
  components: {
    'vuetable-field-checkbox': VuetableFieldCheckbox,
    'vuetable-field-handle'  : VuetableFieldHandle,
    'vuetable-field-sequence': VuetableFieldSequence,
    VuetableColGutter
  },

  computed: {
    sortOrder() {
      return this.$parent.sortOrder
    },

    css() {
      return this.$parent.$_css
    },

    vuetable() {
      return this.$parent
    }
  },

  methods: {
    stripPrefix (name) {
      return name.replace(this.vuetable.fieldPrefix, '')
    },

    headerClass (base, field) {
      return [
        base + '-' + this.toSnakeCase(field.name),
        field.titleClass || '',
        this.sortClass(field),
        {'sortable': this.vuetable.isSortable(field)}
      ]
    },

    toSnakeCase (str) {
      return typeof(str) === 'string' && str.replace(/([A-Z])/g, (chr) => "_"+chr.toLowerCase())
        .replace(' ', '_')
        .replace('.', '_')
    },

    sortClass (field) {
      let cls = ''

      if (this.currentSortOrder(field)) {
        cls = (this.sortOrder.direction == 'asc') ? this.css.ascendingClass : this.css.descendingClass
      }

      return cls;
    },

    sortIcon (field) {
      let cls = this.css.sortableIcon

      if (this.currentSortOrder(field)) {
        cls = this.sortOrder.direction === 'asc' ? this.css.ascendingIcon : this.css.descendingIcon
      }

      return cls;
    },

    hasSortableIcon (field) {
      return this.vuetable.isSortable(field) && this.css.sortableIcon != ''
    },

    currentSortOrder (field) {
      if (!this.vuetable.isSortable(field)) {
        return false
      }

      return this.sortOrder && this.sortOrder.field === field.name && this.sortOrder.sortField === field.sortField
    },

    renderTitle (field) {
      let title = this.getTitle(field)

      if (title.length > 0 && this.currentSortOrder(field) || this.hasSortableIcon(field)) {
        return title + ' ' + `<i class="material-icons">${this.sortIcon(field)}</i>`
      }

      return title
    },

    getTitle (field) {
      if (typeof(field.title) === 'function') return field.title()

      return typeof(field.title) === 'undefined'
        ? field.name.replace('.', ' ')
        : field.title
    },
  }
}
</script>

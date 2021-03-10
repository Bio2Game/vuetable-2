<template>
  <div :class="$_css.tableWrapper">
    <div class="vuetable-head-wrapper" v-if="isFixedHeader">
      <table :class="['vuetable', $_css.tableClass, $_css.tableHeaderClass]">
        <vuetable-col-group :is-header="true"/>
        <thead>
          <slot name="tableHeader" :fields="tableFields">
            <template v-for="(header, headerIndex) in headerRows">
              <component :is="header" :key="headerIndex"
                @vuetable:header-event="onHeaderEvent"
              ></component>
            </template>
          </slot>
        </thead>
      </table>
    </div>

    <div class="vuetable-body-wrapper" :class="{'fixed-header' : isFixedHeader}" :style="{height: tableHeight}">
      <table :class="['vuetable', isFixedHeader ? 'fixed-header' : '', $_css.tableClass, $_css.tableBodyClass]">
      <vuetable-col-group/>
      <thead v-if="!isFixedHeader">
      <slot name="tableHeader" :fields="tableFields">
        <template v-for="(header, headerIndex) in headerRows">
          <component :is="header" :key="headerIndex"
            @vuetable:header-event="onHeaderEvent"
          ></component>
        </template>
      </slot>
      </thead>
      <tfoot>
        <slot name="tableFooter" :fields="tableFields"></slot>
      </tfoot>
      <draggable v-cloak v-model="tableDataComp" :disabled="!draggable" tag="tbody" class="vuetable-body">
        <tr :item-index="itemIndex"
          v-for="(item, itemIndex) in tableDataComp"
          :key="itemIndex"
          :class="onRowClass(item, itemIndex)"
          @click="onRowClicked(item, itemIndex, $event)"
        >
          <template v-for="(field, fieldIndex) in tableFields">
            <template v-if="field.visible">
              <template v-if="isFieldComponent(field.name)">
                <component :is="field.name"
                  :key="fieldIndex"
                  :row-data="item" :row-index="itemIndex" :row-field="field"
                  :vuetable="vuetable"
                  :class="bodyClass('vuetable-component', field)"
                  :style="{width: field.width}"
                  @vuetable:field-event="onFieldEvent"
                ></component>
              </template>
              <template v-else-if="isFieldSlot(field.name)">
                <td :class="bodyClass('vuetable-slot', field)"
                  :key="fieldIndex"
                  :style="{width: field.width}"
                >
                  <slot :name="field.name"
                    :row-data="item" :row-index="itemIndex" :row-field="field"
                  ></slot>
                </td>
              </template>
              <template v-else>
                <td :class="bodyClass('vuetable-td-'+field.name, field)"
                  :key="fieldIndex"
                  :style="{width: field.width}"
                  v-html="renderNormalField(field, item)"
                  @click="onCellClicked(item, itemIndex, field, $event)"
                  @dblclick="onCellDoubleClicked(item, itemIndex, field, $event)"
                  @contextmenu="onCellRightClicked(item, itemIndex, field, $event)"
                ></td>
              </template>
            </template>
          </template>
        </tr>
        <template v-if="displayEmptyDataRow">
          <tr>
            <td :colspan="countVisibleFields"
              class="vuetable-empty-result"
              v-html="noDataTemplate"
            ></td>
          </tr>
        </template>
        <template v-if="lessThanMinRows">
          <tr v-for="i in blankRows" class="blank-row" :key="i">
            <template v-for="(field, fieldIndex) in tableFields">
              <td v-if="field.visible" :key="fieldIndex">&nbsp;</td>
            </template>
          </tr>
        </template>
      </draggable>
      </table>
    </div>
  </div>
</template>

<script>
import VuetableRowHeader from './VuetableRowHeader'
import VuetableColGroup from './VuetableColGroup'
import CssSemanticUI from './VuetableCssSemanticUI.js'
import orderByLodash from 'lodash.orderby'

import draggable from 'vuedraggable'

export default {
  name: 'Vuetable',

  components: {
    VuetableRowHeader,
    VuetableColGroup,
    draggable
  },

  props: {
    fields: {
      type: Array,
      required: true
    },
    data: {
      type: [Array, Object],
      default: null
    },

    perPage: {
        type: Number,
        default: 10
    },
    tableHeight: {
      type: String,
      default: null
    },
    rowClass: {
      type: [String, Function],
      default: ''
    },
    trackBy: {
      type: String,
      default: 'id'
    },
    defaultSortBy: {
      type: String,
      default: 'id'
    },
    css: {
      type: Object,
      default () {
        return {}
      }
    },
    minRows: {
      type: Number,
      default: 0
    },
    noDataTemplate: {
      type: String,
      default() {
        return 'No Data Available'
      }
    },
    headerRows: {
      type: Array,
      default() {
        return ['VuetableRowHeader']
      }
    },
    transform: {
      type: Function,
      default: null
    },
    fieldPrefix: {
      type: String,
      default() {
        return 'vuetable-field-'
      }
    },
    eventPrefix: {
      type: String,
      default() {
        return 'vuetable:'
      }
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      sortOrder: null,
      tableFields: [],
      tableData: null,
      tablePagination: null,
      currentPage: 1,
      selectedTo: [],
      visibleDetailRows: [],
      lastScrollPosition: 0,
      scrollBarWidth: '17px', //chrome default
      scrollVisible: false,
      $_css: {},
    }
  },

  computed: {

    tableDataComp: {
      get() {
        return this.tableData
      },
      set(value) {
        this.$emit('input', value)
        this.setData(value)
      }
    },

    dataIsAvailable () {
      if ( ! this.tableData) return false

      return this.tableData.length > 0
    },
    hasRowIdentifier () {
      return this.tableData && typeof(this.tableData[0][this.trackBy]) !== 'undefined'
    },
    countVisibleFields () {
      return this.tableFields.filter( (field) => {
        return field.visible
      }).length
    },
    countTableData () {
      if (this.tableData === null) {
        return 0
      }
      return this.tableData.length
    },
    displayEmptyDataRow () {
      return this.countTableData === 0 && this.noDataTemplate.length > 0
    },
    lessThanMinRows () {
      if (this.tableData === null || this.tableData.length === 0) {
        return true
      }
      return this.tableData.length < this.minRows
    },
    blankRows () {
      if (this.tableData === null || this.tableData.length === 0) {
        return this.minRows
      }
      if (this.tableData.length >= this.minRows) {
        return 0
      }

      return this.minRows - this.tableData.length
    },
    isFixedHeader () {
      return this.tableHeight != null
    },
    vuetable () {
      return this
    },
  },

  created() {
    this.mergeCss()
    this.normalizeFields()
    this.setupSortOrder()
    this.$nextTick( () => {
      this.fireEvent('initialized', this.tableFields)
    })
  },

  mounted () {
    this.setData(this.data)

    if (this.isFixedHeader) {
      this.scrollBarWidth = this.getScrollBarWidth() + 'px';

      let elem = this.$el.getElementsByClassName('vuetable-body-wrapper')[0];
      if (elem != null) {
        elem.addEventListener('scroll', this.handleScroll);
      }
    }
  },

  destroyed () {
    let elem = this.$el.getElementsByClassName('vuetable-body-wrapper')[0];
    if (elem != null) {
      elem.removeEventListener('scroll', this.handleScroll);
    }
  },

  watch: {
    data (newVal, oldVal) {
      this.setData(newVal)
    },

    tableHeight (newVal, oldVal) {
      this.checkScrollbarVisibility()
    },

    fields (newVal, oldVal) {
    	this.normalizeFields();
    },

    perPage (newVal, oldVal) {
      this.reload();
    },

    draggable(newVal, oldVal) {
      this.setData(this.data)
    },

    defaultSortBy (newVal, oldVal) {
      const field = this.fields.find(field => field.sortField === newVal)
      this.sortData(field)
    },
},

  methods: {

    getScrollBarWidth () {
      const outer = document.createElement('div');
      const inner = document.createElement('div');

      outer.style.visibility = 'hidden';
      outer.style.width = '100px';

      inner.style.width = '100%';

      outer.appendChild(inner);
      document.body.appendChild(outer);

      const widthWithoutScrollbar = outer.offsetWidth;
      outer.style.overflow = 'scroll';
      const widthWithScrollbar = inner.offsetWidth;
      document.body.removeChild(outer);

      return (widthWithoutScrollbar - widthWithScrollbar);
    },

    //make sure that the header and the body are aligned when scrolling horizontally on a table that is wider than the viewport
    handleScroll (e) {
      let horizontal = e.currentTarget.scrollLeft;

      //don't modify header scroll if we are scrolling vertically
      if (horizontal != this.lastScrollPosition) {
        let header = this.$el.getElementsByClassName('vuetable-head-wrapper')[0]
        if (header != null) {
          header.scrollLeft = horizontal;
        }
        this.lastScrollPosition = horizontal;
      }
    },

    mergeCss () {
      this.$_css = { ...CssSemanticUI.table, ...this.css }
    },

    bodyClass (base, field) {
      return [ base, field.dataClass ]
    },

    normalizeFields () {
      if (typeof(this.fields) === 'undefined') return

      this.tableFields = []

      this.fields.forEach( (field, i) => {
        this.tableFields.push(this.newField(field, i))
      })
    },

    newField (field, index) {
      let defaultField = {
        name: '',
        // title:
        // this allow the code to detect undefined title
        // and replace it with capitalized name instead
        titleClass: '',
        dataClass: '',
        sortField: null,
        formatter: null,
        visible: true,
        width: null,
        $_index: index,
      }

      if (typeof(field) === 'string') {
        return Object.assign({}, defaultField, {
          name: this.normalizeFieldName(field),
          title: this.makeTitle(field),
        })
      }

      let obj = Object.assign({}, defaultField, field)
      obj.name = this.normalizeFieldName(obj.name)
      if (obj.title === undefined) {
        obj.title = this.makeTitle(obj.name)
      }
      if (obj.formatter !== null && typeof(obj.formatter) !== 'function') {
        console.error(obj.name + ' field formatter must be a function')
        obj.formatter = null
      }
      return obj
    },

    normalizeFieldName (fieldName) {
      if (fieldName instanceof Object) return fieldName

      return typeof(fieldName) === 'string' && fieldName.replace('__', this.fieldPrefix)
    },

    setData (data) {
      if (data === null || typeof(data) === 'undefined') return

      this.tableData = !this.draggable && this.sortOrder ? orderByLodash(data, this.sortOrder.sortField, this.sortOrder.direction) : data
    },

    makeTitle (str) {
      if (this.isFieldComponent(str)) {
        return ''
      }

      return this.titleCase(str.replace('.', ' '))
    },

    getFieldTitle (field) {
      if (typeof(field.title) === 'function') return field.title()

      return field.title
    },

    renderNormalField (field, item) {
      return this.hasFormatter(field)
        ? this.callFormatter(field, item)
        : this.getObjectValue(item, field.name, '')
    },

    isFieldComponent (fieldName) {
      if (fieldName instanceof Object) {
        // let's assume it is a Vue component
        return true
      }

      return fieldName.slice(0, this.fieldPrefix.length) === this.fieldPrefix
        || fieldName.slice(0, 2) === '__'
    },

    isFieldSlot (fieldName) {
      return typeof this.$scopedSlots[fieldName] !== 'undefined'
    },

    titleCase (str) {
      return str.replace(/\w+/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    },

    camelCase (str, delimiter = '_') {
      return str.split(delimiter).map( (item) => self.titleCase(item) ).join('')
    },

    updateHeader () {
      // $nextTick doesn't seem to work in all cases. This might be because
      // $nextTick is finished before the transition element (just my guess)
      //
      // the scrollHeight value does not yet changed, causing scrollVisible
      // to remain "true", therefore, the header gutter never gets updated
      // to reflect the display of scrollbar in the table body.
      // setTimeout 80ms seems to work in this case.
      setTimeout(this.checkScrollbarVisibility, 80)
    },

    checkScrollbarVisibility () {
      this.$nextTick( () => {
        let elem = this.$el.getElementsByClassName('vuetable-body-wrapper')[0]
        if (elem != null) {
          this.scrollVisible = (elem.scrollHeight > elem.clientHeight)
          this.fireEvent('scrollbar-visible', this.scrollVisible)
        }
      })
    },

    fireEvent () {
      if (arguments.length === 1) {
        return this.$emit(this.eventPrefix + arguments[0])
      }

      if (arguments.length > 1) {
        let args = Array.from(arguments)
        args[0] = this.eventPrefix + args[0]
        return this.$emit.apply(this, args)
      }
    },

    isSortable (field) {
      return field.sortField !== null
    },

    orderBy (field) {
      if (!this.isSortable(field)) return

      this.sortData(field)

      this.currentPage = 1    // reset page index

      this.setData(this.data)
    },

    sortData (field) {
      if (!this.sortOrder) {
        this.sortOrder = {
          field: field.name,
          sortField: field.sortField,
          direction: 'asc'
        };
        return
      }

      if (this.sortOrder.field === field.name && this.sortOrder.sortField === field.sortField) {
        // change sort direction
        this.sortOrder.direction = this.sortOrder.direction === 'asc' ? 'desc' : 'asc'
      } else {
        // reset sort direction
        this.sortOrder.direction = 'asc'
      }
      this.sortOrder.field = field.name
      this.sortOrder.sortField = field.sortField
    },

    hasFormatter (item) {
      return typeof(item.formatter) === 'function'
    },

    callFormatter (field, item) {
      if ( ! this.hasFormatter(field)) return

      if (typeof(field.formatter) === 'function') {
       return field.formatter(this.getObjectValue(item, field.name), this)
      }
    },

    getObjectValue (object, path, defaultValue) {
      defaultValue = (typeof defaultValue === 'undefined') ? null : defaultValue

      let obj = object
      if (path.trim() != '') {
        let keys = path.split('.')
        keys.forEach( (key) => {
          if (obj !== null && typeof obj[key] !== 'undefined' && obj[key] !== null) {
            obj = obj[key]
          } else {
            obj = defaultValue
            return
          }
        })
      }
      return obj
    },

    selectId (key) {
      if ( ! this.isSelectedRow(key)) {
        this.selectedTo.push(key)
      }
    },

    unselectId (key) {
      this.selectedTo = this.selectedTo.filter( (item) => {
        return item !== key
      })
    },

    isSelectedRow (key) {
      return this.selectedTo.indexOf(key) >= 0
    },

    clearSelectedValues () {
      this.selectedTo = []
    },

    gotoPreviousPage () {
      if (this.currentPage > 1) {
        this.currentPage--
        this.setData(this.data)
      }
    },

    gotoNextPage () {
      if (this.currentPage < this.tablePagination.last_page) {
        this.currentPage++
        this.setData(this.data)
      }
    },

    gotoPage (page) {
      if (page != this.currentPage && (page >= 1 && page <= this.tablePagination.last_page)) {
        this.currentPage = page
        this.setData(this.data)
      }
    },

    isVisibleDetailRow (rowId) {
      return this.visibleDetailRows.indexOf( rowId ) >= 0
    },

    showDetailRow (rowId) {
      if (!this.isVisibleDetailRow(rowId)) {
        this.visibleDetailRows.push(rowId)
      }
      this.checkScrollbarVisibility()
    },

    hideDetailRow (rowId) {
      if (this.isVisibleDetailRow(rowId)) {
        this.visibleDetailRows.splice(
          this.visibleDetailRows.indexOf(rowId),
          1
        )
        this.updateHeader()
      }
    },

    toggleDetailRow (rowId) {
      if (this.isVisibleDetailRow(rowId)) {
        this.hideDetailRow(rowId)
      } else {
        this.showDetailRow(rowId)
      }
    },

    showField (index) {
      if (index < 0 || index > this.tableFields.length) return

      this.tableFields[index].visible = true
    },

    hideField (index) {
      if (index < 0 || index > this.tableFields.length) return

      this.tableFields[index].visible = false
    },

    toggleField (index) {
      if (index < 0 || index > this.tableFields.length) return

      this.tableFields[index].visible = ! this.tableFields[index].visible
    },

    makePagination (total = null, perPage = null, currentPage = null) {
      let pagination = {}
      total = total === null ? 0 : total
      perPage = perPage === null ? this.perPage : perPage
      currentPage = currentPage === null ? this.currentPage : currentPage

      return {
        'total': total,
        'per_page': perPage,
        'current_page': currentPage,
        'last_page': Math.ceil(total / perPage) || 0,
        'next_page_url': '',
        'prev_page_url': '',
        'from': (currentPage -1) * perPage +1,
        'to': Math.min(currentPage * perPage, total)
      }
    },

    setupSortOrder () {
      const field = this.fields.find(field => field.sortField === this.defaultSortBy)
      this.sortData(field)
    },

    isObject (unknown) {
      return typeof(unknown) === "object" && unknown !== null
    },

    isPromiseObject (unknown) {
      return this.isObject(unknown) && typeof(unknown.then) === "function"
    },

    onRowClass (dataItem, index) {
      if (typeof(this.rowClass) === 'function') {
        return this.rowClass(dataItem, index)
      }

      return this.rowClass
    },

    onRowClicked (dataItem, dataIndex, event) {
      this.fireEvent('row-clicked', { data: dataItem, index: dataIndex, event: event })
      return true
    },

    onDetailRowClick (dataItem, dataIndex, event) {
      this.fireEvent('detail-row-clicked', { data: dataItem, index: dataIndex, event: event })
    },

    onCellClicked (dataItem, dataIndex, field, event) {
      this.fireEvent('cell-clicked', { data: dataItem, index: dataIndex, field: field, event: event })
    },

    onCellDoubleClicked (dataItem, dataIndex, field, event) {
      this.fireEvent('cell-dblclicked', { data: dataItem, index: dataIndex, field: field, event: event })
    },

    onCellRightClicked (dataItem, dataIndex, field, event) {
      this.fireEvent('cell-rightclicked', { data: dataItem, index: dataIndex, field: field, event: event })
    },

    onFieldEvent (type, payload) {
      this.fireEvent('field-event', type, payload, this)
    },

    onHeaderEvent (type, payload) {
      this.fireEvent('header-event', type, payload, this)
    },

    onCheckboxToggled (isChecked, fieldName, dataItem) {
      let idColumn = this.trackBy

      if (dataItem[idColumn] === undefined) return

      let key = dataItem[idColumn]
      if (isChecked) {
        this.selectId(key)
      } else {
        this.unselectId(key)
      }

      this.fireEvent('checkbox-toggled', isChecked, fieldName)
    },

    onCheckboxToggledAll (isChecked) {
      let idColumn = this.trackBy

      if (isChecked) {
        this.tableData.forEach( (dataItem) => {
          this.selectId(dataItem[idColumn])
        })
      } else {
        this.tableData.forEach( (dataItem) => {
          this.unselectId(dataItem[idColumn])
        })
      }

      this.fireEvent('checkbox-toggled-all', isChecked)
    },

    /*
     * API for externals
     */
    changePage (page) {
      if (page === 'prev') {
        this.gotoPreviousPage()
      } else if (page === 'next') {
        this.gotoNextPage()
      } else {
        this.gotoPage(page)
      }
    },

    reload () {
      return this.setData(this.data)
    },

    refresh () {
      this.currentPage = 1
      return this.setData(this.data)
    },

    resetData () {
      this.tableData = null
      this.tablePagination = null
      this.fireEvent('data-reset')
    },
  }, // end: methods
}
</script>

<style>
  [v-cloak] {
    display: none;
  }
  table.vuetable.fixed-header {
    table-layout: fixed;
  }
  .vuetable th.sortable:hover {
    color: #2185d0;
    cursor: pointer;
  }
  .vuetable-head-wrapper {
    overflow-x: hidden;
  }
  .vuetable-head-wrapper table.vuetable {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .vuetable-body-wrapper.fixed-header {
    position:relative;
    overflow-y:auto;
  }
  .vuetable-body-wrapper table.vuetable.fixed-header {
    border-top:none !important;
    margin-top:0 !important;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .vuetable-empty-result {
    text-align: center;
  }
</style>

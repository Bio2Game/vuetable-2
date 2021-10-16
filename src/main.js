import Vue from "vue";
import Vuetable from "./components/Vuetable.vue";
import VuetablePagination from "./components/VuetablePagination.vue";
import VuetablePaginationDropdown from "./components/VuetablePaginationDropdown.vue";
import VuetablePaginationInfo from "./components/VuetablePaginationInfo.vue";

import VuetableFieldCheckbox from "./components/VuetableFieldCheckbox.vue";
import VuetableFieldHandle from "./components/VuetableFieldHandle";
import VuetableFieldSequence from "./components/VuetableFieldSequence.vue";

Vue.component("vuetable-field-checkbox", VuetableFieldCheckbox);
Vue.component("vuetable-field-handle", VuetableFieldHandle);
Vue.component("vuetable-field-sequence", VuetableFieldSequence);

let E_SERVER_ERROR = "Error communicating with the server";

Vue.component("custom-actions", {
  template: [
    "<div>",
    '<button class="ui red button" @click="onClick(\'view-item\', rowData)"><i class="zoom icon"></i></button>',
    '<button class="ui blue button" @click="onClick(\'edit-item\', rowData)"><i class="edit icon"></i></button>',
    '<button class="ui green button" @click="onClick(\'delete-item\', rowData)"><i class="delete icon"></i></button>',
    "</div>",
  ].join(""),
  props: {
    rowData: {
      type: Object,
      required: true,
    },
  },
  methods: {
    onClick(action, data) {
      console.log("actions: on-click", data.name);
      sweetAlert(action, data.name);
    },
  },
});

Vue.component("my-detail-row", {
  template: [
    '<div @click="onClick">',
    '<div class="inline field">',
    "<label>Name: </label>",
    "<span>{{rowData.name}}</span>",
    "</div>",
    '<div class="inline field">',
    "<label>Email: </label>",
    "<span>{{rowData.email}}</span>",
    "</div>",
    '<div class="inline field">',
    "<label>Nickname: </label>",
    "<span>{{rowData.nickname}}</span>",
    "</div>",
    '<div class="inline field">',
    "<label>Birthdate: </label>",
    "<span>{{rowData.birthdate}}</span>",
    "</div>",
    '<div class="inline field">',
    "<label>Gender: </label>",
    "<span>{{rowData.gender}}</span>",
    "</div>",
    "</div>",
  ].join(""),
  props: {
    rowData: {
      type: Object,
      required: true,
    },
  },
  methods: {
    onClick(event) {
      console.log("my-detail-row: on-click", event.target);
    },
  },
});

Vue.component("settings-modal", {
  template: `
    <div class="ui small modal" id="settingsModal">
      <div class="header">Settings</div>
      <div class="content ui form">
        <div class="field">
          <div class="ui checkbox">
            <input type="checkbox" v-model="$parent.multiSort">
            <label>Multisort (use Alt+Click)</label>
          </div>
        </div>
        <div class="ui divider"></div>
        <div class="field">
          <label>Pagination:</label>
          <select class="ui simple dropdown" v-model="$parent.paginationComponent">
            <option value="vuetable-pagination">vuetable-pagination</option>
            <option value="vuetable-pagination-dropdown">vuetable-pagination-dropdown</option>
          </select>
        </div>
        <div class="field">
          <label>Per Page:</label>
          <select class="ui simple dropdown" v-model="$parent.perPage">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="20">20</option>
            <option :value="25">25</option>
          </select>
        </div>
        <div class="ui fluid card">
          <div class="content">
            <div class="header">Visible fields</div>
          </div>
          <div v-if="vuetableFields" class="content">
            <div v-for="(field, idx) in vuetableFields" class="field">
              <div class="ui checkbox">
                <input type="checkbox" :checked="field.visible" @change="toggleField(idx, $event)">
                <label>{{ getFieldTitle(field) }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui cancel button">Close</div>
      </div>
    </div>
  `,
  props: ["vuetableFields", "fieldPrefix"],
  data() {
    return {};
  },
  methods: {
    getFieldTitle(field) {
      if (typeof field.title === "function") return field.title(true);

      let title = field.title;
      if (title !== "") return this.stripHTML(title);

      title = "";
      if (field.name.slice(0, 2) === this.fieldPrefix) {
        title =
          field.name.indexOf(":") >= 0
            ? field.name.split(":")[1]
            : field.name.replace(this.fieldPrefix, "");
      }

      return title;
    },
    stripHTML(str) {
      return str ? str.replace(/(<([^>]+)>)/gi, "") : "";
    },
    toggleField(index, event) {
      console.log("toggleField: ", index, event.target.checked);
      this.$parent.$refs.vuetable.toggleField(index);
    },
  },
});

let dataFields = [
  {
    name: "__handle",
    width: "40px",
  },
  {
    name: "__sequence",
    title: "No.",
    width: "50px",
    titleClass: "right aligned",
    dataClass: "right aligned",
  },
  {
    name: "__checkbox",
    title: "checkbox",
    width: "30px",
    titleClass: "center aligned",
    dataClass: "center aligned",
  },
  {
    name: "id",
    title: '<i class="unordered list icon"></i> Detail',
    width: "80px",
    dataClass: "center aligned",
    formatter: (value, vuetable) => {
      let icon = "down";
      return [
        '<a class="show-detail-row">',
        '<i class="chevron circle ' + icon + ' icon"></i>',
        "</a>",
      ].join("");
    },
  },
  {
    name: "name",
    title: '<i class="book icon"></i> Full Name',
    sortField: "name",
    width: "150px",
    filterable: true,
  },
  {
    name: "email",
    title: '<i class="mail outline icon"></i> Email',
    sortField: "email",
    width: "200px",
    visible: true,
    filterable: true,
  },
  {
    name: "nickname",
    title: (nameOnly = false) => {
      return nameOnly ? "Nickname" : `<i class="paw icon"></i> Nickname`;
    },
    sortField: "nickname",
    width: "120px",
    formatter: (value) => {
      return value.toUpperCase();
    },
    filterable: true,
  },
  {
    name: "birthdate",
    title: (nameOnly = false) => {
      return nameOnly
        ? "Birthdate"
        : `<i class="orange birthday icon"></i> Birthdate`;
    },
    width: "100px",
    sortField: "birthdate",
    formatter: (value) => {
      if (value === null) return "";
      return moment(value, "YYYY-MM-DD").format("D MMM YYYY");
    },
    filterable: true,
  },
  {
    name: "gender",
    title: "Gender",
    sortField: "gender",
    width: "100px",
    titleClass: "center aligned",
    dataClass: "center aligned",
    formatter: (value) => {
      return value === "M"
        ? '<span class="ui teal label"><i class="male icon"></i>Male</span>'
        : '<span class="ui pink label"><i class="female icon"></i>Female</span>';
    },
    filterable: true,
  },
  {
    name: "slot-actions",
    title: "Actions",
    width: "140px",
    titleClass: "center aligned",
    dataClass: "center aligned",
  },
];

/* eslint-disable no-new */
new Vue({
  el: "#app",
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationDropdown,
    VuetablePaginationInfo,
  },
  data: {
    loading: "",
    searchFor: "",
    moreParams: {},
    fields: dataFields,
    tableHeight: "600px",
    vuetableFields: false,
    fieldPrefix: "vuetable-",
    sortOrder: [
      {
        field: "name",
        direction: "asc",
      },
    ],
    multiSort: true,
    paginationComponent: "vuetable-pagination",
    perPage: 10,
    paginationInfoTemplate:
      "Showing record: {from} to {to} from {total} item(s)",
    myData: [
      {
        id: 1,
        name: "Noelia O'Kon",
        nickname: "asperiores",
        email: "otho.smitham@example.com",
        birthdate: "1978-06-28 00:00:00",
        gender: "F",
        salary: "13098.00",
        group_id: 2,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 42,
        group: { id: 2, name: "Exec", description: "Executives" },
        address: {
          id: 1,
          user_id: 1,
          line1: "0888 Aniyah Locks\nLake Bridie, NJ 51086",
          line2: "Cayman Islands",
          zipcode: "92991-2805",
          mobile: "1-742-816-9238x848",
          fax: "(484)438-4697x8638",
        },
      },
      {
        id: 2,
        name: "Mr. Enid Von PhD",
        nickname: "alias",
        email: "pollich.cecilia@example.com",
        birthdate: "1990-09-18 00:00:00",
        gender: "M",
        salary: "35978.00",
        group_id: 4,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 30,
        group: { id: 4, name: "Sup", description: "Supervisors" },
        address: {
          id: 2,
          user_id: 2,
          line1: "59732 Iva Spur Suite 468\nEast Hortenseton, VA 70087",
          line2: "Cayman Islands",
          zipcode: "41967",
          mobile: "1-913-407-7558x503",
          fax: "(388)906-8002",
        },
      },
      {
        id: 3,
        name: "Colton Koch",
        nickname: "id",
        email: "little.myrna@example.net",
        birthdate: "1968-10-29 00:00:00",
        gender: "F",
        salary: "26278.00",
        group_id: 3,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 52,
        group: { id: 3, name: "Mgr", description: "Managers" },
        address: {
          id: 3,
          user_id: 3,
          line1: "539 Conn Locks Suite 801\nTobinfort, IL 37047-5508",
          line2: "Antigua and Barbuda",
          zipcode: "51722-4502",
          mobile: "557.845.1830x844",
          fax: "1-831-304-7444x73027",
        },
      },
      {
        id: 4,
        name: "Gregory Vandervort",
        nickname: "vel",
        email: "dock47@example.org",
        birthdate: "1989-12-12 00:00:00",
        gender: "M",
        salary: "25537.00",
        group_id: 3,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 31,
        group: { id: 3, name: "Mgr", description: "Managers" },
        address: {
          id: 4,
          user_id: 4,
          line1: "916 Rosemary Forge\nKreigerton, MT 24207",
          line2: "Uganda",
          zipcode: "67639-6707",
          mobile: "766.431.9121",
          fax: "(154)336-3674x08451",
        },
      },
      {
        id: 5,
        name: "Miss Rahsaan Heaney IV",
        nickname: "qui",
        email: "ugrady@example.org",
        birthdate: "1995-11-27 00:00:00",
        gender: "F",
        salary: "49003.00",
        group_id: 2,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 25,
        group: { id: 2, name: "Exec", description: "Executives" },
        address: {
          id: 5,
          user_id: 5,
          line1: "91792 Kertzmann Prairie Apt. 376\nLake Nakiaville, DC 98189",
          line2: "Jamaica",
          zipcode: "10101-1450",
          mobile: "07507519787",
          fax: "+24(9)5120507985",
        },
      },
      {
        id: 6,
        name: "Ms. Crystel Zemlak IV",
        nickname: "reiciendis",
        email: "amari.rau@example.com",
        birthdate: "1968-09-12 00:00:00",
        gender: "F",
        salary: "12383.00",
        group_id: 4,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 52,
        group: { id: 4, name: "Sup", description: "Supervisors" },
        address: {
          id: 6,
          user_id: 6,
          line1: "97650 Scot Haven Apt. 160\nCrawfordmouth, ME 39767-7003",
          line2: "Finland",
          zipcode: "88917",
          mobile: "1-851-069-9234x9566",
          fax: "(048)445-4691x33356",
        },
      },
      {
        id: 7,
        name: "Nona McDermott",
        nickname: "quaerat",
        email: "adrien.baumbach@example.org",
        birthdate: "1985-10-01 00:00:00",
        gender: "F",
        salary: "18512.00",
        group_id: 4,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 35,
        group: { id: 4, name: "Sup", description: "Supervisors" },
        address: {
          id: 7,
          user_id: 7,
          line1: "4332 Alvina Radial\nPort Darbyville, IA 63357",
          line2: "Barbados",
          zipcode: "79679",
          mobile: "(736)058-1324",
          fax: "002.234.8466x49816",
        },
      },
      {
        id: 8,
        name: "Miss Genoveva Murazik V",
        nickname: "rerum",
        email: "ohettinger@example.net",
        birthdate: "1988-10-19 00:00:00",
        gender: "F",
        salary: "31209.00",
        group_id: 2,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 32,
        group: { id: 2, name: "Exec", description: "Executives" },
        address: {
          id: 8,
          user_id: 8,
          line1: "96418 Ritchie Mall Apt. 215\nLake Jessyca, VT 65970-8256",
          line2: "Netherlands Antilles",
          zipcode: "94649-6628",
          mobile: "472.825.7183",
          fax: "400-507-7463",
        },
      },
      {
        id: 9,
        name: "Beulah Huels",
        nickname: "non",
        email: "stefan99@example.com",
        birthdate: "1963-09-04 00:00:00",
        gender: "F",
        salary: "36920.00",
        group_id: 5,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 57,
        group: { id: 5, name: "Emp", description: "Employees" },
        address: {
          id: 9,
          user_id: 9,
          line1: "18890 Carroll Lakes Suite 355\nUptonchester, UT 94878-0739",
          line2: "Hong Kong",
          zipcode: "91204",
          mobile: "831.652.0832",
          fax: "(688)788-8947",
        },
      },
      {
        id: 10,
        name: "Zoe Klein",
        nickname: "ex",
        email: "ejacobson@example.org",
        birthdate: "1990-04-19 00:00:00",
        gender: "F",
        salary: "35616.00",
        group_id: 3,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 30,
        group: { id: 3, name: "Mgr", description: "Managers" },
        address: {
          id: 10,
          user_id: 10,
          line1: "6721 Nader Summit\nLake Alana, MS 84476",
          line2: "Reunion",
          zipcode: "77124-1459",
          mobile: "1-129-438-6148",
          fax: "(913)441-3846",
        },
      },
      {
        id: 11,
        name: "Vickie Kiehn",
        nickname: "assumenda",
        email: "ayost@example.com",
        birthdate: "1988-04-20 00:00:00",
        gender: "F",
        salary: "30790.00",
        group_id: 3,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 32,
        group: { id: 3, name: "Mgr", description: "Managers" },
        address: {
          id: 11,
          user_id: 11,
          line1: "763 McCullough Ville\nNew Thomasstad, HI 64611",
          line2: "Oman",
          zipcode: "00642",
          mobile: "1-296-172-2126x275",
          fax: "(559)203-8694",
        },
      },
      {
        id: 12,
        name: "Elwyn Herzog",
        nickname: "praesentium",
        email: "ckassulke@example.net",
        birthdate: "1990-01-22 00:00:00",
        gender: "M",
        salary: "35785.00",
        group_id: 1,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 31,
        group: { id: 1, name: "Admin", description: "Administrators" },
        address: {
          id: 12,
          user_id: 12,
          line1: "65641 Baron Spurs Suite 988\nNorth Ivah, IA 92235",
          line2: "Nepal",
          zipcode: "90316-7411",
          mobile: "064.482.9432x9456",
          fax: "05936098280",
        },
      },
      {
        id: 13,
        name: "Selena Hettinger",
        nickname: "et",
        email: "bashirian.hyman@example.net",
        birthdate: "1981-10-01 00:00:00",
        gender: "F",
        salary: "31836.00",
        group_id: 5,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 39,
        group: { id: 5, name: "Emp", description: "Employees" },
        address: {
          id: 13,
          user_id: 13,
          line1:
            "42272 Stoltenberg Points Suite 006\nLake Dustin, NH 70213-2043",
          line2: "Uganda",
          zipcode: "60996-2982",
          mobile: "(508)122-5892",
          fax: "356-682-2023x07379",
        },
      },
      {
        id: 14,
        name: "Edwin Beier",
        nickname: "eos",
        email: "janis71@example.org",
        birthdate: "1978-10-13 00:00:00",
        gender: "M",
        salary: "11902.00",
        group_id: 1,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 42,
        group: { id: 1, name: "Admin", description: "Administrators" },
        address: {
          id: 14,
          user_id: 14,
          line1: "362 Trantow Loop Apt. 150\nLake Marafurt, DC 27926",
          line2: "Gabon",
          zipcode: "36943-1099",
          mobile: "033-386-4972x26066",
          fax: "1-363-037-1381",
        },
      },
      {
        id: 15,
        name: "Lexi Braun MD",
        nickname: "autem",
        email: "dusty74@example.net",
        birthdate: "1971-12-07 00:00:00",
        gender: "F",
        salary: "11927.00",
        group_id: 4,
        created_at: "2017-01-01 07:21:10",
        updated_at: "2017-01-01 07:21:10",
        age: 49,
        group: { id: 4, name: "Sup", description: "Supervisors" },
        address: {
          id: 15,
          user_id: 15,
          line1: "6737 Schimmel Crossing Suite 720\nShieldsberg, AK 44558",
          line2: "Tanzania",
          zipcode: "75615",
          mobile: "338.920.3112",
          fax: "(467)912-6668",
        },
      },
    ],
  },
  watch: {
    perPage(val, oldVal) {
      this.$nextTick(function () {
        this.$refs.vuetable.refresh();
      });
    },
    paginationComponent(val, oldVal) {
      this.$nextTick(function () {
        this.$refs.pagination.setPaginationData(
          this.$refs.vuetable.tablePagination
        );
      });
    },
  },
  methods: {
    transform(data) {
      let transformed = {};
      transformed.pagination = {
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
        from: data.from,
        to: data.to,
      };

      transformed.data = [];
      data = data.data;
      for (let i = 0; i < data.length; i++) {
        transformed["data"].push({
          id: data[i].id,
          name: data[i].name,
          nickname: data[i].nickname,
          email: data[i].email,
          age: data[i].age,
          birthdate: data[i].birthdate,
          gender: data[i].gender,
          address:
            data[i].address.line1 +
            " " +
            data[i].address.line2 +
            " " +
            data[i].address.zipcode,
        });
      }

      return transformed;
    },
    showSettingsModal() {
      let self = this;
      $("#settingsModal")
        .modal({
          detachable: true,
          onVisible() {
            $(".ui.checkbox").checkbox();
          },
        })
        .modal("show");
    },
    showLoader() {
      this.loading = "loading";
    },
    hideLoader() {
      this.loading = "";
    },
    preg_quote(str) {
      // http://kevin.vanzonneveld.net
      // +   original by: booeyOH
      // +   improved by: Ates Goral (http://magnetiq.com)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Onno Marsman
      // *     example 1: preg_quote("$40");
      // *     returns 1: '\$40'
      // *     example 2: preg_quote("*RRRING* Hello?");
      // *     returns 2: '\*RRRING\* Hello\?'
      // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
      // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

      return (str + "").replace(
        /([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,
        "\\$1"
      );
    },
    highlight(needle, haystack) {
      return haystack.replace(
        new RegExp("(" + this.preg_quote(needle) + ")", "ig"),
        '<span class="highlight">$1</span>'
      );
    },
    rowClassCB(data, index) {
      return index % 2 === 0 ? "odd" : "even";
    },
    onCellClicked(data, field, event) {
      console.log("cellClicked", field.name);
      if (field.name !== this.fieldPrefix + "actions") {
        this.$refs.vuetable.toggleDetailRow(data.id);
      }
    },
    onCellDoubleClicked(data, field, event) {
      console.log("cellDoubleClicked:", field.name);
    },
    onCellRightClicked(data, field, event) {
      console.log("cellRightClicked:", field.name);
    },
    onLoadSuccess(response) {
      // set pagination data to pagination-info component
      this.$refs.paginationInfo.setPaginationData(response.data);

      let data = response.data.data;
      if (this.searchFor !== "") {
        for (let n in data) {
          data[n].name = this.highlight(this.searchFor, data[n].name);
          data[n].email = this.highlight(this.searchFor, data[n].email);
        }
      }
    },
    onLoadError(response) {
      if (response.status == 400) {
        sweetAlert("Something's Wrong!", response.data.message, "error");
      } else {
        sweetAlert("Oops", E_SERVER_ERROR, "error");
      }
    },
    onPaginationData(tablePagination) {
      this.$refs.paginationInfo.setPaginationData(tablePagination);
      this.$refs.pagination.setPaginationData(tablePagination);
    },
    onChangePage(page) {
      this.$refs.vuetable.changePage(page);
    },
    onInitialized(fields) {
      console.log("onInitialized", fields);
      this.vuetableFields = fields;
    },
    onDataReset() {
      console.log("onDataReset");
      this.$refs.paginationInfo.resetData();
      this.$refs.pagination.resetData();
    },
    onActionClicked(action, data) {
      console.log("slot actions: on-click", data.name);
      sweetAlert(action, data.name);
    },
    onFieldEvent(type, payload, vuetable) {
      if (type === "checkbox-toggled") {
        vuetable.onCheckboxToggled(
          payload.isChecked,
          payload.field,
          payload.dataItem
        );
      } else if (type === "checkbox-toggled-all") {
        vuetable.onCheckboxToggledAll(payload.isChecked, payload.field);
      }
    },
    onHeaderEvent(type, payload) {
      console.log("onHeaderEvent:", type, payload);
      let vuetable = this.$refs.vuetable;
      switch (type) {
        case "order-by":
          vuetable.orderBy(payload.field, payload.event);
          break;
        case "refresh":
          vuetable.refresh();
          break;
        case "add-sort-column":
          vuetable.addSortColumn(payload.field, payload.direction);
          break;
        case "remove-sort-column":
          vuetable.removeSortColumn(payload.index);
          break;
        case "set-sort-column":
          vuetable.setSortColumnDirection(payload.index, payload.direction);
          break;
        case "clear-sort-column":
          vuetable.clearSortOrder();
          break;
        case "toggle-row":
          vuetable.onCheckboxToggled(
            payload.isChecked,
            payload.field,
            payload.dataItem
          );
          break;
        case "toggle-all-rows":
          vuetable.onCheckboxToggledAll(payload.isChecked, payload.field);
          break;
        default:
          console.log("Unhandled event: ", type, payload);
      }
    },
  },
});

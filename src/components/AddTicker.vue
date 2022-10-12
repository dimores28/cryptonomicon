<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="input"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="ticker !== ''"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            v-for="el in autocomplete"
            :key="el.Symbol"
            @click="addAutocomplete(el.Symbol)"
          >
            {{ el.Symbol }}
          </span>
        </div>
        <div v-if="isAdded" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add" type="button" :disabled="disabled" class="my-4">
      Добавить
    </add-button>
  </section>
</template>

<script>
import AddButton from "@/components/AddButton";
export default {
  name: "AddTicker",
  components: {
    AddButton
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    isAdded: {
      type: Boolean,
      required: false,
      default: false
    },
    autocomplete: {
      type: Array,
      required: false,
      default: null
    }
  },
  emits: {
    "add-ticker": value => typeof value === "string" && value.length > 0,
    "input-ticker-name": value => typeof value === "string"
  },
  data() {
    return {
      ticker: ""
    };
  },
  methods: {
    add() {
      if (this.ticker.length === 0) {
        return;
      }

      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },
    input() {
      this.$emit("input-ticker-name", this.ticker);
    },
    addAutocomplete(name) {
      this.ticker = name;

      this.add();
    }
  }
};
</script>

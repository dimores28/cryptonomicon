<template>
  <div class="overlay" v-if="open" @click.stop="overlayClick">
    <div class="modal" @click.stop>
      <h2></h2>
      <div class="modal__content">
        <slot></slot>
      </div>
      <div class="modal__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: {
    open: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  methods: {
    overlayClick() {
      this.$emit("close");
    }
  },
  watch: {
    open() {
      if (this.open) {
        this.$emit("open");
      } else {
        this.$emit("close");
      }
    }
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  width: 400px;
  padding: 32px 20px 20px;
  border: 5px solid #ddd;
  box-shadow: 0px 0px 20px #000;
}

.modal__footer {
  display: flex;
  justify-content: space-between;
}

.modal__btn_ok {
  padding: 8px 16px;
  background: rgb(49, 143, 5);
  border-radius: 6px;
}
</style>

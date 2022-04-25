<template>
    <v-row class="long-text">
      <div
        v-if="!isOpen"
        :style="{height: height+'px'}"
      >
        {{smallText}}
      </div>
      <div v-else>
        {{text}}
      </div>
      <v-fab-transition
        v-if="text.length>length"
      >
        <v-btn
          class="long-text--button"
          bottom
          right
          text
          fab
          x-small
          @click="isOpen=!isOpen"
        >
          <v-icon v-if="!isOpen">mdi-chevron-down</v-icon>
          <v-icon v-else>mdi-chevron-up</v-icon>
        </v-btn>
      </v-fab-transition>
    </v-row>
</template>

<script>
export default {
  name: 'long-text',
  props: {
    height: Number,
    text: String,
    length: Number,
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    smallText() {
      if (this.text.length > this.length) {
        return `${this.text.substr(0, this.length)}...`;
      }
      return this.text;
    },
  },
};
</script>

<style scoped>
  .long-text{
    padding: 0 30px 30px 30px;
    margin-top: 15px;
    position: relative;
  }
  .long-text--button{
    position: absolute;
    bottom: 0;
    right: 25px;
  }
</style>

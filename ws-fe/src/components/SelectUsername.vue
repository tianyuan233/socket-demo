<template>
  <div class="select-username">
      <input v-model="userName" placeholder="Your username..." />
      <button :disabled="!isValid" @click="onSubmit">Send</button>
  </div>
</template>

<script setup>
import {ref,computed} from 'vue'
const emit = defineEmits(['input'])
const userName = ref('')
const isValid = computed(()=>{
  return userName.value.length > 2;
})

const onSubmit = () => {
  emit("input", userName.value);
}
</script>

<script setup>

</script>

<style scoped>
.select-username {
  width: 300px;
  margin: 200px auto 0;
}
</style>

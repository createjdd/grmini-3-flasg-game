<template>
  <div>
    <!-- :onCustomVertify="onCustomVertify" -->
    <!--  -->
    <ImgVer :onRefresh="onRefresh" :visible="true" :onDraw="onDraw" :onFail="onFail" :onSuccess="onSuccess" />
  </div>
</template>
<script setup>
import ImgVer from './ImgVer.vue';

const onSuccess = (e) => {
  console.log('success');
  console.log(e);
};
const onFail = (e) => {
  console.log('fail');
  console.log(e);
};
const onRefresh = (e) => {
  console.log('refresh');
  console.log(e);
};
const onDraw = (e) => {
  console.log('draw');
  console.log(e);
};
const onCustomVertify = (e) => {
  console.log('customVertify');
  console.log(e);
  // return true;
  const { destX, left } = e;
  return destX > left;
};
</script>

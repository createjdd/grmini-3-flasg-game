<template>
  <div>
    <a href="/Scroll">Scroll</a>
    <p><a href="/ImgVer">Img</a></p>
    <p><a href="/image">image</a></p>
    <button id="btn">btn传递参数</button>

    <h3><button type="button" @click="captcha()">验证</button></h3>
  </div>
</template>
<script setup>
const captcha = () => {
  // 根据 poster 获取验证参数
  Slider = new langSlider({
    title: '滑块安全验证',
    start: function (Slider) {
      setTimeout(function () {
        Slider.sliderStart({
          sliderBg: 'https://picsum.photos/id/1062/340/251',
          sliderKey: '1212',
          sliderY: 46,
        });
      }, 1000);
    },
    check: function (sliderKey, sliderX, Slider) {
      // 模拟调用验证接口
      const check = () => {
        const leeway = 5; // 误差值
        const value = 208; // 正确值
        if (value >= sliderX - leeway && value <= sliderX + leeway) {
          // 成功调用该方法
          Slider.sliderSuccess();
        } else {
          // 错误调用该方法
          // 模拟调用获取验证参数接口
          setTimeout(function () {
            Slider.sliderError({
              sliderBg: 'https://picsum.photos/id/1062/340/251',
              sliderKey: '1212',
              sliderY: 46,
            });
          }, 1000);
        }
      };

      setTimeout(function () {
        check();
      }, 1000);
    },
    refresh: function (Slider) {
      setTimeout(function () {
        Slider.sliderRefresh({
          sliderBg: 'https://picsum.photos/id/1062/340/251',
          sliderKey: '1212',
          sliderY: 46,
        });
      }, 1000);
    },
  });
};
</script>

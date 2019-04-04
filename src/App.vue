<template>
  <div id="app">
    <h1 class="title">
      <img class="vue-logo" src="https://vuejs.org/images/logo.png" alt="" />
      <span>&nbsp;Memory Matrix</span>
    </h1>
    <div class="container">
      <game-info />
      <tile-box />
      <cover-screen />
    </div>
  </div>
</template>

<script>
import CoverScreen from './components/CoverScreen'
import GameInfo from './components/GameInfo'
import TileBox from './components/TileBox'

export default {
  name: 'app',
  components: {
    CoverScreen,
    GameInfo,
    TileBox
  }
}
</script>

<style>
#app {
  font-family: Roboto Slab, sans-serif;
  color: #2c3e50;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.title {
  margin: 20px;
  font-size: 3rem;
  font-weight: 300;
  text-align: center;
}
.vue-logo {
  position: relative;
  top: 10px;
  height: 55px;
}
.container {
  position: relative;
  overflow: hidden;
  margin: auto;
  max-width: 500px;
  height: 476px;
  background-color: #7a594e;
}
@media screen and (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }
  .vue-logo {
    height: 27px;
  }
}
</style>

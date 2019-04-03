<template>
  <div id="gameInfo" class="gameInfo" v-if="started">
    <div class="section">
      <span :key="index" v-for="index in 5" class="heart" :class="{broken: index <= 5 - life}" >
        <font-awesome-icon v-if="index > 5 - life" icon="heart" />
        <font-awesome-icon v-else icon="heart-broken" />
      </span>
    </div>
    <div class="section">
      LEVEL<span class="number">{{ level + 1 }}</span>
    </div>
    <div class="section">
      TILES<span class="number">{{ correctTileCount }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'gameInfo',
  computed: {
    ...mapState([
      'status',
      'level',
      'life',
      'correctTileCount'
    ]),
    started () {
      return this.status !== 'INIT'; 
    }
  },
}
</script>

<style>
.gameInfo {
  text-align: right;
}
.gameInfo .section {
  display: inline-block;
  position: relative;
  padding: 2px 10px;
  margin-right: 3px;
  font-size: 15px;
  font-weight: bolder;
  background: #f2f4f7;
}
.gameInfo .section:last-child {
  margin-right: 0;
}
.gameInfo .number {
  margin-left: 10px;
}
.heart {
  margin-right: 2px;
  transition: opacity .5s ease;
}
.heart.broken {
  opacity: 0;
}
</style>

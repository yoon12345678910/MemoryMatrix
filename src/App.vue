<template>
  <div id="app">
    <h1 class="title">
      <img class="vue-logo" src="https://vuejs.org/images/logo.png" />
      <span> Memory Matrix</span>
    </h1>
    <div class="container">
      <game-info 
        :level="level" 
        :correctTileCount="correctTileCount" 
        :life="life" />
      <tile-box
        :boxSize="calcBoxSize"
        :tiles="tiles"
        :didPass="didPass"
        :checkTile="checkTile" />
    </div>
  </div>
</template>

<script>
import { gameRoundData } from './gameRoundData'
import { DB } from './DB'
import GameInfo from './components/GameInfo'
import TileBox from './components/TileBox'

export default {
  name: 'app',
  components: {
    GameInfo,
    TileBox
  },
  data() {
    return({
      life: 5,
      level: 0,
      correctTileCount: 0,
      yourRightAnswerCount: 0,
      remainingClickCount: 0,
      levelIncPoint: 0,
      tiles: [],
      didPass: false
    });
  },
  created() {
    const loaded = DB.load();
    this.level = loaded === null ? 0 : loaded.level;
  },
  mounted() {
    this.startRound();
  },
  computed: {
    calcBoxSize: function () {
      const { nTile } = gameRoundData[this.level];
      return `${44 * nTile}px`; // 44 = tile width ( width + margin 2 * 2 )
    }
  },
  methods: {
    async startRound() {
      const {
        nTile,
        correctTileCount, 
        correctScreenTime
      } = gameRoundData[this.level];

      this.tiles = this.generateTiles(nTile, correctTileCount);
      this.didPass = false;
      this.remainingClickCount = 0;
      this.yourRightAnswerCount = 0;
      this.correctTileCount = correctTileCount;

      await this.asyncShowTileScreen(this.tiles, (tile => {
        return tile.isCorrect;
      }), correctScreenTime);
      this.remainingClickCount = correctTileCount;
    },
    async evaluateRound() {
      await this.asyncShowTileScreen(this.tiles, (tile => {
        return tile.isCorrect || tile.isSelected;
      }), 1500);
      await this.delay(500);
      if (this.didPass) {
        this.level = this.adjustLevel().up();
      } else {
        this.level = this.adjustLevel().down();
        this.life --;
      }

      DB.save({ level: this.level });

      if (this.life === 0) {
        alert('game over');
      } else {  
        this.startRound();
      }
    },
    generateTiles(nTile, correctTileCount) {
      const tiles = [];
      for (let i = 0; i < Math.pow(nTile, 2); i++) {
        tiles.push({
          index: i,
          isCorrect: false,
          isSelected: false,
          isLastClick: false
        });
      }
      while(correctTileCount > 0) {
        const tile = tiles[Math.floor(Math.random() * tiles.length)];
        if (!tile.isCorrect) {
          tile.isCorrect = true;
          correctTileCount --;
        }
      }
      return tiles;
    },
    checkTile(index) {
      const tile = this.tiles[index];
      if (tile.isSelected || this.remainingClickCount === 0) return;

      tile.isSelected = true;
      this.remainingClickCount --;
      if (tile.isCorrect) {
        this.yourRightAnswerCount ++;
      }
      if (this.remainingClickCount === 0) {
        const { correctTileCount } = gameRoundData[this.level];
        tile.isLastClick = true;
        this.didPass = this.yourRightAnswerCount === correctTileCount;
        this.evaluateRound();
      }
    },
    adjustLevel() {
      return {
        up: () => {
          if (this.levelIncPoint < 2) this.levelIncPoint ++;
          return this.level + (this.levelIncPoint === 2 ? 2 : 1);
        },
        down: () => {
          if (this.levelIncPoint > -1) this.levelIncPoint --;
          const level = this.level + (this.levelIncPoint === -1 ? -1 : 0);
          return level < 0 ? 0 : level;
        }
      }
    },
    delay(t, v) {
      return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
      });
    },
    asyncShowTileScreen(tiles, whichTile, timeTohidden) {
      return this.delay(500)
        .then(() => { // show
          this.tiles = tiles.map(tile => {
            return {
              ...tile,
              isSelected: whichTile.call(null, tile)
            };
          });
        })
        .then(() => { // hide
          return this.delay(timeTohidden)
          .then(() => {
            this.tiles = tiles.map(tile => {
              return {
                ...tile,
                isSelected: false
              };
            });
          });
        });
    },
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
  margin: auto;
  max-width: 500px;
  max-height: 500px;
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

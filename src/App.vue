<template>
  <div id="app">
    <h1 class="title">
      <img class="vue-logo" src="https://vuejs.org/images/logo.png" alt="" />
      <span>&nbsp;Memory Matrix</span>
    </h1>
    <div class="container">
      <game-info
        v-if="state !== 'INIT'"
        :level="level"
        :correctTileCount="correctTileCount"
        :life="life" />
      <tile-box
        v-if="state === 'ONGOING'"
        :tiles="tiles"
        :didPass="didPass"
        :checkTile="checkTile" />
      <cover-screen
        :state="state"
        :showFadeIn="coverScreenShowFadeIn"
        :loadedGame="level !== -1"
        :gameMode="gameMode()" />
    </div>
  </div>
</template>

<script>
import { DB } from './DB'
import { gameRoundData } from './gameRoundData'
import CoverScreen from './components/CoverScreen'
import GameInfo from './components/GameInfo'
import TileBox from './components/TileBox'

export default {
  name: 'app',
  components: {
    CoverScreen,
    GameInfo,
    TileBox
  },
  data: () => ({
    state: 'INIT',
    life: 0,
    level: -1,
    correctTileCount: 0,
    yourRightAnswerCount: 0,
    remainingClickCount: 0,
    levelIncPoint: 0,
    tiles: [],
    didPass: false,
    coverScreenShowFadeIn: false
  }),
  created() {
    const loaded = DB.load();
    if (loaded !== null) {
      this.level =  loaded.level;
    }
  },
  mounted() {
    this.delay(500)
      .then(() => {
        this.asyncToggleCoverScreen();
      });
  },
  methods: {
    gameMode() {
      return {
        new: async () => {
          await this.asyncToggleCoverScreen();
          DB.save({ level: -1 });
          this.level = 0;
          this.life = 5;
          this.startRound();
        },
        load: async () => {
          await this.asyncToggleCoverScreen();
          this.level = DB.load().level;
          this.life = 5;
          this.startRound();
        }
      }
    },
    async startRound() {
      const {
        nTile,
        correctTileCount,
        correctScreenTime
      } = gameRoundData[this.level];

      this.state = 'ONGOING';
      this.tiles = this.generateTiles(nTile, correctTileCount);
      this.didPass = false;
      this.remainingClickCount = 0;
      this.yourRightAnswerCount = 0;
      this.correctTileCount = correctTileCount;

      await this.asyncShowTileScreen(this.tiles, tile => tile.isCorrect, correctScreenTime);
      this.remainingClickCount = correctTileCount;
    },
    async evaluateRound() {
      await this.asyncShowTileScreen(this.tiles, tile => tile.isCorrect || tile.isSelected, 1500);
      await this.delay(500);

      if (this.didPass) {
        this.level = this.adjustLevel().up();
      } else {
        this.level = this.adjustLevel().down();
        this.life--;
      }

      if (!gameRoundData[this.level]) {
        this.state = 'COMPLETE';
        await this.delay(500);
        this.asyncToggleCoverScreen();
      } else if (this.life > 0) {
        this.startRound();
      } else {
        this.state = 'END';
        DB.save({ level: this.level });
        await this.delay(500);
        this.asyncToggleCoverScreen();
      }
    },
    generateTiles(nTile, correctTileCount) {
      let tiles = [];
      let tile = null;
      for (let i = 0; i < Math.pow(nTile, 2); i++) {
        tiles.push({
          index: i,
          isCorrect: false,
          isSelected: false,
          isLastClick: false
        });
      }
      while(correctTileCount > 0) {
        tile = tiles[Math.floor(Math.random() * tiles.length)];
        if (!tile.isCorrect) {
          tile.isCorrect = true;
          correctTileCount --;
        }
      }
      return tiles;
    },
    checkTile(index) {
      let tile = this.tiles[index];
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
        up () {
          if (this.levelIncPoint < 3) this.levelIncPoint ++;
          return this.level + (this.levelIncPoint === 3 ? 2 : 1);
        },
        down () {
          this.levelIncPoint = this.levelIncPoint > 0 ? 0 : -1;
          return this.level > 0 ? this.level + this.levelIncPoint : 0;
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
    asyncToggleCoverScreen() {
      this.coverScreenShowFadeIn = !this.coverScreenShowFadeIn;
      return this.delay(500);
    }
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

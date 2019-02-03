<template>
  <div id="app">
    <h1 class="title">
      <img class="vue-logo" src="https://vuejs.org/images/logo.png" />
      <span> Memory Matrix</span>
    </h1>
    <div class="container">
      <div class="info">
        <div>
          LEVEL<span>{{ level + 1 }}</span>
        </div>
        <div>
          TILES<span>{{ correctTileCount }}</span>
        </div>
      </div>
      <div class="boxWrapper">
        <div class="tileBox" :style="{width: calcBoxSize, height: calcBoxSize}" >
          <div :key="tile.id"
            v-for="(tile, index) in tiles"
            v-on:click="checkTile(index)" 
            class="tile flip-container">
            <div class="flipper" :class="{isSelected: tile.isSelected}">
              <div class="front"></div>
              <div class="back" :class="{
                correct: tile.isCorrect,
                wrong: !tile.isCorrect,
                endCorrect: didPass && tile.isLastClick}">
                <font-awesome-icon v-if="!tile.isCorrect" icon="times" />
                <font-awesome-icon v-if="didPass && tile.isLastClick" icon="check" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gameRoundData } from './gameRoundData';
import { DB } from './DB';
export default {
  name: 'app',
  data() {
    return({
      tiles: [],
      life: 5,
      level: 0,
      correctTileCount: 0,
      yourRightAnswerCount: 0,
      remainingClickCount: 0,
      levelIncPoint: 0,
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
.info {
  text-align: right;
}
.info div {
  display: inline-block;
  position: relative;
  padding: 2px 10px;
  right: 3px;
  font-size: 15px;
  font-weight: bolder;
  background: #f2f4f7;
}
.info div:last-child {
  right: 0;
}
.info span {
  margin-left: 10px;
}
.boxWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 476px;
}
.tileBox {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  margin-top: -10px;
  padding: 10px;
  background: #3a2a25;
  transition: all .2s ease-out;
}
.tile {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 2px;
  perspective: 1000px;
}
.tile .flipper {
	position: relative;
  width: 40px;
  height: 40px;
  transition: 0.5s;
	transform-style: preserve-3d;
}
.tile .flipper.isSelected {
  transform: rotateX(180deg);
}
.tile .flipper .front, .tile .flipper .back {
	position: absolute;
  width: 100%;
  height: 100%;
	top: 0;
	left: 0;
  backface-visibility: hidden;
}
.tile .front {
  z-index: 2;
  transform: rotateX(0deg);
  background: #714a43;
}
.tile .back {
  transform: rotateX(180deg);
}
.tile .back.correct {
  background: #4eafb5;
}
.tile .back.wrong {
  background: #ff7000;
}
.tile .back.endCorrect {
  background: #51a729;
}
.tile .back svg {
  padding: 10px;
  font-size: 20px;
  color: #feffff;
}
@media screen and (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }
  .vue-logo {
    height: 27px;
  }
}
@media (hover:hover) {
 .tile .front:hover {
    background: #9e7063;
  }
}
</style>

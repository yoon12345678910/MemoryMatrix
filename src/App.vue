<template>
  <div id="app">
    <h1 class="title">
      <img class="vue-logo" src="https://vuejs.org/images/logo.png" />
      <span> Memory Matrix</span>
    </h1>
    <div class="container">
      <div class="info">
        <div>
          LEVEL<span>{{level}}</span>
        </div>
        <div>
          TILES<span>{{correctTileCount}}</span>
        </div>
      </div>
      <div class="boxWrapper">
        <div class="tileBox" :style="{width: calcBoxSize}" >
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
import { gameLevel } from './gameLevel';
import { DB } from './DB';
export default {
  name: 'app',
  data() {
    return({
      life: 5,
      level: 0,
      nTile: 0, // actual tiles => n * n
      tiles: [],
      correctTileCount: 0,
      yourRightAnswerCount: 0,
      remainingClickCount: 0,
      correctScreenTime: 0,
      didPass: false,
      levelIncPoint: 0
    });
  },
  created() {
    const loaded = DB.load();
    const level = loaded === null ? 1 : loaded.level;
    this.adjustLevel().set(level);
  },
  mounted() {
    this.startRound();
  },
  computed: {
    calcBoxSize: function () {
      return `${44 * this.nTile}px`; // 44 = tile width ( width + margin 2 * 2 )
    }
  },
  methods: {
    async startRound() {
      this.tiles = this.generateTiles();
      this.didPass = false;
      this.remainingClickCount = 0;
      this.yourRightAnswerCount = 0;

      this.asyncShowCorrectScreen()
        .then(() => {
          this.remainingClickCount = this.correctTileCount;
        });
    },
    async evaluateRound() {
      this.asyncShowResultScreen()
        .then(() => {
          return this.delay(500)
            .then(() => {
              if (this.yourRightAnswerCount === this.correctTileCount) {
                this.adjustLevel().up();
              } else {
                this.adjustLevel().down();
                this.life --;
              }

              DB.save({ level: this.level });

              if (this.life === 0) {
                alert('game over');
              } else {
                this.startRound();
              }
            });
        });
    },
    generateTiles() {
      const tiles = [];
      const randomTileIndex = () =>  Math.floor(Math.random() * tiles.length);
      let correctTileCount = this.correctTileCount;

      for (let i = 0; i < Math.pow(this.nTile, 2); i++) {
        tiles.push({
          index: i,
          isCorrect: false,
          isSelected: false,
          isLastClick: false
        });
      }

      while(correctTileCount > 0) {
        const tile = tiles[randomTileIndex()];
        if (!tile.isCorrect) {
          tile.isCorrect = true;
          correctTileCount --;
        }
      }

      return tiles;
    },
    delay(t, v) {
      return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
      });
    },
    asyncShowCorrectScreen() {
      const tiles = this.tiles;
      return this.delay(500)
        .then(() => { // show
          this.tiles = tiles.map(tile => {
            return {
              ...tile,
              isSelected: tile.isCorrect
            };
          });
        })
        .then(() => { // hide
          return this.delay(this.correctScreenTime)
          .then(() => {
            this.tiles = tiles;
          });
        });
    },
    asyncShowResultScreen() {
      const tiles = this.tiles;
      return this.delay(500)
        .then(() => { // show
          this.tiles = tiles.map(tile => {
            return {
              ...tile,
              isSelected: tile.isCorrect || tile.isSelected
            };
          });
        })
        .then(() => { // hide
          return this.delay(1500)
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
    checkTile(index) {
      const tile = this.tiles[index];
      if (tile.isSelected || this.remainingClickCount === 0) return;
      tile.isSelected = true;
      this.remainingClickCount --;

      if (tile.isCorrect) {
        this.yourRightAnswerCount ++;
      }
      if (this.remainingClickCount === 0) {
        tile.isLastClick = true;
        this.didPass = this.yourRightAnswerCount === this.correctTileCount;
        this.evaluateRound();
      }
    },
    adjustLevel() {
      return {
        set: (levelIncPoint) => {
          const index = this.level - 1 + levelIncPoint;
          const {
            level, 
            nTile, 
            correctTileCount, 
            correctScreenTime 
          } = gameLevel[index < 0 ? 0 : index];
          this.level = level;
          this.nTile = nTile;
          this.correctTileCount = correctTileCount;
          this.correctScreenTime = correctScreenTime;
        },
        up: () => {
          if (this.levelIncPoint < 2) {
            this.levelIncPoint ++;
          }
          this.adjustLevel().set(this.levelIncPoint === 2 ? 2 : 1);
        },
        down: () => {
          if (this.levelIncPoint > -1) {
            this.levelIncPoint --;
          }
          this.adjustLevel().set(this.levelIncPoint === -1 ? -1 : 0);
        }
      }
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
  margin-bottom: 30px;
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
  width: 500px;
  height: 500px;
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
  margin-top: -10px;
  padding: 10px;
  background: #3a2a25;
  transition: all .1s ease-out;
}
.tile {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 2px;
  perspective: 1000px;
  transition: all .3s ease-out;
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
.tile .front:hover {
  background: #9e7063;
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
</style>

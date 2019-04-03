<template>
  <div id="tileBox" class="boxWrapper" v-if="progress">
    <div class="tileBox"
      :style="tileBoxClass">
      <div :key="tile.id"
        class="tile flip-container"
        v-on:click="checkTile(index)" 
        v-for="(tile, index) in tiles">
        <div class="flipper" :class="{isSelected: tile.isSelected}">
          <div class="front"></div>
          <div class="back">
            <div v-if="didPass && tile.isLastClick" class="result endCorrect">
              <font-awesome-icon icon="check" />
            </div>
            <div v-if="tile.isCorrect" class="result correct"></div>
            <div v-if="!tile.isCorrect" class="result wrong">
              <font-awesome-icon icon="times" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
import helper from '../common/helper'

export default {
  name: 'tileBox',
  computed: {
    ...mapState([
      'status',
      'life',
      'level',
      'tiles',
      'didPass',
      'correctScreenTime'
    ]),
    progress () {
      return this.status === 'READY' || this.status === 'INGAME' || this.status === 'EVALUATION'; 
    },
    tileBoxClass () {
      const nTile = Math.sqrt(this.tiles.length);
      const boxSize = `${40 * nTile}px`; // 40 = tile width ( width + margin 2 * 2 )
      return { width: boxSize, height: boxSize };
    }
  },
  watch: {
    status() {
      if (this.status === 'READY') {
        this.startRound();
      } else if (this.status === 'EVALUATION') {
        this.evaluateRound();
      }
    }
  },
  methods: {
    ...mapGetters([
      'isCompletedGame'
    ]),
    ...mapMutations([
      'initRoundData',
      'permitRemainingClickCount',
      'failGame',
      'completeGame',
      'showWhichTiles',
      'hideAllTiles',
      'checkTile',
      'levelUp',
      'levelDown',
      'showCoverScreen'
    ]),
    async startRound () {
      this.initRoundData();
      await this.asyncShowTileScreen(tile => tile.isCorrect, this.correctScreenTime);
      this.permitRemainingClickCount();
    },
    async evaluateRound () {
      await this.asyncShowTileScreen(tile => tile.isCorrect || tile.isSelected, 1500);
      await helper.delay(500);

      if (this.didPass) {
        this.levelUp();
      } else {
        this.levelDown();
      }

      if (this.isCompletedGame()) {
        this.completeGame();
        await helper.delay(1000);
        this.showCoverScreen();
      } else if (this.life > 0) {
        this.startRound();
      } else {
        this.failGame();
        await helper.delay(1000);
        this.showCoverScreen();
      }
    },
    async asyncShowTileScreen(whichTile, timeTohidden) {
      await helper.delay(500);
      this.showWhichTiles(whichTile);
      await helper.delay(timeTohidden);
      this.hideAllTiles();
    }
  }
}
</script>

<style>
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
  width: 36px;
  height: 36px;
  transition: 0.5s;
	transform-style: preserve-3d;
}
.tile .flipper.isSelected {
  transform: rotateX(180deg);
}
.tile .flipper .front, .tile .flipper .back {
	position: absolute;
  overflow: hidden;
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
.tile .back .result {
  width: 100%;
  height: 100%;
}
.tile .back .result.correct {
  background: #4eafb5;
}
.tile .back .result.wrong {
  background: #ff7000;
}
.tile .back .result.endCorrect {
  background: #51a729;
}
.tile .back svg {
  padding: 8px;
  font-size: 20px;
  color: #feffff;
}
@media (hover:hover) {
 .tile .front:hover {
    background: #9e7063;
  }
}
</style>

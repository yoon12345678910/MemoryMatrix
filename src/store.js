import Vue from 'vue'
import Vuex from 'vuex'
import { gameRoundData } from './gameRoundData'
import { DB } from './DB'

Vue.use(Vuex);

const generateTiles = function (nTile, correctTileCount) {
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
  while (correctTileCount > 0) {
    tile = tiles[Math.floor(Math.random() * tiles.length)];
    if (!tile.isCorrect) {
      tile.isCorrect = true;
      correctTileCount --;
    }
  }
  return tiles;
};

export const store = new Vuex.Store({
  state: {
    status: 'INIT',
    life: 0,
    level: -1,
    correctScreenTime: 0,
    correctTileCount: 0,
    yourRightAnswerCount: 0,
    remainingClickCount: 0,
    levelIncPoint: 0,
    tiles: [],
    didPass: false,
    isShowCoverScreen: false,
  },
  getters: {
    isCompletedGame: function (state) {
      return !gameRoundData[state.level];
    }
  },
  mutations: {
    setGameMode: function (state, payload) {
      if (payload === 'NEW') {
        DB.save({ level: -1 });
        state.level = 0;
        state.life = 5;
        state.status = 'READY';
      } else if (payload === 'LOAD') {
        state.level = DB.load().level;
        state.life = 5;
        state.status = 'READY';
      } else {
        const loaded = DB.load();
        if (loaded !== null) {
          state.level = loaded.level;
        }
      }
    },
    initRoundData: function (state) {
      const {
        nTile,
        correctTileCount,
        correctScreenTime
      } = gameRoundData[state.level];

      state.status = 'INGAME';
      state.tiles = generateTiles(nTile, correctTileCount);
      state.didPass = false;
      state.remainingClickCount = 0;
      state.yourRightAnswerCount = 0;
      state.correctScreenTime = correctScreenTime;
      state.correctTileCount = correctTileCount;
    },
    permitRemainingClickCount: function (state) {
      state.remainingClickCount = state.correctTileCount;
    },
    failGame: function (state) {
      state.status = 'FAIL';
      DB.save({ level: state.level });
    },
    completeGame: function (state) {
      state.status = 'COMPLETE';
    },
    showWhichTiles: function (state, payload) {
      state.tiles = state.tiles.map(tile => {
        return {
          ...tile,
          isSelected: payload.call(null, tile)
        };
      });
    },
    hideAllTiles: function (state) {
      state.tiles = state.tiles.map(tile => {
        return {
          ...tile,
          isSelected: false
        };
      });
    },
    checkTile: function (state, payload) {
      let tile = state.tiles[payload];
      if (tile.isSelected || state.remainingClickCount === 0) return;

      tile.isSelected = true;
      state.remainingClickCount --;
      if (tile.isCorrect) {
        state.yourRightAnswerCount ++;
      }
      if (state.remainingClickCount === 0) {
        tile.isLastClick = true;
        state.didPass = state.yourRightAnswerCount === state.correctTileCount;
        state.status = 'EVALUATION';
      }
    },
    levelUp: function (state) {
      if (state.levelIncPoint < 3) state.levelIncPoint ++;
      state.level = state.level + (state.levelIncPoint === 3 ? 2 : 1);
    },
    levelDown: function (state) {
      state.levelIncPoint = state.levelIncPoint > 0 ? 0 : -1;
      state.level = state.level > 0 ? state.level + state.levelIncPoint : 0;
      state.life --;
    },
    showCoverScreen: function (state) {
      state.isShowCoverScreen = true;
    },
    hideCoverScreen: function (state) {
      state.isShowCoverScreen = false;
    }
  }
});
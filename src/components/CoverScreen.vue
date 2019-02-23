<template>
  <div id="coverScreen">
    <div class="coverScreen init"
         :class="initClass">
      <div class="desc">Train your spatial recall by<br>remembering the pattern of tiles</div>
      <button @click="gameMode.new">NEW</button>
      <button v-if="loadedGame" @click="gameMode.load">LOAD</button>
    </div>
    <div class="coverScreen end"
         :class="endClass">
      <div class="desc">GAME OVER</div>
      <button @click="gameMode.load">CONTINUE</button>
      <button @click="gameMode.new">NEW</button>
    </div>
    <div class="coverScreen complete"
         :class="completeClass">
      <div class="desc">You have an excellent brain!</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'coverScreen',
  props: {
    state: {
      type: String,
      default: 'INIT'
    },
    showFadeIn: {
      type: Boolean,
      default: false
    },
    loadedGame: {
      type: Boolean,
      default: false
    },
    gameMode: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {
    initClass () {
      return { show: this.state === 'INIT', showFadeIn: this.state === 'INIT' && this.showFadeIn }
    },
    endClass () {
      return { show: this.state === 'END', showFadeIn: this.state === 'END' && this.showFadeIn }
    },
    completeClass () {
      return { show: this.state === 'COMPLETE', showFadeIn: this.state === 'COMPLETE' && this.showFadeIn }
    }
  }
}
</script>

<style>
  .coverScreen {
    display: none;
    position: absolute;
    padding: 0 20px;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, .2);
    transform: translateY(-12px);
    transition: all .3s ease;
    z-index: 1000;
    opacity: 0;
  }

  .coverScreen.show {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .coverScreen.showFadeIn {
    transform: translateY(0);
    opacity: 1;
  }

  .coverScreen .desc {
    margin-bottom: 30px;
    color: #fff;
    font-size: 165.5%;
    font-weight: 100;
    text-align: center;
  }

  .coverScreen button {
    margin-top: 20px;
    width: 150px;
    height: 50px;
    border: 1px solid #ccc;
    border-width: 0 0 2px 0;
    border-radius: 4px;
    border-bottom-color: #c94727;
    color: #fff;
    background-color: #F1693C;
    text-transform: uppercase;
    text-align: center;
    text-shadow: none;
    line-height: 50px;
    letter-spacing: 1px;
    box-shadow: inset 0 -2px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    outline: none;
  }

  .coverScreen button:hover {
    background-color: #F2744A;
  }

  @media screen and (max-width: 480px) {
    .coverScreen.init .desc {
      font-size: 135.5%;
    }
  }
</style>

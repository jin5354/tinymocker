<template>
  <header>
    <p>
      {{ title }}
      <span> {{ subtitle }} </span>
    </p>
  </header>
</template>

<script>
export default {
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      title: 'Tinymocker',
      subtitle: '为本地开发提供mock数据'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
@import '../common/sass/bass';

header {
  display: flex;
  width: 100%;
  align-items: center;
  line-height: 80px;
  border-bottom: 1px solid #eee;
  margin-bottom: 40px;

  p {
    padding-left: 40px;
    margin: 0;
    font-size: 18px;
    color: $deepblue;
    flex: 1;

    span {
      margin-left: 10px;
      font-size: 14px;
      color:  #000;
    }
  }
  em {
    margin-right: 40px;
    font-style: normal;
    color: $deepblue;
  }
}
</style>

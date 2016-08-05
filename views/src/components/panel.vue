<template>
  <div class="panel">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" :class="{'gray': !status}"
          @click="toggleIsOpen()">
            {{ header }}
        </a>
        <span :class="{'hide': !status}">
            {{ status?'启用中':'' }}
        </span>
      </h4>
    </div>
    <div class="panel-collapse"
      v-el:panel
      v-show="isOpen"
      transition="collapse"
    >
      <div class="panel-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>


<script>
  export default {
    props: {
      isOpen: {
        type: Boolean,
        default: false
      },
      header: {
        type: String
      },
      status: {
        type: Boolean
      }
    },
    methods: {
      toggleIsOpen() {
        this.isOpen = !this.isOpen
      }
    },
    transitions: {
      collapse: {
        afterEnter: function afterEnter(el) {
          el.style.maxHeight = "";
        },
        beforeLeave: function beforeLeave(el) {
          el.style.maxHeight = el.offsetHeight + "px";
          // Recalculate DOM before the class gets added.
          return el.offsetHeight;
        }
      }
    }
  }
</script>

<style scoped>
.accordion-toggle {
  cursor: pointer;
}
.collapse-transition {
  transition: max-height .5s ease;
  overflow: hidden;
}
.collapse-enter, .collapse-leave {
  max-height: 0!important;
}
span {
  padding: 4px;
  border: 1px solid #ccc;
  color: #666;
}
.gray {
  color: #aaa;
}
</style>
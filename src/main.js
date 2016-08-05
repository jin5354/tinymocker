import Vue from 'vue';
import App from './App';
import VueResource from 'vue-resource';

Vue.use(VueResource);

Vue.filter('formatJSONStr', (value) => {
    try {
        let result = JSON.stringify(JSON.parse(value), undefined, 4);
        return result;
    }catch(e) {
        return value;
    }
});

Vue.filter('formatMockList', (Arr) => {
    let enabledArr = [];
    let disabledArr = [];
    Arr.forEach((e) => {
        e.enabled?enabledArr.push(e):disabledArr.push(e);
    });

    return enabledArr.concat(disabledArr);
});


/* eslint-disable no-new */
new Vue({
    el: 'body',
    components: { App }
});

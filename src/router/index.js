import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/views/HomePage.vue'; 
import Select from '@/views/SelectPage.vue'; 
import Make from '@/views/MakePage.vue'; 
import Enter from '@/views/EnterPage.vue'; 
import UserVideo from '@/components/UserVideo.vue'; 

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/select',
    name: 'Select',
    component: Select
  },
  {
    path: '/make',
    name: 'Make',
    component: Make
  },
  {
    path: '/enter',
    name: 'Enter',
    component: Enter
  },
  {
    path: '/uservideo',
    name: 'UserVideo',
    component: UserVideo
  }
]
});

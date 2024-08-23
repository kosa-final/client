import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/views/HomePage.vue'; 
import Select from '@/views/SelectPage.vue'; 
import Make from '@/views/MakePage.vue'; 
import Enter from '@/views/EnterPage.vue'; 
import UserVideo from '@/components/video/UserVideo.vue'; 
import LoginCompo from '@/views/LoginCompo.vue'; 
import UserProfile from '@/views/UserProfile.vue'; 

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
    },
    {
      path: '/login',  
      name: 'Login',
      component: LoginCompo
    },
    {
      path: '/profile',  
      name: 'UserProfile',
      component: UserProfile
    }
  ]
});

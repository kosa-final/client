import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/views/HomePage.vue'; 
import Select from '@/views/SelectPage.vue'; 
import Make from '@/views/MakePage.vue'; 
import OneFrame from '@/views/OneFramePage.vue';
import TwoFrame from '@/views/TwoFramePage.vue'; 
import FourFrame from '@/views/FourFramePage.vue'; 
import UserVideo from '@/components/video/UserVideo.vue'; 
import Edit from '@/views/EditPage.vue'; 

import LoginCompo from '@/views/LoginCompo.vue'; 
import UserProfile from '@/views/UserProfile.vue'; 
import MyPageCompo from '@/views/MyPageCompo.vue';

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
      path: '/oneframe',
      name: 'OneFrame',
      component: OneFrame
    },
    {
      path: '/twoframe',
      name: 'TwoFrame',
      component: TwoFrame
    },
    {
      path: '/fourframe',
      name: 'FourFrame',
      component: FourFrame
    },
    {
      path: '/edit',
      name: 'Edit',
      component: Edit
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
    },
    {
      path: '/mypage', 
      name: 'MyPage',
      component: MyPageCompo
    }
  ]
});

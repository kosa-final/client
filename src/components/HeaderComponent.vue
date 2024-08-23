<template>
  <header class="header">
    <nav>
      <a class="logo" href="/">CLICK PIC</a>
      <router-link to="/login">
        <button class="btn">LOGIN</button> 
      </router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
};
</script>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
}

.logo {
  font-size: 24px;
  text-decoration: none;
}

.btn {
  background-color: #DB574D;
  border: none;
  border-radius: 25px;
  text-align: center;
  padding: 7px 20px;
  color: white;
  font-size: 16px;
}
</style>

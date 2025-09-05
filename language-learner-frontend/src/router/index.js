import Vue from "vue";
import Router from "vue-router";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Match from "../views/Match.vue";
import Call from "../views/Call.vue";
Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/register", component: Register },
    { path: "/login", component: Login },
    { path: "/match", name: "Match", component: Match },
    { path: "/call/:callId", name: "Call", component: Call, props: true }, 
  ],
});

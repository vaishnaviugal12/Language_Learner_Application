import Vue from "vue";
import Vuex from "vuex";
import api from "../services/api";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null, // will hold logged in user info
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    user: (state) => state.user,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    CLEAR_USER(state) {
      state.user = null;
    },
  },
  actions: {
   async login({ commit }, { email, password, $cookies }) {
  const res = await api.post("/user/login", { email, password }, { withCredentials: true });
  commit("SET_USER", res.data.user);

  // Save userId in cookie for MatchPage
  $cookies.set("userId", res.data.user._id, "1d", "/");

  return res.data.user;
}

,

    async register(_, payload) {
      await api.post("/user/register", payload);
    },

   async logout({ commit }) {
  await api.post("/user/logout", {}, { withCredentials: true });
  commit("CLEAR_USER");
}
,
async fetchUser({ commit }) {
  try {
    const res = await api.get("/user/me", { withCredentials: true });
    commit("SET_USER", res.data);
  } catch (e) {
    commit("CLEAR_USER");
  }
}


,
  },
});

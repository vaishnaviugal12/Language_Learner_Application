export function setLoggedIn(status) {
  localStorage.setItem("loggedIn", status ? "true" : "false");
}

export function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}

export function clearLogin() {
  localStorage.removeItem("loggedIn");
}

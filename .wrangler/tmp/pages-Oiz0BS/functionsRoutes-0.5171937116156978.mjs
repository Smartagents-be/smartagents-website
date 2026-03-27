import { onRequest as __secured_login_js_onRequest } from "/Users/axel/projects/smartagents-website/functions/secured/login.js"
import { onRequest as __secured___path___js_onRequest } from "/Users/axel/projects/smartagents-website/functions/secured/[[path]].js"

export const routes = [
    {
      routePath: "/secured/login",
      mountPath: "/secured",
      method: "",
      middlewares: [],
      modules: [__secured_login_js_onRequest],
    },
  {
      routePath: "/secured/:path*",
      mountPath: "/secured",
      method: "",
      middlewares: [],
      modules: [__secured___path___js_onRequest],
    },
  ]
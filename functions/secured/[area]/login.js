// Cloudflare Pages Function for /secured/<area>/login: a client area's own
// login. Pages routes this ahead of the catch-all guard, which is what keeps
// the login reachable without a session. A segment that names no area is not
// a login page at all, so it goes to the guard like any other path under
// /secured/.
import { handleLogin } from '../login.js';
import { CLIENT_AREAS } from '../areas.js';
import { onRequest as guard } from '../[[path]].js';

export function onRequest(context) {
  const area = CLIENT_AREAS.find((each) => each.key === context.params.area);
  return area ? handleLogin(context, area) : guard(context);
}

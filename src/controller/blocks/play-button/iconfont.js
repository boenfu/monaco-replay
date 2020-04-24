!(function (l) {
  var e,
    d =
      '<svg><symbol id="mrp-play" viewBox="0 0 1024 1024"><path d="M213.333333 189.226667v645.546666a42.666667 42.666667 0 0 0 66.005334 35.712l493.397333-322.773333a42.666667 42.666667 0 0 0 0-71.424L279.338667 153.514667A42.666667 42.666667 0 0 0 213.333333 189.226667z" fill="#FFF" ></path></symbol><symbol id="mrp-suspend" viewBox="0 0 1024 1024"><path d="M277.333333 213.333333v607.146667a42.666667 42.666667 0 0 0 42.666667 42.666667H384a42.666667 42.666667 0 0 0 42.666667-42.666667V213.333333a42.666667 42.666667 0 0 0-42.666667-42.666666H320a42.666667 42.666667 0 0 0-42.666667 42.666666zM597.333333 213.333333v607.146667a42.666667 42.666667 0 0 0 42.666667 42.666667h64a42.666667 42.666667 0 0 0 42.666667-42.666667V213.333333a42.666667 42.666667 0 0 0-42.666667-42.666666H640a42.666667 42.666667 0 0 0-42.666667 42.666666z" fill="#FFF" ></path></symbol></svg>',
    t = (e = document.getElementsByTagName("script"))[
      e.length - 1
    ].getAttribute("data-injectcss");
  if (t && !l.__iconfont__svg__cssinject__) {
    l.__iconfont__svg__cssinject__ = !0;
    try {
      document.write(
        "<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>"
      );
    } catch (e) {
      console && console.log(e);
    }
  }
  !(function (e) {
    if (document.addEventListener)
      if (~["complete", "loaded", "interactive"].indexOf(document.readyState))
        setTimeout(e, 0);
      else {
        var t = function () {
          document.removeEventListener("DOMContentLoaded", t, !1), e();
        };
        document.addEventListener("DOMContentLoaded", t, !1);
      }
    else
      document.attachEvent &&
        ((o = e),
        (i = l.document),
        (a = !1),
        (d = function () {
          try {
            i.documentElement.doScroll("left");
          } catch (e) {
            return void setTimeout(d, 50);
          }
          n();
        })(),
        (i.onreadystatechange = function () {
          "complete" == i.readyState && ((i.onreadystatechange = null), n());
        }));
    function n() {
      a || ((a = !0), o());
    }
    var o, i, a, d;
  })(function () {
    var e, t, n, o, i, a;
    ((e = document.createElement("div")).innerHTML = d),
      (d = null),
      (t = e.getElementsByTagName("svg")[0]) &&
        (t.setAttribute("aria-hidden", "true"),
        (t.style.position = "absolute"),
        (t.style.width = 0),
        (t.style.height = 0),
        (t.style.overflow = "hidden"),
        (n = t),
        (o = document.body).firstChild
          ? ((i = n), (a = o.firstChild).parentNode.insertBefore(i, a))
          : o.appendChild(n));
  });
})(window);

(function() {
    "use strict";
    const select = (el, all = false) => {
      el = el.trim()
      if (all)
      {
        return [...document.querySelectorAll(el)]
      } else
      {
        return document.querySelector(el)
      }
    }

    /**
     * Skills reveal
     */
    let skillsEl = select('.skills');
    if (skillsEl && typeof Waypoint !== 'undefined') {
      new Waypoint({
        element: skillsEl,
        offset: '75%',
        handler: function() {
          let groups = select('.skill-group', true);
          groups.forEach((el, i) => {
            el.style.transitionDelay = (i * 0.08) + 's';
            el.classList.add('visible');
          });
        }
      })
    }
  })()
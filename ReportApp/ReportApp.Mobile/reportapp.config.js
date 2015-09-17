// NOTE object below must be a valid JSON
window.ReportApp = $.extend(true, window.ReportApp, {
  "config": {
    "layoutSet": "slideout",
    "animationSet": "default",
    "navigation": [
      {
        "title": "About",
        "onExecute": "#About",
        "icon": "info"
      },
      {
        "title": "graph",
        "onExecute": "#graph",
        "icon": "graph"
      },
      {
        "title": "main",
        "onExecute": "#main",
        "icon": "main"
      }
    ]
  }
});

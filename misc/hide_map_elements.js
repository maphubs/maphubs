https://gist.github.com/kriscarle/041363d57a1a81ac2dbe031a3caa57ff

// Step 1 - Go to print/screnshot view for a map in Firefox
// Step 2 - Open web console in Firefox (option-command-K)
// Step 3 - copy paste into dev tools console command line  (may have to do it twice)
// Step 4 - Right click on a remaining overlay element (logo or scalebar) and choose Take a Screenshot

javascript: (function(e, s) {
  e.src = s;
  e.onload = function() {
      jQuery && jQuery.noConflict();
      console.log('jQuery injected');
      jQuery('.z-depth-1').hide()
      // jQuery('img').hide() // uncomment this to also hide MapHubs logo
      jQuery('.map-position').hide()
  };
  document.head.appendChild(e);
})(document.createElement('script'), '//code.jquery.com/jquery-latest.min.js')
$(function () {
  'use strict';
  
  window.onpageshow = function(event) {if (event.persisted) {window.location.reload() }};
  /*
    Dark Theme (Dynamic)
  */

  // Variable to track user's preferred color scheme
  let userPrefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const darkStylesheet = document.getElementById('dark-stylesheet');


  // Function to toggle and set the theme based on user's preferred color scheme
  const toggleAndSetTheme = () => {
      const darkStylesheet = document.getElementById('dark-stylesheet');
      // Toggle the 'disabled' attribute on the dark mode stylesheet
      darkStylesheet.disabled = !darkStylesheet.disabled;

      // Update the user's preference based on the current state
      userPrefersDarkMode = darkStylesheet.disabled;
  };

  // Event listener for a theme toggle button or any trigger you prefer
  document.getElementById('themeToggle').addEventListener('click', toggleAndSetTheme);

  // Call the function to set the theme based on user's preference when the page loads
  darkStylesheet.disabled = !userPrefersDarkMode;


});
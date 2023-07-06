# LED-Controller-GUI
This repository contains HTML, CSS, and JavaScript code for an animation selection GUI. The GUI allows users to select and configure various animations to be displayed on an LED strip via an API. The animations are categorized into four groups: start animations, standard animations, custom animations, and special animations.
### Note
Check out the LED-Controller-API, which this is the GUI for: [LED-Controller-API](https://github.com/LetsGaming/LED-Controller-API)

## Important
* This implementation is only meant for local deployment!
* There are basically no security checks added, so something like XSS is pretty easy to do!!
  - If you want to add those implementations, feel free to create a fork of this repository

## Getting Started
To use the animation selection interface, follow these steps:

1. Clone ```git clone https://github.com/LetsGaming/led-controller-gui.git``` the repository or download the HTML, CSS, and JavaScript files to your local machine.
2. Open the index.html file in a web browser.
  - Alternatively you can also create a local Webserver in your Network, so that all Devices connected to the network can interact with the website
3. The "start animations"-category will be shown. To select other animations, select categories from the top-left (Desktop) or top side
4. Select a animation from the buttons in the middle
5. The selection Window will extend, showing information and (if needed) arguments for the selected animation
6. Click on "Start Animation" button at the bottom 

## Usage
Upon opening the index.html file in a web browser, you will see a sidebar on the left side of the page, containing four categories: "Start Animations", "Standard Animations," "Custom Animations," and "Special Animations." Clicking on any of these categories will load the corresponding animations in the main content area.

In the main content area, you will see a list of animations for the selected category. Each animation is represented by a button with its name. Clicking on an animation button will display the animation's arguments, if any, in the arguments container below.

If an animation requires arguments, input fields will be displayed in the arguments container. Enter the desired values for each argument and click the "Start Animation" button to initiate the animation.

## Files
The repository contains the following files:

* index.html: The main HTML file that structures the animation selection interface.
* style.css: The CSS file that defines the styles and layout of the interface.
* script.js: The JavaScript file that handles the dynamic behavior and functionality of the interface.
* tests/: All the above files with slight changes to test certain things.
  
## Compatibility
The animation selection interface is compatible with modern web browsers. It is recommended to use the latest version of popular web browsers such as Google Chrome, Mozilla Firefox, or Microsoft Edge for the best experience.

## Contributing
If you'd like to contribute to this project, feel free to fork the repository and submit a pull request with your changes. Contributions and improvements are always welcome!

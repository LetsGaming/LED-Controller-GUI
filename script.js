// API variables
const raspberryPiIp = "192.168.2.112";
const apiPort = "5000"
const baseUrl = `http://${raspberryPiIp}:${apiPort}`

// Global variables
const checkbox = document.getElementById("checkbox");
const toggleLabelOn = document.querySelector('.toggle-label.on');
const toggleLabelOff = document.querySelector('.toggle-label.off');
const brightnessContainer = document.getElementById("brightnessContainer");
const animationsLabel = document.getElementById('animationsLabel');
const animationContainer = document.getElementById('animation-container');
const sidenav = document.getElementById("sidebar");
const brightnessSlider = document.getElementById('brightness');
const argsContainer = document.getElementById('args-container');
const onlineStateContainer = document.getElementById("switch");

let onlineState;
let currentCategory;
let currentAnimations;
let amountOfColorPickers;
let colorPickerContainers = [];
let multipleColors = false;

// Event listener for checkbox change
checkbox.addEventListener('change', handleCheckboxChange);

// Event listener for slide input changes
brightnessSlider.addEventListener('input', handleBrightnessInputChange);
brightnessSlider.addEventListener('change', handleBrightnessSliderChange);

// Function to handle checkbox change
function handleCheckboxChange() {
    const online = this.checked;
    const params = { online: online };

    fetch(`${baseUrl}/led/set_online_state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    })
        .then(handleResponse)
        .then(() => {
            onlineState = online;
            updateUI();
            if (currentCategory) {
                loadAnimations(currentCategory);
            } else {
                loadAnimations('start');
            }
        })
        .catch(handleError);
}

// Function to handle brightness input change
function handleBrightnessInputChange() {
    document.getElementById("brightness-value").textContent = this.value;
}

// Function to handle brightness slider change
function handleBrightnessSliderChange() {
    const value = this.value;
    setBrightness(value);
}

// Function to handle response from fetch
function handleResponse(response) {
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('Request failed');
    }
}

// Function to handle errors
function handleError(error) {
    console.error('Error:', error);
}

// Function to get online state
function getOnlineState() {
    const apiUrl = `${baseUrl}/led/get_online_state`;

    fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(handleResponse)
        .then(response => {
            onlineState = Boolean(response.current_online_state);
            updateUI();
            if (currentCategory) {
                loadAnimations(currentCategory);
            } else {
                loadAnimations('start');
            }
        })
        .catch(handleError);
}

// Function to update the whole Interface
function updateUI() {
    const scriptOutput = document.getElementById("script-output");

    sidenav.style.display = onlineState ? "block" : "none";
    brightnessContainer.style.display = onlineState ? "block" : "none";
    animationsLabel.style.display = onlineState ? "block" : "none";
    scriptOutput.style.display = onlineState ? "block" : "none";

    checkbox.checked = onlineState;
    onlineStateContainer.classList.toggle("slideractive", onlineState);
    toggleLabelOn.style.opacity = onlineState ? '1' : '0';
    toggleLabelOff.style.opacity = onlineState ? '0' : '1';

    if (!onlineState) {
        animationContainer.innerHTML = '';
    }
}

// Function to load animations
async function loadAnimations(category) {
    deleteArgsInput();
    if (onlineState) {
        currentCategory = category;
        const categoryList = document.getElementById('category-list');
        const categoryLinks = categoryList.getElementsByTagName('a');
        for (const link of categoryLinks) {
            link.classList.remove('active');
        }

        const selectedCategoryLink = document.querySelector(`a[onclick="loadAnimations('${category}')"]`);
        selectedCategoryLink.classList.add('active');

        currentAnimations = await getCurrentAnimations(category);
        createButtons();
        getBrightnessAndSetDisplay();
    }
}

// Function to get current animations
async function getCurrentAnimations(category) {
    try {
        const response = await fetch(`${baseUrl}/led/animations/${category}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Function to create buttons
function createButtons() {
    animationContainer.innerHTML = '';
    for (const animationKey in currentAnimations) {
        const animation = currentAnimations[animationKey];
        const button = createButton(animation);
        animationContainer.appendChild(button);
    }
}

// Function to create a button
function createButton(animation) {
    const button = document.createElement('button');
    const span = document.createElement('span');
    button.className = 'codepen-button';
    span.textContent = animation.name;
    button.addEventListener('click', () => {
        populateArgsInput(animation);
    });
    button.appendChild(span);
    return button;
}

// Function to delete argument inputs
function deleteArgsInput() {
    try {
        argsContainer.innerHTML = '';
        argsContainer.style.display = "none";
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to populate argument inputs
function populateArgsInput(animation) {
    deleteArgsInput();

    const argsContainer = document.querySelector('#args-container');
    const argumentInputContainer = document.createElement('div');
    argumentInputContainer.id = 'argumentInputContainer';

    argsContainer.innerHTML = ''; // Clear existing content

    const closeButton = document.createElement('span');
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', deleteArgsInput);
    argsContainer.appendChild(closeButton);

    createAnimationInfo(animation);

    amountOfColorPickers = getAmountOfColors(animation);
    const colorAmount = amountOfColorPickers;

    for (let index = 0; index < colorAmount; index++) {
        createColorPicker(`Color ${index}:`, `color-${index}`);
    }


    if (animation.args.length > 0) {
        if (animation.args.length > amountOfColorPickers * 3) {
            argsContainer.style.display = "block";
            const argsTitle = document.createElement('h3');
            argsTitle.textContent = 'Animation Arguments:';
            argumentInputContainer.appendChild(argsTitle);
            argsContainer.appendChild(argumentInputContainer);
        }

        const argItems = animation.args
            .filter(arg => !/^(red|green|blue)$|_(red|green|blue)$/.test(arg) && !/^(colors)$/.test(arg))
            .map(arg => {
                const argItem = document.createElement('div');
                argItem.classList.add('arg-item');
                const argLabel = document.createElement('label');
                argLabel.textContent = `${formatArgLabel(arg)}:`;
                const argInput = document.createElement('input');
                argInput.type = 'number';
                argInput.value = 1;
                argInput.setAttribute('oninput', 'validity.valid||(value="")');
                argInput.setAttribute('min', 1);
                argInput.required = true;
                argInput.classList.add('arg-input');
                argInput.addEventListener('change', () => {
                    if (argInput.value < 1) {
                        argInput.value = 1;
                    }
                });
                argItem.appendChild(argLabel);
                argItem.appendChild(argInput);
                return argItem;
            });

        argumentInputContainer.append(...argItems);
    } else {
        argsContainer.style.display = "none";
    }

    if (animation.args.includes('colors')) {
        multipleColors = true;
        const colorPickerButtonsContainer = document.createElement('div');
        colorPickerButtonsContainer.setAttribute('class', 'button-container');

        const removeLastColorPickerButton = document.createElement('button');
        removeLastColorPickerButton.setAttribute('class', 'color-picker-button');
        removeLastColorPickerButton.setAttribute('id', 'remove-color-picker');
        removeLastColorPickerButton.textContent = 'Remove Color Picker';
        removeLastColorPickerButton.addEventListener('click', () => {
            removeLastColorPicker();
        })

        const addColorPickerButton = document.createElement('button');
        addColorPickerButton.setAttribute('class', 'color-picker-button');
        addColorPickerButton.setAttribute('id', 'add-color-picker');
        addColorPickerButton.textContent = 'Add Color Picker';
        addColorPickerButton.addEventListener('click', () => {
            const colorPickerIndex = amountOfColorPickers;
            createColorPicker(`Color ${colorPickerIndex}:`, `color-${colorPickerIndex}`);
        });
        colorPickerButtonsContainer.appendChild(removeLastColorPickerButton);
        colorPickerButtonsContainer.appendChild(addColorPickerButton);

        argsContainer.appendChild(colorPickerButtonsContainer);
    }

    argsContainer.style.display = "block";

    const startButton = document.createElement('button');
    startButton.id = 'start-animation';
    startButton.textContent = 'Start Animation';
    startButton.addEventListener('click', () => {
        startAnimation(animation, [getRGB(), ...getOtherArgs()]);
    });

    argsContainer.appendChild(argumentInputContainer);
    argsContainer.appendChild(startButton);
}

// Function to format argument label
function formatArgLabel(arg) {
    const words = arg.split('_');
    const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return formattedWords.join(' ');
}

// Function to create animation info
function createAnimationInfo(animation) {
    const animationInfoContainer = document.createElement('div');
    animationInfoContainer.setAttribute('id', 'animationInfoContainer');
    const animationInfoTitle = document.createElement('h1');
    animationInfoTitle.textContent = "Animation Info";

    const animationNameTitle = document.createElement('h2');
    animationNameTitle.textContent = "Animation Name:";
    const animationName = document.createElement('h3');
    animationName.textContent = animation.name;

    const animationDescTitle = document.createElement('h2');
    animationDescTitle.textContent = "Animation Description:";
    const animationDesc = document.createElement('h3');
    animationDesc.textContent = animation.description;

    animationInfoContainer.appendChild(animationInfoTitle);
    animationInfoContainer.appendChild(animationNameTitle);
    animationInfoContainer.appendChild(animationName);
    animationInfoContainer.appendChild(animationDescTitle);
    animationInfoContainer.appendChild(animationDesc);

    argsContainer.appendChild(animationInfoContainer);
}

// Function to get the amount of colors
function getAmountOfColors(animation) {
    const colorComponents = ['red', 'green', 'blue'];

    const counts = colorComponents.reduce((obj, component) => {
        obj[component] = animation.args.filter(arg => arg.includes(component) || arg.includes(`_${component}`)).length;
        return obj;
    }, {});

    const uniqueCountValues = new Set(Object.values(counts));

    if (uniqueCountValues.size === 1) {
        return uniqueCountValues.values().next().value;
    }
}

// Function to create a color picker
function createColorPicker(labelText, argPrefix) {
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.classList.add('color-picker-container');

    const colorPickerLabel = document.createElement('label');
    colorPickerLabel.textContent = labelText;
    const colorPickerInput = document.createElement('input');
    colorPickerInput.type = 'color';
    colorPickerInput.classList.add('arg-input', 'color-picker');
    colorPickerInput.setAttribute('data-arg-prefix', argPrefix);
    colorPickerContainer.appendChild(colorPickerLabel);
    colorPickerContainer.appendChild(colorPickerInput);

    const flexContainer = document.createElement('div');
    flexContainer.classList.add('flex-container');
    flexContainer.appendChild(colorPickerContainer);
    argsContainer.appendChild(flexContainer);

    amountOfColorPickers += 1;
    colorPickerContainers.push(colorPickerContainer);
}

function removeLastColorPicker() {
    if (amountOfColorPickers > 0) {
        const lastColorPickerContainer = colorPickerContainers.pop();
        if (lastColorPickerContainer && lastColorPickerContainer.parentNode) {
            lastColorPickerContainer.parentNode.remove();
            amountOfColorPickers -= 1;
        }
    }
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Function to convert RGB color to hex
function rgbToHex(red, green, blue) {
    const rgb = (red << 16) | (green << 8) | (blue << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

// Function to get RGB color values
function getRGB() {
    const colorPickerInputs = document.querySelectorAll('.color-picker');
    const rgbValues = [];
    colorPickerInputs.forEach((input) => {
        if (input.getAttribute('data-arg-prefix')) {
            const value = hexToRgb(input.value);
            if (value) {
                rgbValues.push(value.r, value.g, value.b);
            }
        }
    });
    return rgbValues;
}

function convertToCustomColors(rgbArray) {
    if (rgbArray.length % 3 !== 0) {
        throw new Error("Invalid input: RGB array length must be a multiple of 3.");
    }

    const customColors = [];
    for (let i = 0; i < rgbArray.length; i += 3) {
        const r = rgbArray[i];
        const g = rgbArray[i + 1];
        const b = rgbArray[i + 2];
        customColors.push([r, g, b]);
    }
    return customColors;
}

// Function to get other argument values
function getOtherArgs() {
    const argsInputs = document.getElementsByClassName('arg-input');
    const args = [];
    for (const input of argsInputs) {
        if (input.type === 'color') continue;
        args.push(input.value.trim());
    }
    return args;
}

// Function to get brightness and update display
function getBrightnessAndSetDisplay() {
    const apiUrl = `${baseUrl}/led/get_brightness`;

    fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(handleResponse)
        .then(data => {
            const brightnessDisplay = document.getElementById("brightness-value");
            const current_brightness = data['current_brightness'];
            brightnessDisplay.textContent = current_brightness;
            brightnessSlider.value = current_brightness;
        })
        .catch(handleError);
}

// Function to set brightness
function setBrightness(value) {
    const apiUrl = `${baseUrl}/led/brightness`;

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brightness: parseInt(value) })
    })
        .then(handleResponse)
        .catch(handleError);
}

// Function to start animation
async function startAnimation(animation, args) {
    const animationArgs = animation.args;
    const args0 = args[0];

    const correctAnimationName = animation.name.toLowerCase().replace(/ /g, '_');
    let apiUrl = `${baseUrl}/led/animations/${currentCategory}/${correctAnimationName}`;
    if (currentCategory === 'start') {
        apiUrl = `${baseUrl}/led/${correctAnimationName}`;
    }

    const requestData = animationArgs.reduce((data, arg, index) => {
        if (index < args0.length) {
            if (arg === 'colors') {
                data[arg] = convertToCustomColors(args0);
            } else {
                data[arg] = args0[index];
            }
        } else {
            data[arg] = args[index - args0.length + 1];
        }
        return data;
    }, {});

    const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    };

    try {
        const response = await fetch(apiUrl, fetchOptions);
        if (response.ok) {
            const data = await response.json();
            createScriptOutput(animation, args);
        } else {
            const errorData = await response.json();
            const scriptOutput = clearAndGetScriptOutput();
            scriptOutput.innerHTML = `<span style='color: red'>Error ${response.status}</span><br><span>${errorData.message}</span>`;
        }
    } catch (error) {
        const scriptOutput = clearAndGetScriptOutput();
        scriptOutput.innerHTML = `<span style='color: red'>Error</span><br><span>Couldn't start ${animation.name}</span>`;
        console.error("Start Error", error);
    }

    const argsInputs = document.getElementsByClassName('arg-input');
    Array.from(argsInputs).forEach(input => {
        input.value = input.type === 'color' ? '#000000' : '1';
    });
}

// Function to clear script output
function clearAndGetScriptOutput() {
    const scriptOutput = document.getElementById('script-output');
    scriptOutput.textContent = '';
    scriptOutput.style.display = "block";
    return scriptOutput;
}

// Function to create script output
function createScriptOutput(animation, args) {
    const scriptOutput = clearAndGetScriptOutput();

    const amountOfColors = getAmountOfColors(animation);
    const animationArgs = animation.args;
    const args0 = args[0];
    if (args0.length !== 0) {
        const colors = Array.from({ length: amountOfColors }, (_, index) => {
            const r = args0[index * 3];
            const g = args0[index * 3 + 1];
            const b = args0[index * 3 + 2];
            const color = rgbToHex(r, g, b);
            return color;
        });

        const argsString = colors
            .map((currentColor, index) => `<br>Color ${index}:<span style="color: ${currentColor}; font-size: 25px;"> ▇</span>`)
            .concat(
                animationArgs
                    .slice(args0.length)
                    .filter(argName => !/^(red|green|blue)$|_(red|green|blue)$/.test(argName))
                    .map((argName, i) => {
                        const argValue = args[i + 1];
                        return `<br>${formatArgLabel(argName)}: ${argValue}`;
                    })
            );

        scriptOutput.innerHTML = `<span>${animation.name} started with arguments:${argsString}</span>`;
    } else {
        scriptOutput.textContent = `${animation.name} started`;
    }
}

// Initialize the script
getOnlineState();

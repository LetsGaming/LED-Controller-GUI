const standardAnimations = {
    'rainbow': {
        'name': 'Rainbow',
        'description': 'Displays a colorful rainbow pattern.',
        'args': []
    },
    'rainbow_cycle': {
        'name': 'Rainbow Cycle',
        'description': 'Smoothly transitions colors in a cyclical pattern resembling a rainbow.',
        'args': []
    },
    'theater_chase_rainbow': {
        'name': 'Theater Chase Rainbow',
        'description': 'Produces a theater chase effect with a rainbow of colors.',
        'args': []
    },
    'rainbow_comet': {
        'name': 'Rainbow Comet',
        'description': 'Simulates a comet-like trail of rainbow colors.',
        'args': []
    }
};

const customAnimations = {
    'color_wipe': {
        'name': 'Color Wipe',
        'description': 'Wipes the LED strip with a single color, creating a visually striking effect.',
        'args': ['red', 'green', 'blue']
    },
    'theater_chase': {
        'name': 'Theater Chase',
        'description': 'Creates a theater chase effect with custom colors.',
        'args': ['red', 'green', 'blue']
    },
    'strobe': {
        'name': 'Strobe',
        'description': 'Produces a strobe effect using custom colors.',
        'args': ['red', 'green', 'blue']
    },
    'color_chase': {
        'name': 'Color Chase',
        'description': 'Generates a chasing effect with custom colors.',
        'args': ['red', 'green', 'blue']
    }
};

const specialAnimations = {
    'blink': {
        'name': 'Blink',
        'description': 'Repeatedly blinks the LED strip with a specified color combination.',
        'args': ['red', 'green', 'blue', 'duration']
    },
    'fade': {
        'name': 'Fade',
        'description': 'Gradually fades the LED strip from one color to another.',
        'args': ['from_red', 'from_green', 'from_blue', 'to_red', 'to_green', 'to_blue', 'steps']
    },
    'sparkle': {
        'name': 'Sparkle',
        'description': 'Adds sparkling effects to the LED strip by randomly illuminating individual LEDs.',
        'args': ['red', 'green', 'blue', 'sparkle_count']
    },
    'larson_scanner': {
        'name': 'Larson Scanner',
        'description': 'Mimics the Larson scanner effect with the specified colors and parameters.',
        'args': ['red', 'green', 'blue', 'tail_size', 'wait_ms']
    },
    'breathing_effect': {
        'name': 'Breathing Effect',
        'description': 'Create a breathing effect by gradually changing the brightness of the color.',
        'args': ['red', 'green', 'blue', 'duration']
    }
};

// Global variables
let currentCategory = 'standard';
let currentAnimations = standardAnimations;

function loadAnimations(category) {
    deleteArgsInput();
    currentCategory = category;
    const categoryList = document.getElementById('category-list');
    const categoryLinks = categoryList.getElementsByTagName('a');
    for (const link of categoryLinks) {
        link.classList.remove('active');
    }

    const selectedCategoryLink = document.querySelector(`a[onclick="loadAnimations('${category}')"]`);
    selectedCategoryLink.classList.add('active');

    currentAnimations = getCurrentAnimations(category);

    createButtons();
}

function getCurrentAnimations(category) {
    switch (category) {
        case 'standard':
            return standardAnimations;
        case 'custom':
            return customAnimations;
        case 'special':
            return specialAnimations;
        default:
            return standardAnimations;
    }
    /*
    fetch(`/led/animations/${category}`)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            // Handle any errors
            console.error('Error:', error);
        });
        */
}

function createButtons() {
    const animationContainer = document.getElementById('animation-container');
    animationContainer.innerHTML = '';
    for (const animationKey in currentAnimations) {
        const animation = currentAnimations[animationKey];
        const button = createButton(animation);

        animationContainer.appendChild(button);
    }
}

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

const argsContainer = document.getElementById('args-container');
function deleteArgsInput() {
    try {
        argsContainer.innerHTML = '';
        argsContainer.classList.add("hide");
        const scriptOutput = document.getElementById('script-output');
        scriptOutput.textContent = '';
    } catch (error) {
    }
}

function populateArgsInput(animation) {
    deleteArgsInput();

    var closeButton = document.createElement("span");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", function () {
        deleteArgsInput();
    });
    argsContainer.appendChild(closeButton);

    createAnimationInfo(animation);

    amountOfColorPickers = getAmountOfColorPickers(animation);
    for (let index = 0; index < amountOfColorPickers; index++) {
        createColorPicker(`Color ${index}:`, `color-${index}`);
    }

    const argumentInputContainer = document.createElement('div');
    argumentInputContainer.setAttribute('id', 'argumentInputContainer');
    if (animation.args.length > 0) {
        argsContainer.classList.remove('hide');
        const argsTitle = document.createElement('h3');
        argsTitle.textContent = 'Animation Arguments:';
        argumentInputContainer.appendChild(argsTitle);
        argsContainer.appendChild(argumentInputContainer);

        for (const arg of animation.args) {
            if (arg === 'red' || arg === 'green' || arg === 'blue' || arg.endsWith('_red') || arg.endsWith('_green') || arg.endsWith('_blue')) {
                continue; // Skip color arguments and fade arguments, as they were handled above
            }

            const argLabel = document.createElement('label');
            const labelText = arg.charAt(0).toUpperCase() + arg.slice(1);
            argLabel.textContent = `${labelText}:`;
            const argInput = document.createElement('input');
            argInput.type = 'number';
            argInput.setAttribute("oninput", "validity.valid||(value='')")
            argInput.setAttribute("min", 1);
            argInput.classList.add('arg-input');
            argumentInputContainer.appendChild(argLabel);
            argumentInputContainer.appendChild(argInput);
        }
    } else {
        argsContainer.classList.add('hide');
    }
    argsContainer.classList.remove('hide');
    const startButton = document.createElement('button');
    startButton.addEventListener('click', () => {
        startAnimation(animation, [getRGB(), ...getOtherArgs()]);
    });
    startButton.setAttribute('id', 'start-animation');
    startButton.textContent = 'Start Animation';

    argsContainer.appendChild(startButton);
}

function createAnimationInfo(animation) {
    const animationInfoContainer = document.createElement('div');
    animationInfoContainer.setAttribute('id', 'animationInfoContainer');
    const animationInfoTitle = document.createElement('h1');
    animationInfoTitle.textContent = "Animation Info";

    const animationNameTitle = document.createElement('h2');
    animationNameTitle.textContent = "Animation Name:"
    const animationName = document.createElement('h3');
    animationName.textContent = animation.name;

    const animationDescTitle = document.createElement('h2');
    animationDescTitle.textContent = "Animation Description:"
    const animationDesc = document.createElement('h3');
    animationDesc.textContent = animation.description;

    animationInfoContainer.appendChild(animationInfoTitle);
    animationInfoContainer.appendChild(animationNameTitle);
    animationInfoContainer.appendChild(animationName);
    animationInfoContainer.appendChild(animationDescTitle);
    animationInfoContainer.appendChild(animationDesc);

    argsContainer.appendChild(animationInfoContainer);
}

function getAmountOfColorPickers(animation) {
    // Count occurrences of each color component
    const counts = {
        red: 0,
        green: 0,
        blue: 0
    };

    animation.args.forEach(arg => {
        if (arg.includes('red') || arg.includes('_red')) {
            counts.red++;
        } else if (arg.includes('green') || arg.includes('_green')) {
            counts.green++;
        } else if (arg.includes('blue') || arg.includes('_blue')) {
            counts.blue++;
        }
    });

    if (counts.red === counts.green && counts.green === counts.blue) {
        return counts.red;
    }
}

function createColorPicker(labelText, argPrefix) {
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.classList.add('color-picker-container');
    argsContainer.appendChild(colorPickerContainer);

    const colorPickerLabel = document.createElement('label');
    colorPickerLabel.textContent = labelText;
    const colorPickerInput = document.createElement('input');
    colorPickerInput.type = 'color';
    colorPickerInput.classList.add('arg-input', 'color-picker');
    colorPickerInput.setAttribute('data-arg-prefix', argPrefix);
    colorPickerContainer.appendChild(colorPickerLabel);
    colorPickerContainer.appendChild(colorPickerInput);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

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

function getOtherArgs() {
    const argsInputs = document.getElementsByClassName('arg-input');
    const args = [];
    for (const input of argsInputs) {
        if (input.type === 'color') continue;
        args.push(input.value.trim());
    }
    return args;
}

function startAnimation(animation, args) {
    const scriptOutput = document.getElementById('script-output');
    scriptOutput.textContent = '';

    console.log(`Starting ${animation.name} animation with args: ${args}`);
    // Call the actual API or implementation to start the animation with the provided arguments

    scriptOutput.textContent = `${animation.name} animation started with args: ${args.join(', ')}`;

    const correctAnimationName = animation.name.toLowerCase().replace(/ /g, "_");
    const apiUrl = `http://localhost:5000/led/animations/${currentCategory}/${correctAnimationName}`;

    const requestData = {};
    const animationArgs = animation.args;

    for (let index = 0; index < args[0].length; index++) {
        const element = args[0][index];
        const arg = animationArgs[index];
        const value = element;
        requestData[arg] = value;
    }

    for (let i = args[0].length; i < animationArgs.length; i++) {
        const arg = animationArgs[i];
        const value = args[i - args[0].length + 1];
        requestData[arg] = value;
    }

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response data
            console.log(data);
        })
        .catch(error => {
            // Handle any errors
            console.error('Error:', error);
        });

    // Clear argument inputs
    const argsInputs = document.getElementsByClassName('arg-input');
    for (const input of argsInputs) {
        if (input.type == "color") input.value = '#000000';
        else {
            input.value = '';
        }
    }
}

createButtons();
document.addEventListener('DOMContentLoaded', () => {
    // Available colors
    const colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Teal', 'Cyan', 'Navy', 'Lavender', 'Gold', 'Silver', 'Crimson', 'Ivory', 'Indigo', 'Salmon', 'Lime', 'Violet', 'Aqua', 'Ruby', 'Chocolate', 'Black', 'skyblue', 'snow', 'forestgreen'];

    // Initialize score tracking
    const scores = {
        colorIdentification: { correct: 0, incorrect: 0 },
        colorMatching: { correct: 0, incorrect: 0 },
        shadeDifference: { correct: 0, incorrect: 0 }
    };

    // Update scores in localStorage
    function updateScores() {
        localStorage.setItem('colorGameScores', JSON.stringify(scores));
        updateProgressChart();
    }

    // Retrieve scores from localStorage
    function getScores() {
        const storedScores = localStorage.getItem('colorGameScores');
        return storedScores ? JSON.parse(storedScores) : scores;
    }

    // Initialize game scores
    Object.assign(scores, getScores());

    // Initialize the progress chart
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Color Identification', 'Color Matching', 'Shade Difference'],
            datasets: [{
                label: 'Correct Answers',
                data: [scores.colorIdentification.correct, scores.colorMatching.correct, scores.shadeDifference.correct],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }, {
                label: 'Incorrect Answers',
                data: [scores.colorIdentification.incorrect, scores.colorMatching.incorrect, scores.shadeDifference.incorrect],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Update progress chart
    function updateProgressChart() {
        progressChart.data.datasets[0].data = [scores.colorIdentification.correct, scores.colorMatching.correct, scores.shadeDifference.correct];
        progressChart.data.datasets[1].data = [scores.colorIdentification.incorrect, scores.colorMatching.incorrect, scores.shadeDifference.incorrect];
        progressChart.update();
    }

    // Color Identification Game
    let currentColor = '';

    function getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateColorBox() {
        currentColor = getRandomColor();
        const colorDisplay = document.getElementById('color-display');
        colorDisplay.style.backgroundColor = currentColor.toLowerCase();
        updateOptions();
    }

    function updateOptions() {
        const options = document.getElementById('options');
        options.innerHTML = '';
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5).slice(0, 49); // Display 49 random color options
        shuffledColors.push(currentColor); // Ensure the current color is among the options
        shuffledColors.sort(() => Math.random() - 0.5); // Shuffle again to randomize placement
    
        shuffledColors.forEach(color => {
            const button = document.createElement('button');
            button.innerText = color;
            button.style.transition = 'background-color 0.3s, color 0.3s'; // Add transition for both background and text color
            button.onmouseover = () => {
                button.style.backgroundColor = color.toLowerCase(); // Change background color to match color name
                button.style.color = 'white'; // Change text color to white
            };
            button.onmouseout = () => {
                button.style.backgroundColor = ''; // Reset background color
                button.style.color = ''; // Reset text color
            };
            button.onclick = () => checkColor(color);
            options.appendChild(button);
        });
    }  

    function showPopup(message, isSuccess) {
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.padding = "20px";
        popup.style.color = "#fff";
        popup.style.backgroundColor = isSuccess ? "green" : "red";
        popup.style.borderRadius = "10px";
        popup.style.zIndex = "1000";
        popup.innerText = message;
    
        document.body.appendChild(popup);
    
        setTimeout(() => {
            popup.remove();
        }, 2000);
    }

    function checkColor(selectedColor) {
        const feedback = document.getElementById('feedback');
        if (selectedColor === currentColor) {
            showPopup('Correct!', true);
            scores.colorIdentification.correct++;
        } else {
            showPopup(`Incorrect! The correct color was ${currentColor}.`, false);
            scores.colorIdentification.incorrect++;
        }
        updateScores();
        setTimeout(updateColorBox, 2000)
    }

    // Color Matching Game
    function setupColorMatching() {
        const matchingSwatches = document.getElementById('matching-swatches');
        matchingSwatches.innerHTML = '';
        const selectedColors = [...colors].sort(() => Math.random() - 0.5).slice(0, 25); // Pick 25 random colors
        const swatchColors = [...selectedColors, ...selectedColors].sort(() => Math.random() - 0.5); // Duplicate and shuffle

        swatchColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.style.backgroundColor = color.toLowerCase();
            swatch.dataset.color = color;
            swatch.classList.add('swatch');
            matchingSwatches.appendChild(swatch);
        });

        let firstChoice = null;
        let matches = 0;

        matchingSwatches.addEventListener('click', function (event) {
            const selected = event.target;
            if (selected.classList.contains('swatch')) {
                if (!firstChoice) {
                    firstChoice = selected;
                    selected.style.outline = '2px solid #333';
                } else {
                    if (firstChoice !== selected && firstChoice.dataset.color === selected.dataset.color) {
                        firstChoice.style.visibility = 'hidden';
                        selected.style.visibility = 'hidden';
                        matches++;
                        document.getElementById('match-feedback').textContent = 'Match Found!';
                        document.getElementById('match-feedback').style.color = 'green';
                        scores.colorMatching.correct++;
                    } else {
                        document.getElementById('match-feedback').textContent = 'Try Again!';
                        document.getElementById('match-feedback').style.color = 'red';
                        scores.colorMatching.incorrect++;
                    }
                    firstChoice.style.outline = 'none';
                    firstChoice = null;
                }
            }

            if (matches === 25) {
                alert('All matches found!');
                setupColorMatching(); // Restart the game
            }
            updateScores();
        });
    }

    // Shade Difference Game
    function setupShadeDifference() {
        const shadeContainer = document.getElementById('shade-container');
        const shades = ['#f0f0f0', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#8c8c8c', '#767676', '#5e5e5e', '#464646', '#2e2e2e', '#161616'];
        const shuffledShades = shades.slice().sort(() => Math.random() - 0.5);

        shadeContainer.innerHTML = '';
        shuffledShades.forEach(shade => {
            const shadeDiv = document.createElement('div');
            shadeDiv.style.backgroundColor = shade;
            shadeDiv.draggable = true;
            shadeDiv.classList.add('shade');
            shadeContainer.appendChild(shadeDiv);
        });

        let dragging = null;

        shadeContainer.addEventListener('dragstart', (e) => {
            dragging = e.target;
        });

        shadeContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const target = e.target;
            if (target !== dragging && target.classList.contains('shade')) {
                shadeContainer.insertBefore(dragging, target.nextSibling);
            }
        });

        shadeContainer.addEventListener('dragend', () => {
            const currentOrder = Array.from(shadeContainer.children).map(div => div.style.backgroundColor);
            if (JSON.stringify(currentOrder) === JSON.stringify(shades)) {
                alert('Correct Order!');
                scores.shadeDifference.correct++;
            } else {
                scores.shadeDifference.incorrect++;
            }
            updateScores();
        });
    }

    // Toggle Dark/Light Mode
    document.getElementById('toggle-mode').onclick = () => {
        document.body.classList.toggle('dark-mode');
    };  

    // Initialize Games
    updateColorBox();
    setupColorMatching();
    setupShadeDifference();
    updateProgressChart();
});


function openHelpModal(gameType) {
    var modal = document.getElementById('help-modal');
    var modalText = document.getElementById('modal-text');
    switch (gameType) {
        case 'colorIdentification':
            modalText.innerHTML = 'Identify the displayed color from a set of options. Click the color that matches the displayed one.';
            break;
        case 'colorMatching':
            modalText.innerHTML = 'Match similar colors or shades. Group similar colors together from the given options.';
            break;
        case 'shadeDifference':
            modalText.innerHTML = 'Arrange colors in order from lightest to darkest. Drag and drop the colors into the correct order.';
            break;
        default:
            modalText.innerHTML = 'No help available.';
            break;
    }
    modal.style.display = "block";
}

function closeHelpModal() {
    var modal = document.getElementById('help-modal');
    modal.style.display = "none";
}  

function checkShadeOrder() {
    const shadeContainer = document.getElementById('shade-container');
    const userShades = Array.from(shadeContainer.children).map(div => rgbToHex(div.style.backgroundColor));  // Convert user RGB colors to Hex

    // Target shades already in upper case Hex
    const targetShades = ['#F0F0F0', '#D9D9D9', '#BFBFBF', '#A6A6A6', '#8C8C8C', '#767676', '#5E5E5E', '#464646', '#2E2E2E', '#161616'];

    // Debugging output
    console.log('User Shades:', userShades);
    console.log('Target Shades:', targetShades);

    // Perform the comparison
    const isCorrect = userShades.every((shade, index) => shade === targetShades[index]);
    if (isCorrect) {
        alert('Correct Order!');
    } else {
        alert('Incorrect Order. Try again!');
    }
}

// Helper function to convert RGB to Hex (since browser may convert hex to rgb in styles)
function rgbToHex(rgb) {
    if (!rgb) return null; // Return null for undefined
    if (rgb.startsWith('#')) {
        return rgb.toUpperCase(); // If already hex, just convert to upper case
    }

    // Convert RGB format 'rgb(x, y, z)' to Hex format
    const rgbParts = rgb.match(/\d+/g);
    if (rgbParts) {
        const [r, g, b] = rgbParts.map(Number);
        return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
    }
    return null; // Return null if the format is unrecognized
}

// Helper function to compare two arrays
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

document.getElementById('nav-toggle').addEventListener('click', function() {
    var links = document.getElementById('nav-links');
    if (links.style.display === 'block') {
        links.style.display = 'none';
    } else {
        links.style.display = 'block';
    }
});

console.log("Script is now running.");

// Define golfer names directly in the script
const golferNames = ["Scottie Scheffler", "Wyndham Clark", "Sahith Theegala"];

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const namesRegex = new RegExp(`\\b(${golferNames.map(escapeRegExp).join('|')})\\b`, 'gi');

function highlightText(node) {
    let match;
    const docFragment = document.createDocumentFragment();
    let lastLastIndex = 0;

    while ((match = namesRegex.exec(node.textContent)) !== null) {
        const matchIndex = match.index;
        const beforeMatch = node.textContent.slice(lastLastIndex, matchIndex);
        const matchText = node.textContent.slice(matchIndex, matchIndex + match[0].length);

        if (beforeMatch) {
            docFragment.appendChild(document.createTextNode(beforeMatch));
        }
        const span = document.createElement('span');
        span.className = 'highlighted-golfer';
        span.textContent = matchText;
        docFragment.appendChild(span);

        lastLastIndex = matchIndex + match[0].length;
    }

    if (lastLastIndex < node.textContent.length) {
        docFragment.appendChild(document.createTextNode(node.textContent.slice(lastLastIndex)));
    }

    node.parentNode.replaceChild(docFragment, node);
}

function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE && node.parentNode && node.textContent.match(namesRegex)) {
        highlightText(node);
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.isContentEditable) {
        Array.from(node.childNodes).forEach(child => processNode(child));
    }
}

function showTooltip(target, text, pageX, pageY) {
    let tooltip = document.querySelector('.tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);

        // Define iframe here within the tooltip condition
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL('chart-iframe.html');
        iframe.style.width = '100%';
        iframe.style.height = '450px';
        iframe.onload = () => {
            iframe.contentWindow.postMessage({ golferName: text }, "*"); // Specify the correct target origin in production
        };
        tooltip.appendChild(iframe);
        tooltip.style.left = `${pageX + 10}px`;
        tooltip.style.top = `${pageY + 20}px`;
        tooltip.style.display = 'block';
    }
    
    function removeTooltip() {
        tooltip.style.display = 'none';
    }

    target.addEventListener('mouseleave', removeTooltip);
    tooltip.addEventListener('mouseenter', () => clearTimeout(tooltip.hideTimeout));
    tooltip.addEventListener('mouseleave', () => {
        tooltip.hideTimeout = setTimeout(removeTooltip, 500);
    });
}

function initialize() {
    console.log('Initializing processing...');
    processNode(document.body);
    document.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('highlighted-golfer')) {
            showTooltip(event.target, event.target.textContent, event.clientX, event.clientY);
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Add CSS for the tooltip
const style = document.createElement('style');
document.head.appendChild(style);
style.textContent = `
.highlighted-golfer { background-color: yellow; cursor: pointer; }
.tooltip {
    position: fixed;
    padding: 5px 10px;
    background: black;
    color: white;
    border-radius: 5px;
    z-index: 10000; /* Ensure it's above all other content */
    display: none;
    pointer-events: auto; /* Ensure it can be interacted with */
}
`;

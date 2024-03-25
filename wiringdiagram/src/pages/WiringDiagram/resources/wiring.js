// Development function
function log(item){
    console.log(item)
}

let g_elements = {}
let line_elements = {}
let text_element_groups = {}
let tspan_elements = []

function identifyElements() {
    // Populate element object lists
    g_elements = document.querySelectorAll('g')
    text_element_groups = document.querySelectorAll('text');
    line_elements = document.querySelectorAll('line')
    
    // Add required event listeners
    for (const text_el of text_element_groups) {
        for (const tspan_el of text_el.childNodes){
            tspan_elements.push(tspan_el)
            tspan_el.addEventListener('click', function() { 
                toggleActivateClass(tspan_el);
                animateClass(tspan_el)
            })
        }
    }

    for (const line_el of line_elements) {
        line_el.addEventListener('click', function(){
            toggleActivateClass(line_el)
        })
    }
}

function disableNonActives(){
    for (const index in tspan_elements){
        const element = tspan_elements[index];
        const className = element.classList.value
        if (!className.includes('active')) {
            deActivateClass(element)
        }
    }
    for (const index in line_elements){
        const element = line_elements[index];
        if (element.classList) {
            const className = element.classList.value
            if (!className.includes('active')){
                deActivateClass(element)
            }
        }
    }
}

function toggleActivateClass(ele) {
        let elClass = ele.classList.value
        if (elClass.includes('not-active')) {
            // Set to active
            activateClass(ele);
            disableNonActives();
        }
        else if (elClass.includes('active')) {
            // Set to not-active
            deActivateClass(ele)
        }
        else {
            // Inital click mode
            disableNonActives();
            activateClass(ele);
        }
}

function activateClass(ele) {
    if (ele && ele.classList) {
        ele.classList.remove('not-active');
        ele.classList.add('active');
    }
};

function deActivateClass(ele) {
    if (ele && ele.classList) {
        ele.classList.remove('active');
        ele.classList.add('not-active');
    }
};

function animateClass(ele) {
    if (ele && ele.classList) {
        ele.classList.toggle('animate');
    }
};

window.addEventListener('load', identifyElements);

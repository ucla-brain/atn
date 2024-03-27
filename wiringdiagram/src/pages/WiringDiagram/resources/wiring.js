// Development function
function log(item){
    console.log(item)
}

// Define global elements
const special_cases = ['notes']
let g_elements = {}
let g_elements_groups = {}
let g_elements_groups_key = new Set()
let line_elements = {}
let line_element_groups = {}
let path_elements = {}
let path_element_groups = {}
let text_element_groups = {}
let tspan_elements = []

function identifyElements() {
    // Populate element object lists
    g_elements = document.querySelectorAll('g')
    g_elements_groups = document.querySelectorAll('g[id]')
    line_elements = document.querySelectorAll('line')
    path_elements = document.querySelectorAll('path')
    text_element_groups = document.querySelectorAll('text');
    
    // Add required event listeners to text
    for (const text_el of text_element_groups) {
        for (const tspan_el of text_el.childNodes){
            let parent = tspan_el.parentElement.parentElement
            if (special_cases.includes(parent.id)){
                // Special case found
            } else  {
                tspan_elements.push(tspan_el)
                tspan_el.addEventListener('click', function() { 
                    toggleActivateClass(tspan_el);
                    animateClass(tspan_el)
                })
            }
        }
    }

    // Create groups based on the tag name, add required event listeners to lines
    for (const line_el of line_elements) {
        let classGroup = extractClassGroup(line_el)
        if (!line_element_groups[classGroup]) {
            line_element_groups[classGroup] = []
        }
        line_element_groups[classGroup].push(line_el)
        line_el.addEventListener('click', function(){
            toggleActivateClass(line_el)
        })
    }
    for (const path_el of path_elements) {
        let classGroup = extractClassGroup(path_el)
        if (!path_element_groups[classGroup]) {
            path_element_groups[classGroup] = []
        }
        path_element_groups[classGroup].push(path_el)
        path_el.addEventListener('click', function(){
            toggleActivateClass(path_el)
        })
    }

    // Special Grouping for path and line tag elements
    g_elements_groups.forEach(group => {
        group.childNodes.forEach(nestedGroup => {
            if (nestedGroup.tagName == 'g'){
                let tempSet = new Set();
                nestedGroup.childNodes.forEach(innerElement => {
                    if ((innerElement.tagName == 'line') || (innerElement.tagName == 'path')) {
                        let classValue = extractClassGroup(innerElement);
                        if (classValue != null){
                            tempSet.add(classValue[0])
                            tempSet.add(innerElement.tagName)
                        }
                    }
                })
                if (tempSet.size > 3){
                    g_elements_groups_key.add(JSON.stringify(Array.from(tempSet)))
                }
                else {
                    // log('invalid pairing likely due to outlier elements: ' +  tempSet.size)
                    // log(tempSet)
                }

            }
        })
    })
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
            disableNonActives();
            activateClass(ele);
        }
}

function activateClass(ele) {
    let tagName = ele.tagName;
    if (ele && ele.classList && tagName != 'line' && tagName != 'path') {
        ele.classList.remove('not-active');
        ele.classList.add('active');
    } else {
        let classValue = extractClassGroup(ele)
        let correspondingEl = correspondingElement(tagName, classValue[0])
        let lineClass = (tagName == 'line') ? classValue[0] : correspondingEl;
        let pathClass = (tagName == 'line') ? correspondingEl : classValue[0];
        if(correspondingEl){
            path_element_groups[pathClass].forEach(element => {
                element.classList.remove('not-active');
                element.classList.add('active');
            });
        }
        line_element_groups[lineClass].forEach(element => {
            element.classList.remove('not-active');
            element.classList.add('active')
        });
    }
};

function deActivateClass(ele) {
    let tagName = ele.tagName;
    if (ele && ele.classList && tagName != 'line' && tagName != 'path') {
        ele.classList.remove('active');
        ele.classList.add('not-active');
    } else {
        let classValue = extractClassGroup(ele)
        let correspondingEl = correspondingElement(tagName, classValue[0])
        let lineClass = (tagName == 'line') ? classValue[0] : correspondingEl;
        let pathClass = (tagName == 'line') ? correspondingEl : classValue[0];
        if (correspondingEl){
            path_element_groups[pathClass].forEach(element => {
                element.classList.remove('active');
                element.classList.add('not-active');
            });
        }
        line_element_groups[lineClass].forEach(element => {
            element.classList.remove('active');
            element.classList.add('not-active')
        });
    }
};

function animateClass(ele) {
    if (ele && ele.classList) {
        ele.classList.toggle('animate');
    }
};

function extractClassGroup(str){
    let regex = /cls-\d{2}/
    let substring = str.classList.value.match(regex)
    return substring;
}

function correspondingElement(clickedElement, clickedElementClass) {
    let key = Array.from(g_elements_groups_key, JSON.parse)

    for (let groupArray of key){
        if (groupArray.includes(clickedElementClass)){
            if (clickedElement == 'line'){
                return groupArray[2]
            } else {
                return groupArray[0]
            }
        }
    }

}

window.addEventListener('load', identifyElements);
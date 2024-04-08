// Development function
function log(item){
    console.log(item)
}

// Define global elements
const manualTextLineLinks = [
    // ATN ROI
    ['AMd.d','cls-35','cls-18','cls-20','cls-17'],
    ['AMd.dl','cls-33','cls-18','cls-20','cls-17'],
    ['AMd.c','cls-26','cls-18','cls-20','cls-17'],
    ['AMd.l','cls-31','cls-18','cls-20','cls-17'],
    ['AMv','cls-32','cls-18','cls-20','cls-17'],
    ['AMd.m','cls-36','cls-18','cls-20','cls-17'],
    ['AMd.dm','cls-19','cls-22','cls-18','cls-20','cls-17'],

    ['ADm','cls-28'],
    ['IAD','cls-25'],
    ['ADl','cls-34'],
    
    ['AVd','cls-27','cls-24'],
    ['AVm','cls-29','cls-24'],
    ['AVmt','cls-30','cls-24'],
    ['AVl','cls-23','cls-24'],

    // Non ATN ROI
    // ['BLAa','cls-36'],
    // ['ORBm/vl','cls-32', 'cls-36'],
    // ['ILA','cls-32', 'cls-36'],
    // ['PL','cls-32', 'cls-36'],
    // ['ACAc','cls-35'],
    // ['ACAr','cls-22', 'cls-32', 'cls-19'],
    // ['RSPd','cls-34', 'cls-27'],
    // ['RSPv','cls-29', 'cls-34', 'cls-33'],
    // ['RSPagl','cls-27'],
    // ['PTLp','cls-31'],
    // ['MOs fef','cls-26'],
    // ['ECT/PERIc','cls-26'],
    // ['POST','cls-27', 'cls-28'],
    // ['PRE','cls-27', 'cls-28'],  
    // ['PAR','cls-27', 'cls-28'],
    // ['SUBd','cls-23'],
    // ['SUBv','cls-23','cls-25','cls-30','cls-36'],
    // ['ENTl','cls-26'],
    // ['CPdm','cls-25'],
    // ['RSPv (6)','cls-30'],
    // ['SC','cls-25'],
    // ['LDT','cls-20', 'cls-24', 'cls-17'],
    // ['VTN','cls-28','cls-34'],
    // ['DR','cls-28','cls-34'],
    // ['DTN','cls-28','cls-34'],
    // ['MMmed','cls-25'],
    // ['MMm','cls-18', 'cls-20'],
    // ['MMl','cls-30','cls-29','cls-27','cls-23'],
    // ['LM','cls-28','cls-34']
]
const special_case_classes = ['notes', 'non-interactive'] //class name
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
            let appendedSpecialCase = tspan_el.classList.value.substring(tspan_el.classList.value.length - 5);
            if (special_case_classes.includes(tspan_el.classList.value) || (special_case_classes.includes(appendedSpecialCase))){
                // Special case found
            } else  {
                tspan_elements.push(tspan_el)
                tspan_el.addEventListener('click', function() { 
                    let rawText = tspan_el.textContent
                    let associatedLines = identifyLinkedLines(rawText)
                    if (associatedLines.length > 0){
                        toggleActivateClass(tspan_el);
                        animateClass(tspan_el);
                        associatedLines.forEach((lineClass) => {
                            // All available classes via lineClass
                            if (line_element_groups[lineClass]){
                                let conditionalOverride = (line_element_groups[lineClass][0].classList.value.includes(' active'))
                                line_element_groups[lineClass].forEach((lineEl, index) => {
                                    toggleActivateClass(lineEl, true, conditionalOverride)
                                    if (line_element_groups[lineClass].length-1 == index){
                                        conditionalOverride = !conditionalOverride;
                                    }
                                })
                            }
                        })
                    } else  {
                        toggleActivateClass(tspan_el);
                        animateClass(tspan_el)
                    }
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
        if (isSpecialLineCase(line_el.classList.value)){
        } else {
            line_el.addEventListener('click', function(){
                toggleActivateClass(line_el)
            })
        }
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
                }

            }
        })
    })


}

function identifyLinkedLines (text) {
    for (let i = 0; i < manualTextLineLinks.length; i++) {
        const innerArray = manualTextLineLinks[i];
        try{
            if (innerArray.includes(text)) {
                let filteredArray = innerArray.filter(item => item !== text)
                return filteredArray; // Return the array containing the target string
            }
        }catch {
        }
    }
    return -1;
}

function isSpecialLineCase(string) {
    let isSpecialCase = false;
    special_case_classes.forEach(specialCase => {
        if (string.includes(specialCase)){
            isSpecialCase = true;
            return isSpecialCase
        }
    })
    return isSpecialCase;
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
            if (isSpecialLineCase(className)){
                activateClass(element)
            }
        }
    }
}

function toggleActivateClass(ele, hasLinkedElements = false, conditionalOverride) {
    if (hasLinkedElements){
        let elClass = ele.classList.value
        if (elClass.includes('not-active') && (!conditionalOverride)) {
            // Set to active
            activateClass(ele);
            disableNonActives();
        }
        else if (elClass.includes('active') && (conditionalOverride)) {
            // Set to not-active
            deActivateClass(ele)
        }
        else {
            disableNonActives();
            activateClass(ele);
        }
    } else {
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
    if (tagName !== 'tspan') {
        let classValue = extractClassGroup(ele);
        if (classValue && !hasActiveCorrespondingTspan(classValue, ele)) { // Only proceed if no active tspans
            if (ele && ele.classList && tagName !== 'line' && tagName !== 'path') {
                ele.classList.remove('active');
                ele.classList.add('not-active');
            } else if (classValue) {
                let correspondingEl = correspondingElement(tagName, classValue[0]);
                let lineClass = (tagName == 'line') ? classValue[0] : correspondingEl;
                let pathClass = (tagName == 'line') ? correspondingEl : classValue[0];
                if (correspondingEl) {
                    path_element_groups[pathClass]?.forEach(element => {
                        element.classList.remove('active');
                        element.classList.add('not-active');
                    });
                }
                line_element_groups[lineClass]?.forEach(element => {
                    element.classList.remove('active');
                    element.classList.add('not-active');
                });
            }
        } else {

        }
    }
}

function hasActiveCorrespondingTspan(classGroup, ele) {
    //check if text associated with lines group is active
    // TODO: Idetintify special case duplicate toggles
    for (let textLineLink of manualTextLineLinks) {
        if (textLineLink.includes(classGroup[0])) {
            let tspanText = textLineLink[0];
            for (let tspan_el of tspan_elements) {
                if (tspan_el.textContent === tspanText && tspan_el.classList.contains('animate')) {
                    return true;
                }
            }
        } else {
        }
    }
// No active associated tspans found
    return false;
}

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
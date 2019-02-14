var notes = [
    { name: [ "f#", "gb" ], tier: 0, fingering: "123" },
    { name: [ "g" ], tier: 0, fingering: "13" },
    { name: [ "g#", "ab" ], tier: 0, fingering: "23" },
    { name: [ "a" ], tier: 0, fingering: "12" },
    { name: [ "a#", "bb" ], tier: 0, fingering: "1" },
    { name: [ "b" ], tier: 0, fingering: "2" },
    { name: [ "c" ], tier: 1, fingering: "0" },
    { name: [ "c#", "db" ], tier: 1, fingering: "123" },
    { name: [ "d" ], tier: 1, fingering: "13" },
    { name: [ "d#", "eb" ], tier: 1, fingering: "23" },
    { name: [ "e" ], tier: 1, fingering: "12" },
    { name: [ "f" ], tier: 1, fingering: "1" },
    { name: [ "f#", "gb" ], tier: 1, fingering: "2" },
    { name: [ "g" ], tier: 1, fingering: "0" },
    { name: [ "g#", "ab" ], tier: 1, fingering: "23" },
    { name: [ "a" ], tier: 1, fingering: "12" },
    { name: [ "a#", "bb" ], tier: 1, fingering: "1" },
    { name: [ "b" ], tier: 1, fingering: "2" },
    { name: [ "c" ], tier: 2, fingering: "0" },
    { name: [ "c#", "db" ], tier: 2, fingering: "12" },
    { name: [ "d" ], tier: 2, fingering: "1" },
    { name: [ "d#", "eb" ], tier: 2, fingering: "2" },
    { name: [ "e" ], tier: 2, fingering: "0" },
    { name: [ "f" ], tier: 2, fingering: "1" },
    { name: [ "f#", "gb" ], tier: 2, fingering: "2" },
    { name: [ "g" ], tier: 2, fingering: "0" },
    { name: [ "g#", "ab" ], tier: 2, fingering: "23" },
    { name: [ "a" ], tier: 2, fingering: "12" },
    { name: [ "a#", "bb" ], tier: 2, fingering: "1" },
    { name: [ "b" ], tier: 2, fingering: "2" },
    { name: [ "c" ], tier: 3, fingering: "0" },
];

var structures = {
    "Major"  : { definition: [ 0, 4, 7 ], intervals: [ "1", "3", "5" ] },
    "Minor"  : { definition: [ 0, 3, 7 ], intervals: [ "1", "b3", "5" ] },
    "Major 7th" : { definition: [ 0, 4, 7, 11 ], intervals: [ "1", "3", "5", "7" ] },
    "Minor 7th" : { definition: [ 0, 3, 7, 10 ], intervals: [ "1", "b3", "5", "b7" ] },
    "Dominant 7th"  : { definition: [ 0, 4, 7, 10 ], intervals: [ "1", "3", "5", "b7" ] },
    "Major Scale" : { definition: [ 0, 2, 4, 5, 7, 9, 11 ], intervals: [ "1", "2", "3", "4", "5", "6", "7" ] },
    "Natural Minor Scale" : { definition: [ 0, 2, 3, 5, 7, 8, 10 ], intervals: [ "1", "2", "b3", "4", "5", "b6", "b7" ] },
    "Mixolydian Scale" : { definition: [ 0, 2, 4, 5, 7, 9, 10 ], intervals: [ "1", "2", "3", "4", "5", "6", "b7" ] },    
    "Major Pentatonic Scale" : { definition: [ 0, 2, 4, 7, 9 ], intervals: [ "1", "2", "3", "5", "6" ] },
    "Minor Pentatonic Scale" : { definition: [ 0, 3, 5, 7, 10 ], intervals: [ "1", "b3", "4", "5", "b7" ] },
    "Blues Scale" : { definition: [ 0, 3, 5, 6, 7, 10 ], intervals: [ "1", "b3", "4", "b5", "5", "b7" ] },
    "Jazz Minor Scale" : { definition: [ 0, 2, 3, 5, 7, 9, 11 ], intervals: [ "1", "2", "b3", "4", "5", "6", "7" ] }
}

var OCTAVE = [ "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b" ];
var COLORS = [ "red", "green", "blue", "orange" ];
var FONT_SIZE = 12;
var CELL_SIZE = 40;
var COLUMNS_COUNT = 13;
var ROWS_COUNT = 0;
var RECTANGLES = [];
var STRUCTURE;
var INPUT;

// root .. string; root note name
// definition .. array of numbers; structure definition as interval lengths from the root note
function createStructure(root, definition) {
    var result = [];    

    // get the notes of the definition as an array
    var definitionNotes = [];    
    var rootIndex = notes.findIndex(n => n.name.includes(root));

    definition.forEach(n => {
        definitionNotes.push(notes[rootIndex + n]);
    });

    // go through all the notes and pick the ones that are contained in the definition array
    notes.forEach(n => {
        var isDefinitionNote = false;

        n.name.forEach(m => {
            if (definitionNotes.findIndex(o => o.name.includes(m)) !== -1) {
                isDefinitionNote = true;
            }
        });

        if (isDefinitionNote) {
            result.push(n);
        }
    });

    // prepare the patterns object for the pattern recognition analysis
    result.patterns = { "2":[], "3":[], "4":[], "5":[] };

    // find patterns
    [2, 3, 4, 5].forEach(length => {
        var patternSignatures = [];

        for (var i = 0; i <= result.length - length; i++) {
            var pattern = result.slice(i, i + length);
            var positions = [];
            var count = 0;
    
            for (var j = 0; j <= result.length - length; j++) {
                var adept = result.slice(j, j + length);
    
                if (comparePatterns(adept, pattern)) {
                    count++;
                    positions.push([j, j + length - 1]);
                }
            }
                
            var patternSignature = pattern.map(n => n.fingering).join(",");                

            if (count > 1 && !patternSignatures.includes(patternSignature)) {                    
                patternSignatures.push(patternSignature);
                result.patterns[length.toString()].push({ 
                    pattern   : pattern.map(n => n.fingering),
                    positions : positions });
                result.patterns[length.toString()].selected = -1;
            }
        } 
    })

    return result;
}

function initialize(structure) {
    ROWS_COUNT = (structure.definition.length * 3) + 2;

    var width = COLUMNS_COUNT * CELL_SIZE;
    var height = ROWS_COUNT * CELL_SIZE;
    
    // set sizes
    document.getElementById('canvas').width = width;
    document.getElementById('canvas').height = height;
    document.getElementById('buttons').width = width;    
}

function comparePatterns(n, m) {
    for (var i = 0; i < n.length; i++) {
        if (n[i].fingering !== m[i].fingering)
            return false;
    }

    return true;
}

function createOctave(structure) {
    var result = {
        structure : structure,
        columns : []
    };    

    OCTAVE.forEach(n => {
        result.columns.push(createStructure(n, structure.definition));
    });

    return result;
}

function renderControls(input) {
    // create controls for the patterns on the second "buttons" canvas
    var buttons = document.getElementById("buttons");
    var ctx = buttons.getContext("2d");
    var col = 1; 

        // clear canvas
        ctx.clearRect(0, 0, buttons.width, buttons.height);

    // clear rectangles
    RECTANGLES = [];

    // for each column of the input
    input.columns.forEach(column => {
        // render underlaying controls line
        ctx.beginPath();
        ctx.srokeStyle = "#666";
        ctx.rect((col * CELL_SIZE) + 2, 4, CELL_SIZE - 4, 2);
        ctx.stroke();

        // for each pattern found on the current column
        for (var i = 0; i < 4; i++) {
            // if pattern of the length exists
            if (column.patterns[(i + 2).toString()].length > 0) {
                var r = {
                    x : (col * CELL_SIZE) + (i * (CELL_SIZE / 4)) + 1,
                    y : 1,
                    w : (CELL_SIZE / 4) - 2,
                    h : buttons.height - 2,
                    pattern : (i + 2).toString(),
                    color : COLORS[i],
                    column : column,
                    click : function () {
                        // change pattern index
                        this.column.patterns[this.pattern].selected++;
                        if (this.column.patterns[this.pattern].selected === this.column.patterns[this.pattern].length) {
                            this.column.patterns[this.pattern].selected = -1;
                        }
                        // change color
                        var buttons = document.getElementById("buttons");
                        var ctx = buttons.getContext("2d");
                        ctx.beginPath();                        
                        ctx.fillStyle = (this.column.patterns[this.pattern].selected !== -1) ? this.color : "#666";                            
                        ctx.fillRect(this.x, this.y, this.w, this.h);
                    },
                    mouseenter : function() {
                        // change color
                        var buttons = document.getElementById("buttons");
                        var ctx = buttons.getContext("2d");
                        ctx.beginPath();                        
                        ctx.strokeStyle = "black";                            
                        ctx.rect(this.x + 1, this.y + 1, this.w - 2, this.h - 2);
                        ctx.stroke();
                    },
                    mouseleave : function() {
                        // change color
                        var buttons = document.getElementById("buttons");
                        var ctx = buttons.getContext("2d");
                        ctx.beginPath();                        
                        ctx.fillStyle = (this.column.patterns[this.pattern].selected !== -1) ? this.color : "#666";                            
                        ctx.fillRect(this.x, this.y, this.w, this.h);
                    }
                }

                ctx.beginPath();
                ctx.fillStyle = "#666";
                ctx.fillRect(r.x, r.y, r.w, r.h);

                // register rectangle to the 
                RECTANGLES.push(r);
            }
        }

        col++;
    });  
}

// render the definition through the whole octave [c1 - b1]
// as a table going from f#0 to c3
function renderOctave(input) {    
    // render patterns to the canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.font = FONT_SIZE + "px Helvetica";    
    
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // render 1st column & root row
    ctx.fillStyle = "red";
    ctx.textAlign = "center";

    var sri = input.structure.intervals.length - 1;
    var srj = 0;

    for (var i = 0; i < ROWS_COUNT; i++) {        
        // render root row after two whole structre rows
        if (i === input.structure.definition.length * 2 + 1) {
            ctx.fillText("R", (CELL_SIZE / 2), (i * CELL_SIZE) + (CELL_SIZE / 2) + (FONT_SIZE / 2));
            // render the root row
            for (var j = 1; j < COLUMNS_COUNT; j++) {
                ctx.fillText(OCTAVE[srj++].toUpperCase(), (j * CELL_SIZE) + (CELL_SIZE / 2), (i * CELL_SIZE) + (CELL_SIZE / 2) + (FONT_SIZE / 2));
            }
        } 
        // render a structre row
        else {
            ctx.fillText(input.structure.intervals[input.structure.intervals.length - 1 - sri++], (CELL_SIZE / 2), (i * CELL_SIZE) + (CELL_SIZE / 2) + (FONT_SIZE / 2));
        }  
        // reset the structure definition index
        if (sri === input.structure.intervals.length) {
            sri = 0;
        }
    }

    ctx.fillStyle = "black";

    var col = 1;    

    // render columns
    input.columns.forEach(column => {
        var skip = input.structure.definition.length - column.findIndex(n => n.name.includes(OCTAVE[col - 1]) && n.tier === 1);
        var row = ROWS_COUNT - skip - 1;
        var firstRow = row;

        column.forEach(note => {
            ctx.fillText(note.fingering, (col * CELL_SIZE) + (CELL_SIZE / 2), (row-- * CELL_SIZE) + (CELL_SIZE / 2) + (FONT_SIZE / 2));

            if (row === ROWS_COUNT - input.structure.definition.length - 1) {
                row--;
            }
        });        
        
        // TODO render slected patterns for the current column
        Object.keys(column.patterns).forEach(key => {            
            var patterns = column.patterns[key];
            var selected = column.patterns[key].selected;

            if (selected > -1) {
                // render the pattern rectangles
                patterns[selected].positions.forEach(position => {
                    var redRow = ROWS_COUNT - STRUCTURE.definition.length - 1;
                    var x = col;
                    var y = (firstRow - position[0] - Number.parseInt(key));
                    var w = 1;
                    var h = Number.parseInt(key);
                    
                    // Y correction   
                    if (y < redRow && y + h > redRow) {
                        h++;
                    }
                    else 
                    if (y >= redRow) {
                        y++;
                    }

                    var d = (Number.parseInt(key) - 2) * 2;

                    var xs = x * CELL_SIZE + d;
                    var ys = y * CELL_SIZE + d;
                    var ws = w * CELL_SIZE - (2 * d);
                    var hs = h * CELL_SIZE - (2 * d);

                    var color = COLORS[Number.parseInt(key) - 2];

                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.rect(xs, ys, ws, hs);
                    ctx.stroke();
                });
            }
        })   

        col++;
    })
}

function generate(name) {
    STRUCTURE = structures[name];

    initialize(STRUCTURE);

    INPUT = createOctave(STRUCTURE);    

    renderControls(INPUT);
    renderOctave(INPUT);

    console.log(INPUT);
}

function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    return { x : x, y : y};
}

function controlsClick(e) {    
    e.preventDefault();
    e.stopPropagation();

    var c = document.getElementById("buttons");
    var p = getCursorPosition(c, e);

    // get the mouse position
    var mx = p.x;
    var my = p.y;

    RECTANGLES.forEach(r => {
        // if is the click inside the rectangle
        if(mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h) {
            r.click();
        }
    });

    renderOctave(INPUT);
}

function controlsHover(e) {
    e.preventDefault();
    e.stopPropagation();

    var c = document.getElementById("buttons");
    var p = getCursorPosition(c, e);

    // get the mouse position
    var mx = p.x;
    var my = p.y;

    RECTANGLES.forEach(r => {
        // if is the click inside the rectangle
        if(mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h) {
            r.mouseenter();
        } else {
            r.mouseleave();
        }
    });
}

//
// Initialize the structure selector
//
$(document).ready(() => {
    var keys = Object.keys(structures);

    $("#structures").attr("size", keys.length);

    keys.forEach(n => {        
        $("#structures").append($("<option></option>").text(n).val(n));
    });

    $('#structures').change(() => { 
        var name = $("#structures").val();
        generate(name);
    });

    // render initial message
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.font= FONT_SIZE + "px Helvetica";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Select a structure from the list on the left.", canvas.height / 2, canvas.width / 2);

    // set event handler on the controls canvas
    document.getElementById('buttons').addEventListener('click', function(e){ controlsClick(e); });
    document.getElementById('buttons').addEventListener('mousemove', function(e){ controlsHover(e); });
});


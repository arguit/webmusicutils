var notesAll = [ "c", "c#", "db", "d", "d#", "eb", "e", "f", "f#", "gb", "g", "g#", "ab", "a", "a#", "bb", "b" ];
var notesSharp = [ "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b" ];
var notesFlat = [ "c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b" ];
var chordTypes = [ "M", "m", "M7", "m7", "7" ];
var chordDefinitions = {
  "M"  : [ 0, 4, 7 ],
  "m"  : [ 0, 3, 7 ],
  "M7" : [ 0, 4, 7, 11 ],
  "m7" : [ 0, 3, 7, 10 ],
  "7"   : [ 0, 4, 7, 10 ]
}

function getRandomNote() {
    return notesAll[Math.floor(Math.random() * notesAll.length)];
}

function getRandomChordType() {
    var selectedChords = getChords();
    return selectedChords[Math.floor(Math.random() * selectedChords.length)];
//    return chordTypes[Math.floor(Math.random() * chordTypes.length)];
}

function hasAccidental(note) {
    return note.length == 2;
}

function getAccidental(note) {
    return note[1];
}

function getNotes(note) {
    if (hasAccidental(note) && getAccidental(note) === "b") {
        return notesFlat;
    } else {
        return notesSharp;
    }
}

function getChord(note, type) {
  var result = [];
  var notes = getNotes(note);
  var index = notes.indexOf(note);
  var chord = chordDefinitions[type];
  chord.forEach(function(n, i) {
    var next = index + n > notes.length - 1
      ? notes[index + n - notes.length] + "/5"
      : notes[index + n] + "/4";
  	result.push(next);
  });
  return result;
}

function getRandomChord() {
    var note = getRandomNote();
    var type = getRandomChordType();
    var chord = getChord(note, type);
    var name = note[0].toUpperCase();
    if (note.length === 2) name += note[1];
    name += " ";
    name += type;

    return {
        "name" : name,
        "notes": chord
    }
}

function getTime() {
    return parseInt($("#timeRange").val());
}

function getChords() {
    var selectedChords = [];
    $.each($("input[name='chord']:checked"), function(){            
        selectedChords.push($(this).val());
    }); 
    return selectedChords;
}

function displayEmpty(chord) {
    $("svg").remove();

    VF = Vex.Flow;
    var div = document.getElementById("main")
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(300, 150);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
    var stave = new VF.Stave(20, 10, 300);
    stave.addClef("treble");
    stave.setContext(context).draw();
    var notes = [];   
    VF.Formatter.FormatAndDraw(context, stave, notes);

    $("#label").text(chord.name);
}

function displayChord(chord) {
    $("svg").remove();

    VF = Vex.Flow;
    var div = document.getElementById("main")
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(300, 150);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
    var stave = new VF.Stave(20, 10, 300);
    stave.addClef("treble");
    stave.setContext(context).draw();

    var notes = [];    
    console.log(chord);
    chord.notes.forEach(function(n, i) {
        var note = n.split("/")[0];
        if (hasAccidental(note)) {
            var accidental = getAccidental(note);
            var newNote = new VF.StaveNote({ keys: [n], duration: "w" }).addAccidental(0, new VF.Accidental(accidental));
            notes.push(newNote);
        } else {
            var newNote = new VF.StaveNote({ keys: [n], duration: "w" });
            notes.push(newNote);
        }
    });    
    VF.Formatter.FormatAndDraw(context, stave, notes);

    $("#label").text(chord.name);
}

function timerDown(seconds, callback) {
    var canvas = document.getElementById("timer");
    var ctx = canvas.getContext("2d");
    var r = 300;
    var g = 0;
    ctx.w = 300;

    createjs.Tween
        .get(ctx)
        .to({w:0}, seconds * 1000)
        .addEventListener("change", function(event) {
            ctx.fillStyle = "rgb(240, 240, 240)";
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = "rgb(" + (r - ctx.w) + ", " + (g + ctx.w) + ", 0)";
            ctx.fillRect(0, 0, ctx.w, 300);

            if (ctx.w === 0) {
                callback();
            }
        })
}

function timerUp(seconds, callback) {
    var canvas = document.getElementById("timer");
    var ctx = canvas.getContext("2d");
    var b = 0;
    ctx.w = 0;

    createjs.Tween
        .get(ctx)
        .to({w:300}, seconds * 1000)
        .addEventListener("change", function(event) {
            ctx.fillStyle = "rgb(240, 240, 240)";
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = "rgb(0, 0, " + (b + ctx.w) + ")";
            ctx.fillRect(0, 0, ctx.w, 300);

            if (ctx.w >= 300) {
                callback();
            }
        })
}

function zoom() { 
    var h = $("#controlsBoxChords").position().top +  $("#controlsBoxChords").height() * 4; 
    var s = $(window).height(); var z = (s / h) * 100; 
    $("body").css("zoom", "" + z +"%");
}

function execute() {
    var chord = getRandomChord();

    displayEmpty(chord);
    timerDown(getTime(), function() {
        displayChord(chord);
        timerUp(getTime(), execute);
    });
}

function init() {
    var slider = document.getElementById("timeRange");
    var output = document.getElementById("time");
    output.innerHTML = slider.value;
    
    slider.oninput = function() {
      output.innerHTML = this.value;
    }

    $(window).on('resize', function(){ zoom(); });
}

zoom();
init();
execute();
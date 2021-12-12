let PixelPerSecond = 40;
let subtitleEntries = [];
let subtitlesLength = 0;
let currentTimestamp = 0;
let nullTimestamp = +new Date;
let lastAutoScroll = +new Date;
let fontSize = 15;

window.onload = function () {
    let dropArea = document.body;

    addFontSize(0);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, preventDefaults, false))

    dropArea.addEventListener('drop', handleDrop, false);

    ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    });

    document.addEventListener ('wheel',function (e) {
        dontScrollUntil = 1000 +(+new Date)
    });

    let subtitleArea = document.querySelector("#subtitles");
    subtitleArea.addEventListener('dblclick', function (e) {
        nullTimestamp = (+new Date) - (e.offsetY / PixelPerSecond) * 1000
    });


    setInterval(updateProgress, 2);

    loadSrt("31\n00:00:05,000 --> 00:00:30,0\nSelect a subtitle file...\n\n\n- double click to set current position\n- use autoscroll to keep the text scrolling");
    renderSubtitles();
};

function addFontSize(x){
    fontSize += x
    document.body.style.fontSize = fontSize+"px";
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation()
}

function highlight(e) {
    let dropArea = document.body;
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    let dropArea = document.body;
    dropArea.classList.remove('highlight')
}

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    let reader = new FileReader();
    reader.readAsText(files[0]);

    reader.onloadend = function () {

        let text = reader.result;
        loadSrt(text);
        renderSubtitles();
    }
}


function loadSrt(strText) {
    let lines = strText.split("\n");
    console.log(lines);

    let entryIdRegex = /^(\d+)\s?$/;
    let timestampsRegex = /^(\d{1,2})\:(\d{1,2})\:(\d{1,2}),(\d{0,5}) --> (\d{1,2})\:(\d{1,2})\:(\d{1,2}),(\d{0,5})\s?$/;


    let entries = [];
    let entry = null;
    lines.forEach(line => {
        let foundEntryId = entryIdRegex.exec(line);

        if (foundEntryId) {
            if (entry) {
                entries.push(entry);
            }
            entry = {"id": foundEntryId[1], "from": 0, "to": 0, "text": ""}
        }

        let foundTimestamp = timestampsRegex.exec(line);
        if (foundTimestamp) {
            let start = parseFloat(foundTimestamp[1]) * 60 * 60 + parseFloat(foundTimestamp[2]) * 60 + parseFloat(foundTimestamp[3]) + parseFloat("0." + foundTimestamp[4]);
            let end = parseFloat(foundTimestamp[5]) * 60 * 60 + parseFloat(foundTimestamp[6]) * 60 + parseFloat(foundTimestamp[7]) + parseFloat("0." + foundTimestamp[8]);
            entry["start"] = start;
            entry["end"] = end;
        }

        if (!foundEntryId && !foundTimestamp) {
            entry["text"] += line.replace(/<[^<>]*>/g, "");
            entry["text"] += "</br>";
        }
    });

    entries.push(entry);
    subtitleEntries = entries;

    subtitlesLength = Math.max(...(subtitleEntries.map((entry) => entry["end"])));
}

function renderSubtitles() {
    let subtitleArea = document.querySelector("#subtitles-text");
    let subtitleTextArea = document.querySelector("#subtitles-text");
    preparedContent = "";


    subtitleArea.style.height = PixelPerSecond * subtitlesLength + "px";

    subtitleEntries.forEach(entry => {
            preparedContent += '<span class="subtitle-row" id="subtitle-row-id-' + entry["id"] + '" style="top:' + (entry["start"] * PixelPerSecond) + 'px;">' + entry["text"] + '</span>';
    });
    subtitleTextArea.innerHTML = preparedContent;
}

let dontScrollUntil = 0;
function updateProgress() {
    let subtitleProgress = document.querySelector("#subtitles-progress");
    let autoscrollCheckbox = document.querySelector("#autoscroll");
    currentTimestamp = (+new Date - nullTimestamp) / 1000;
    let newHeight = (currentTimestamp * PixelPerSecond);
    subtitleProgress.style.height = newHeight + "px";

    if (autoscrollCheckbox.checked) {

        if (newHeight > document.body.scrollTop) {
            if (newHeight < document.body.scrollTop + document.body.clientHeight) {
                if (+new Date > dontScrollUntil) {
                    if (document.body.scrollTop + document.body.clientHeight * 0.8 < newHeight) {
                        window.scroll({
                          top: newHeight - document.body.clientHeight * 0.8,
                          left: 0, 
                          behavior: 'smooth'
                        });
                        //window.scrollBy({
                        //    top: 10, // could be negative value
                        //    left: 0,
                        //    behavior: 'smooth'
                        //});
                        lastAutoScroll = +new Date
                    }
                }
            }
        }

        if(false){
            if (newHeight > document.body.scrollTop) {
                if (newHeight < document.body.scrollTop + document.body.clientHeight) {
                    if (lastAutoScroll + 2000 < +new Date) {
                        if (document.body.scrollTop + document.body.clientHeight * 0.8 < newHeight) {
                            window.scrollBy({
                                top: 300, // could be negative value
                                left: 0,
                                behavior: 'smooth'
                            });
                            lastAutoScroll = +new Date
                        }
                    }
                }
            }
        }
    }
}

function jump() {
    let height = (currentTimestamp * PixelPerSecond);
    window.scrollTo({top: height - document.body.clientHeight * 0.5, left: 0, behavior: 'smooth'});
}

function jumpto(value) {
    let ms = /^\s*(\d{1,2})\:(\d{1,2})\s*$/;
    let hms = /^\s*(\d{1,2})\:(\d{1,2})\:(\d{1,2})\s*$/;

    console.log(value);
    let msMatch = ms.exec(value);
    let hmsMatch = hms.exec(value);

    let h = 0;
    let m = 0;
    let s = 0;

    if (msMatch) {
        m = parseInt(msMatch[1]);
        s = parseInt(msMatch[2]);
    }

    if (hmsMatch) {
        h = parseInt(hmsMatch[1]);
        m = parseInt(hmsMatch[2]);
        s = parseInt(hmsMatch[3]);
    }
    let jumpto = h * 60 * 60 + m * 60 + s;
    console.log(jumpto);
    let height = (jumpto * PixelPerSecond);
    window.scrollTo({top: height - document.body.clientHeight * 0.5, left: 0, behavior: 'smooth'});
    nullTimestamp = (+new Date) - jumpto * 1000;
}

function newSrtUpload(obj) {
    let reader = new FileReader()
    reader.readAsText(obj.files[0])

    reader.onloadend = function () {

        let text = reader.result;
        loadSrt(text);
        renderSubtitles();
    }
}

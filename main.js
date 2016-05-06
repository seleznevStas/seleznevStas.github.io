var stampCanvases = null;
var contexts = [];
var isDrawing = false;
var isStart = true;
var time = 0;
var clockInterval = null;
var mouseX = 0;
var mouseY = 0;
var lastZIndex = 1000;
var dragSettings = {};
var drawSettings = {};
var terminalSettings = {
    active: false,
    text: [
        "# FROM THE GARDEN OF EDEN \n\
# TO THE BRANCHES OF MACINTOSH",
        "            ### \/#|### |/####\n\
           ##\/#/ \||/##/_/##/_###\n\
          ###  \/###|/ \/ # #######\n\
         ##_\_#\_\## | #/###_/_####\n\
        ## #### # \ #| /  #### ##/##\n\
         __#_--###`  |{,###---###-~\n\
                  \ }{\n\
                    }}{\n\
                    }}{\n\
                    {{}\n\
           , -=-~{ .-^- _\n\
               `}\n\
                {\n",
        "# APPLE PICKING HAS ALWAYS COME\n\
AT A GREAT COST",
        "                       .8\n\
                      .888\n\
                    .8888'\n\
                   .8888'\n\
                   888'\n\
                   8'\n\
      .88888888888. .88888888888.\n\
   .8888888888888888888888888888888.\n\
 .8888888888888888888888888888888888.\n\
.&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'\n\
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'\n\
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'\n\
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:\n\
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:\n\
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:\n\
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%.\n\
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%.\n\
`%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%.\n\
 `00000000000000000000000000000000000'\n\
  `000000000000000000000000000000000'\n\
   `0000000000000000000000000000000'\n\
     `###########################'\n\
       `#######################'\n\
         `#########''########'\n\
           `\"\"\"\"\"\"'  `\"\"\"\"\"'\n"
    ],
    currentParagraph: 0,
    currentIndex: 0
};

$(init);

function init() {
    $("#menuItem-about").on("click", menuItemAbout_click);
    $("#notification").on("click", notification_click);
    $("#desktopIcon-folder").on("click", folder_click);
    $("#desktopIcon-chrome").on("click", chrome_click);
    $("#desktopIcon-video").on("click", video_click);
    $("#desktopIcon-help").on("click", help_click);
    $("#desktopIcon-bin").on("click", bin_click);
    $("#desktopIcon-save").on("click", save_click);
    $("#dockIcon-messenger").on("click", messenger_click);
    $("#dockIcon-terminal").on("click", terminal_click);

    $(".dockIcon__image-drawable").on("mousedown", dockIcon_mousedown);

    $(window).on("resize", canvas_resize);
    $(document).on("mousemove", draw_mousemove);
    $(document).on("mouseup", draw_mouseup);
    $(document).on("click", document_click);

    $(".window-movable .window__dragBlock").on("mousedown", windowDragBlock_mousedown).on("mouseup", windowDragBlock_mouseup);
    $(document).on("mousemove", windowDragBlock_mousemove);
    $(".window-closable .window__closeButton").on("click", windowCloseButton_click);

    $("#window-start").on("window:close", windowStart_checkForStart);
    $("#window-video").on("window:close", windowVideo_checkForStart);
    $("#window-chrome").on("window:close", windowChrome_returnIPerson);

    $(".window-drawable").on("window:activated", drawableWindow_activated).on("window:deactivated", drawableWindow_deactivated).on("window:close", drawableWindow_close);

    $(document).on("mousemove", ".imageThumb img", showFullImage).on("mouseleave", ".imageThumb img", hideFullImage);

    $("#window-terminal").on("window:open window:activated", terminalWindow_activated).on("window:close", terminalWindow_deactivated);

    $(".tabs__button").on("click", tabsButton_click);
    $(".window").on("window:open", window_open).on("window:open window:activated", window_activated);
    $("#applePopupButton").on("click", applePopupButton_click);
    $("#appleIPerson").on("mousedown", appleIPerson_mousedown).on("mouseup", appleIPerson_mouseup);

    $(".facebookStatus").on("keypress", facebookStatus_keyPress);
    $("#facebookReset").on("click", facebookReset_click);
    $("#spotifyPopupButton").on("click", spotifyPopupButton_click);
    $("#spotifySoundButton").on("click", spotifySoundButton_click);
    $("#window-video").on("window:open", videoWindow_open).on("window:close", videoWindow_close);
    $(document).on("keypress", terminal_keypress);

    $("#window-end1, #window-end2, #window-end3").on("window:close", endWindow_close);

    openWindow("window-start");
    updateClock();
    displaySavedImages();
}

function menuItemAbout_click() {
    openWindow("window-about");
}

function notification_click() {
    openWindow("window-poem");
}

function bin_click() {
    isStart = false;

    for (var i = 0; i < contexts.length; i++) {
        var stampCanvas = stampCanvases[i];
        contexts[i].clearRect(0, 0, stampCanvas.width, stampCanvas.height);
    }

    $(".window").each(function () {
        $w = $(this);
        if (!$w.hasClass("window-hidden")) {
            $w.addClass("window-hidden");
            $w.trigger("window:close");
        }
    });

    var $chromeTabs = $("#window-chrome .tabs__content");
    $chromeTabs.addClass("tabs__content-hidden");
    $($chromeTabs[0]).removeClass("tabs__content-hidden");

    $(".facebookStatus").val("");

    $(".window__content-poem")[0].scrollTop = 0;
    $(".window__content-messenger")[0].scrollTop = 0;

    $("#window__content-terminal pre").text("");
    terminalSettings.currentIndex = 0;
    terminalSettings.currentParagraph = 0;
    var terminal = $("#terminalText")[0];
    terminal.scrollTop = 0;
}

function save_click() {
    $(".dock, .toolbar, .desktop").css("display", "none");
    html2canvas(document.body, {
        onrendered: function (canvas) {
            var filledCanvas = document.createElement("canvas");
            filledCanvas.width = canvas.width;
            filledCanvas.height = canvas.height;
            var ctx = filledCanvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, filledCanvas.width, filledCanvas.height);
            ctx.drawImage(canvas, 0 ,0);

            var savedImages = localStorage.getItem("savedImages");
            savedImages = savedImages ? JSON.parse(savedImages) : [];
            savedImages.push(filledCanvas.toDataURL());
            localStorage.setItem("savedImages", JSON.stringify(savedImages));
            displaySavedImages();
        }
    });
    $(".dock, .toolbar, .desktop").css("display", "block");
}

function folder_click() {
    openWindow("window-folder");
}

function chrome_click() {
    openWindow("window-chrome");
}

function video_click() {
    openWindow("window-video");
}

function help_click() {
    $(".notification__help").toggleClass("notification__help-hidden");
    $(".desktopIcon__help").toggleClass("desktopIcon__help-hidden");
    $(".dockIcon__help").toggleClass("dockIcon__help-hidden");
}

function messenger_click() {
    openWindow("window-messenger");
}

function terminal_click() {
    openWindow("window-terminal");
}

function dockIcon_mousedown(e) {
    lastZIndex++;

    var newCanvas = $("<canvas class='stampCanvas'></canvas>").attr({
        width: window.innerWidth,
        height: window.innerHeight
    }).css("zIndex", lastZIndex).appendTo(document.body);
    var ctx = newCanvas[0].getContext("2d");

    var image = new Image();
    image.onload = function () {
        isDrawing = true;
    };

    drawSettings = {
        image: image,
        offsetX: 30,
        offsetY: 30,
        width: 60,
        height: 60,
        context: ctx
    };

    var value = $(e.target).css("background-image");
    image.src = value.substr(5, value.length - 7);

    stampCanvases = $(".stampCanvas");
    contexts.push(ctx);

    deselect();
}

function canvas_resize() {
    if (!stampCanvases) return;

    stampCanvases.each(function (i, stampCanvas) {
        var context = contexts[i];
        var oldImage = context.getImageData(0, 0, stampCanvas.width, stampCanvas.height);
        stampCanvas.width = window.innerWidth;
        stampCanvas.height = window.innerHeight;
        context.putImageData(oldImage, 0, 0);
    });
}

function draw_mousemove(e) {
    var LEFT_MOUSE_KEY = 1;
    mouseX = e.pageX;
    mouseY = e.pageY;
    isDrawing = isDrawing && (e.buttons & LEFT_MOUSE_KEY);
}

function draw_mouseup() {
    isDrawing = false;
}

function document_click() {
    new Audio("data/click.mp3").play();
}

function windowDragBlock_mousedown(e) {
    var $this = $(this);
    var $window = $this.closest(".window-movable");
    var windowOffset = $window.offset();

    dragSettings = {
        element: $window,
        x: e.pageX - windowOffset.left,
        y: e.pageY - windowOffset.top
    };

    $window.trigger("window:activated", [dragSettings.x, dragSettings.y]);
}

function windowDragBlock_mouseup() {
    dragSettings = {};
    $(this).trigger("window:deactivated");
}

function windowDragBlock_mousemove(e) {
    var window = dragSettings.element;
    if (!window) return;
    var left = e.pageX - dragSettings.x;
    var top = e.pageY - dragSettings.y;

    window.offset({
        left: left,
        top: top
    });
}

function windowCloseButton_click() {
    var $this = $(this);
    var $window = $this.closest(".window-closable");
    $window.addClass("window-hidden");
    $window.trigger("window:close");
}

function windowStart_checkForStart() {
    if (isStart) {
        openWindow("window-video");
    }
}

function windowVideo_checkForStart() {
    if (isStart) {
        openWindow("window-needHelp");
        openWindow("window-poem");
        isStart = false;
    }
}

function windowChrome_returnIPerson() {
    var $iperson = $("#appleIPerson");
    var $appleTab = $(".tabs__content-apple");
    $iperson.css({top: 200, left: 320}).appendTo($appleTab);
}

function drawableWindow_activated(e, x, y) {
    lastZIndex++;

    var newCanvas = $("<canvas class='stampCanvas'></canvas>").attr({
        width: window.innerWidth,
        height: window.innerHeight
    }).css("zIndex", lastZIndex).appendTo(document.body);
    var ctx = newCanvas[0].getContext("2d");

    var $window = $(this);

    var image = new Image();
    image.onload = function () {
        isDrawing = true;
    };

    drawSettings = {
        image: image,
        offsetX: x,
        offsetY: y,
        width: $window.width(),
        height: $window.height(),
        context: ctx
    };

    stampCanvases = $(".stampCanvas");
    contexts.push(ctx);

    var value = $window.css("background-image");
    image.src = value.substr(5, value.length - 7);
}

function drawableWindow_deactivated() {
    drawSettings = {};
}

function drawableWindow_close() {
    var lastIndex = stampCanvases.length - 1;
    if (lastIndex === -1) return;

    var stampCanvas = stampCanvases[lastIndex];
    var context = contexts[lastIndex];
    context.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
}

function showFullImage(e) {
    var url = $(this).attr("src");
    var $fullImage = $("#fullImage");
    if (!$fullImage.length) {
        $fullImage = $("<div id='fullImage'><img width='600' /></div>").appendTo(document.body);
    }

    $fullImage.css({
        top: e.screenY,
        left: e.screenX
    }).find("img").attr("src", url);
}

function hideFullImage(e) {
    $("#fullImage").remove();
}

function terminalWindow_activated() {
    terminalSettings.active = true;
}

function terminalWindow_deactivated() {
    terminalSettings.active = false;
}

function tabsButton_click() {
    var $this = $(this);
    var tabs = $this.closest(".tabs");
    tabs.find(".tabs__content").addClass("tabs__content-hidden");
    $this.next(".tabs__content").removeClass("tabs__content-hidden");
}

function window_open() {
    new Audio("data/window-open.mp3").play();
}

function window_activated() {
    var $window = $(this);
    lastZIndex++;
    $window.css("zIndex", lastZIndex);
}

function applePopupButton_click() {
    openWindow("window-apple");
}

function appleIPerson_mousedown(e) {
    var $this = $(this);
    var offset = $this.parent().offset();
    var left = parseInt($this.css("left")) + offset.left;
    var top = parseInt($this.css("top")) + offset.top;
    $this.appendTo(document.body).css({"left": left, "top": top, "zIndex": 3999});

    dragSettings = {
        element: $this,
        x: e.pageX - left,
        y: e.pageY - top
    };
    return false
}

function appleIPerson_mouseup() {
    dragSettings = {};
}

function facebookStatus_keyPress(e) {
    var textarea = $(this),
        numberOfLines = (textarea.val().match(/\n/g) || []).length + 1,
        maxRows = 3;

    if (e.which === 13 && numberOfLines === maxRows) {
        return false;
    }
}

function facebookReset_click() {
    $(".facebookStatus").val("");
}

function spotifyPopupButton_click() {
    openWindow("window-spotify");
}

function spotifySoundButton_click() {
    new Audio("data/spotifyClick.mp3").play();
}

function videoWindow_open() {
    $(this).find("video")[0].play();
    $("#curtain").removeClass("curtain-hidden");
}

function videoWindow_close() {
    $(this).find("video")[0].pause();
    $("#curtain").addClass("curtain-hidden");
}

function terminal_keypress() {
    if (!terminalSettings.active) {
        return;
    }

    var paragraph = terminalSettings.currentParagraph;
    var index = terminalSettings.currentIndex;
    var text = terminalSettings.text[paragraph];
    var $displays = $(".terminalText pre");

    do {
        index++;
        if (index === text.length) {
            $($displays[paragraph]).text(text);

            paragraph++;
            if (paragraph === terminalSettings.text.length) {
                return;
            }
            index = 0;
            text = terminalSettings.text[paragraph];
        }
    } while (text[index] === " ");

    var $display = $($displays[paragraph]);
    $display.text(text.substring(0, index));
    terminalSettings.currentIndex = index;
    terminalSettings.currentParagraph = paragraph;

    var terminal = document.getElementById("window__content-terminal");
    terminal.scrollTop = terminal.scrollHeight;
}

function endWindow_close() {
    $("#window-end1, #window-end2, #window-end3").addClass("window-hidden");

    isStart = false;

    for (var i = 0; i < contexts.length; i++) {
        var stampCanvas = stampCanvases[i];
        contexts[i].clearRect(0, 0, stampCanvas.width, stampCanvas.height);
    }

    $(".window").each(function () {
        $w = $(this);
        if (!$w.hasClass("window-hidden")) {
            $w.addClass("window-hidden");
            $w.trigger("window:close");
        }
    });

    var $chromeTabs = $("#window-chrome .tabs__content");
    $chromeTabs.addClass("tabs__content-hidden");
    $($chromeTabs[0]).removeClass("tabs__content-hidden");

    $(".facebookStatus").val("");

    $(".window__content-poem")[0].scrollTop = 0;
    $(".window__content-messenger")[0].scrollTop = 0;

    $("#window__content-terminal pre").text("");
    terminalSettings.currentIndex = 0;
    terminalSettings.currentParagraph = 0;
    var terminal = $("#terminalText")[0];
    terminal.scrollTop = 0;
}

function draw() {
    if (!isDrawing) return;
    deselect();
    drawSettings.context.drawImage(drawSettings.image, mouseX - drawSettings.offsetX, mouseY - drawSettings.offsetY, drawSettings.width, drawSettings.height);
}

setInterval(draw, 20);

function updateClock() {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    var clockText = minutes < 10 ? "0" + minutes : "" + minutes;
    clockText += ":";
    clockText += seconds < 10 ? "0" + seconds : "" + seconds;
    $("#clock").text(clockText);
    time++;
    if (time === 300) {
        openWindow("window-end1");
        openWindow("window-end2");
        openWindow("window-end3");
    }

}

clockInterval = setInterval(updateClock, 1000);

function deselect() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

function openWindow(windowId) {
    var $window = $("#" + windowId);
    if ($window.hasClass("window-hidden")) {
        $window.removeClass("window-hidden");
        $window.trigger("window:open");
    }
}

function displaySavedImages() {
    var savedImages = localStorage.getItem("savedImages");
    savedImages = savedImages ? JSON.parse(savedImages) : [];
    var $container = $("#savedImages");
    $container.empty();
    for (var i = 0; i < savedImages.length; i++) {
        $("<div class='imageThumb'></div>").append($("<img width='150' />").attr("src", savedImages[i])).appendTo($container);
    }
}
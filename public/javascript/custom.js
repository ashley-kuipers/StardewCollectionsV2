let buttonInfo = {};
let changedButtons = []
$('.item-button').on({
  mouseenter: function(){  // when you start hovering over a button
    buttonInfo = Object($(this).data("button"))
    let dataPaneHTML = "<p><span style='font-size:1.2rem'>" + buttonInfo.itemName + "</span><br><span style='font-weight: normal'><u>" + buttonInfo.title1 + "</u><br>" + buttonInfo.info1 + "<br><u>" + buttonInfo.title2 + "</u><br>" + buttonInfo.info2 + "<br><u>" + buttonInfo.title3 + "</u><br>" + buttonInfo.info3 + "<br><u>" + buttonInfo.title4 + "</u><br>" + buttonInfo.info4 + "</p></span>";
    $('#item-info-hover').html(dataPaneHTML)
  },
  mouseleave: function(){ // when you stop hovering a button
    $('#item-info-hover').text("")
  },
  mousedown: function(e){ // when you click a button, divided into 3 mouse button cases
    e.preventDefault()
    switch (event.which) {

      case 1: // Left mouse button is pressed - set button as pressed
        $(this).toggleClass('inset')
        $(this).removeClass('green-background')
        // set checked value and add button to changed buttons array
        // (this changes the checked value for all instances of the button in the array which allows to use map to remove duplicates in next step)
        if($(this).hasClass('inset')){
          buttonInfo.checked = true
        } else {
          buttonInfo.checked = false
        }
        changedButtons.push(buttonInfo)
        // remove duplicate values if there are any
        changedButtons = [...new Map(changedButtons.map(v => [JSON.stringify([v.itemName,v.link]), v])).values()]
        break;

      case 2: // Middle mouse button is pressed - nothing
        break;

      case 3: // Right mouse button is pressed
        const stayinfoid= "rightClicked-" + buttonInfo.link

        if ($(this).hasClass('inset')){
          // if already checked, don't do anything
          break;
        } else {
          //check if it's already been right clicked (if the div with the stay info is already there, then it's obviously right clicked)
          if($("#" + stayinfoid).length > 0){
            $("#" + stayinfoid).remove();
            $(this).toggleClass('green-background');
          } else {
            $('#item-info-stay').append("<div id="+ stayinfoid + "><p><span style='font-size:1.2rem'>" + buttonInfo.itemName + "</span><br><span style='font-weight: normal;'><u>" + buttonInfo.title1 + "</u><br>" + buttonInfo.info1 + "</p></span></div>");
            $(this).toggleClass('green-background')
          };
          break;
        }

      default:
        alert('Nothing')
      }
  },
  onLoadButtonEvent: function(e){ // when the button loads, have to fix the backgrounds for some
    buttonInfo = Object($(this).data("button"))
    if (buttonInfo.checked === true){
      $(this).addClass("inset")
    }
    if (buttonInfo.info4 === "Sun"){
      $(this).addClass("yellow-background")
    }
    if (buttonInfo.info4 === "Rain"){
      $(this).addClass("blue-background")
    }

  }
})

$(document).ready(function(){
  // loading gif
  setTimeout(function () {
    $("#loader").addClass('hidden')
  }, 2000);



  // category buttons (sets first button to start as clicked)
  $("#v-pills-tab button:first-child").click().addClass('inset')
  $("#v-pills-tab button:not(:first)").click(function(){
    $("#v-pills-tab button:first-child").removeClass('inset')
  })

  // check for different background colors and add initial checked value to button
  $(".item-button").trigger("onLoadButtonEvent");

  // on form submit, check how many chagned buttons in array, if none, don't do anything and alert "no changes"

  $("#save").submit(function(e){
    if(changedButtons.length === 0){
      e.preventDefault();
      alert("No changes have been made")
    } else {
      $("#changes").val(JSON.stringify(changedButtons)) // sends changes to the hidden input to go to server
    }
  });

  $("#back").submit(function(e){
    if(changedButtons.length > 0){
      if(confirm("You have unsaved changes. These will be lost. Go back anyway?") ==false){
        e.preventDefault();
      }
    }
  });

})

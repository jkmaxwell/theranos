/*

- put five minute timeout on door close at end of thing with the door hanging open
- return reader to the screen
- make input fields store and retrieve data
- put clock screens in for duration
- put mike's new words in there for how much questions

*/

var DEBUG=true;								// TOGGLE FIREBUG DEBUGGING -- set in TheranOS prefs

var TheranOS = { };									// Set up TheranOS Namespace
	TheranOS.Strings = { };							// Set up Strings for localization
	TheranOS.currentPage = null;

function clone(object) { 					// from Pro Javascript Design Patterns: Clone function for Prototypal inheiritance
	function F() {}
	F.prototype = object;
	return new F();
} 





// PAGE DRAW FUNCTION
function page(oData, sDestination, sMode) {

	$.log("Drawing " + TheranOS.currentPage + ". Type is " + sType);

    var sType = $(sDestination, oData).attr('type');
    var oContent = $('content:first', $(sDestination, oData));
    var sName = $(sDestination, oData).attr('name');

	// SET REFERENCE TO CURRENT PAGE FOR NAV
	TheranOS.currentPage = sName;
	
    var sBackgroundImage = $(sDestination, oData).attr('background');
	var sReaderAction = $(sDestination, oData).attr('action');

	var iContentWidth = oContent.attr('width') || 580;
	
	// LAUNCH APPROPRIATE ACTION
	$.log('Do we have an action? ' + sReaderAction);
	if(sReaderAction) {
		switch(sReaderAction) {
			case "begin":
				$.get('http://localhost/Assay/APP/app?stage=begin',function(data){
					$.log('page: action: response = '+data)
				})
				break;
			case "open_tray":
				$.get('http://localhost/Assay/APP/app?stage=open_tray',function(data){
					$.log('page: action: response = '+data)
				})
				// needs to start polling http://localhost/Assay/APP/app?method=cmd_is_done&args=tray and listen for a 1 (done) and then enable the button
				break;
			case "close_tray":
				$.get('http://localhost/Assay/APP/app?stage=close_tray',function(data){
					$.log('page: action: response = '+data)
				})
				// needs to start polling http://localhost/Assay/APP/app?method=cmd_is_done&args=tray and listen for a 1 (done) and then enable the button
				break;
		case "begin_assay":
		    var _assayString ='';
		    $.get('http://localhost/Assay/APP/app?stage=run_proto',
			  function(data){
			      $.log('page: action: response = '+data);
			      _assayString = data;
                              //alert(_assayString);
                              $.get('http://localhost/Assay/'+_assayString+'/app?stage=do_proto',
				    function(data) {
					$.log('page: action: response = '+data);
					// needs to start polling http://localhost/Assay/APP/app?method=get_progress and listen for a 100 (done) and then
				    })
			      function recursiveCall() {
				  	$.get('http://localhost/Assay/'+_assayString+'/app?method=get_progress',
						function(data){
					    	if (parseInt(data) >= 100) { TheranOS.UI.drawPage('screen[name="test_eject"]', "whiteout"); }
							else {
								$('div','.statusBar').css('width',((parseInt(data)/100)*280)+'px');
								setTimeout(function(){recursiveCall()},1000);
					    	}
						}
					)
			      }
			      // Start polling in 5 seconds
			      setTimeout(function(){recursiveCall()},5000);
			  })
		    break;
		default:
		}
	}

	function pageSkeleton(sBgImg,sAlign,sValign) {
		// CREATE PAGE ELEMENT WITH CLASS AND ID
		var _elem = $('<div class="page" id="' + TheranOS.currentPage + '"><div class="positioner"/></div>');
		
	    // ATTACH BACKGROUND IF IT'S PRESENT
		if (sBgImg) { $(_elem).css('background', "#fff url('images/" + TheranOS.currentPage + ".png')"); }

	    // CHECK PAGE ALIGNMENT OF INCOMING PAGE
	    if (sAlign) { _elem.addClass('horizontal-' + oContent.attr('align')); }
	    if (sValign) { _elem.addClass('vertical-' + oContent.attr('valign')); }	
		
		return _elem;
	}
	
    var elem = pageSkeleton( sBackgroundImage, oContent.attr('align'), oContent.attr('valign') )
	
    // APPEND TEXT BLOCKS
    $('text', oContent).each(function(i) {
		$.log("Writing text block with: "+$(this).text())
		$('.positioner:first',elem).append( $('<p>').append(TheranOS.Util.getLocalizedString($(this).text())).addClass($(this).attr('class')) )
	});

	// SET WIDTH OF P IF SPECIFIED
    if (iContentWidth < 580) {
        $.log('Content has specified width: ' + iContentWidth)
        $('.positioner:first',elem).css('width', iContentWidth + 'px')
	}

	// WRAP STATUS PAGE IN A STATUS BLOCK
	if (sType == "status") {
		$.log("Page Type: Status");
		$('p',elem).wrapAll($('<div class="statusBox" />')).wrapAll('<div class="statusBox-middle" />');
		$('div.statusBox',elem).prepend($('<div class="statusBox-top">')).append($('<div class="statusBox-bottom">'));
		if ($('statusbar',oContent).size()) {
			$.log("Found "+$('statusbar',oContent).size()+" statusbar(s): "+oContent.toString())
			var statusBar = clone(TheranOS.UI.ProgressBar);
			// var progressBar = new TheranOS.UI.ProgressBar();
			$('div.statusBox-middle',elem).append(statusBar.draw());
		}
		if(sName == "power" || sName == "test_done"){
			$.log('{We have a Power screen}');
			$('div.statusBox',elem).click(function(){ TheranOS.UI.drawPage('screen[name="start"]', "whiteout") });
			_powerDownTextTime = 30;
			function _powerDownText(){
				if(_powerDownTextTime>-1){
					var _s = (_powerDownTextTime > 1) ? "s" : "";
					var _x = Math.pow(((_powerDownTextTime+3)/30),1.5);
					
					$('p:last','div.statusBox').text('Entering standby mode in '+_powerDownTextTime+' second'+_s+'. Touch the screen at any time to resume.');
					$('div.statusBox').css('opacity',_x)
					_powerDownTextTime--;
					setTimeout(function(){_powerDownText()},1000)
				}
			}	
			setTimeout(function(){_powerDownText()},1000)
		}
	}
	
	// Build Text Input
	$('textinput', oContent).each(function(){
		$.log('textinput found');
		// does it have an existing value stored in memory?
		var textInputName = $(this).attr('name');
		
		$('.positioner:first',elem).append($('<input class="tui-entry-field">').attr('name',textInputName).css({
			background: "#fff url(/images/input_textfield.gif) no-repeat left top",
			border: "none",
			margin: "40px 0px",
			width: "556px",
			height: "65px",
			padding: "7px 12px 0px",
			fontFamily: 'Courier, "Courier New"',
			fontSize: "58px",
			color: "rgb(64,128,0)"
		}).bind('focus', function(e) {

				// hide any visible keyboards:
				jQuery('.tui-container').animate({opacity: 0}, 'slow', 'linear', function() {
					jQuery(this).remove();
				})

				var currentValue = this.value;
				var selectedInput = this;

				jQuery("body").append(
					jQuery("<div class='tui-container'>")
						.append("<div class='tui-row tui-row-1'>")
						.append("<div class='tui-row tui-row-2'>")
						.append("<div class='tui-row tui-row-3'>")
						.append("<div class='tui-row tui-row-4'>")
						.append("<div class='tui-row tui-row-5'>")

				);

				jQuery([keys.rowOne, keys.rowTwo, keys.rowThree, keys.rowFour, keys.rowFive ]).each(function() {

					var d = this.div;

					jQuery(this).each(function() {
					var kv = this + "";

					var classNames = "tui-key";
					if (kv.length > 1) classNames += " tui-special-key";
					if (kv.toLowerCase() == "space") classNames += " tui-spacebar-key";

					jQuery(d).append( jQuery("<div class='" + classNames + "'>")
						.append($('<span>').append(kv)) 
						.bind('mousedown', function(e) {
							//e.stopPropagation();
							e.preventDefault();
							var i = 0;
							var key = this;

							// parse for key, branch for special keys

							var k = jQuery(key).text();

							if (k.toLowerCase() == "enter") { // TBD: do we care about new lines?
								currentValue += "\n";
								selectedInput.value = currentValue;
							}
							else if(k.toLowerCase() == "shift") { // TBD, latch a shift state
							}
							else if(k.toLowerCase() == "space") {
								currentValue += " ";
								selectedInput.value = currentValue;
							}
							else if(k.toLowerCase() == "delete") {
								if (currentValue.length > 0)
									currentValue = currentValue.substring(0, currentValue.length-1);
								selectedInput.value = currentValue;
							}
							else {
								currentValue += jQuery(key).text();
								selectedInput.value = currentValue;
							}			
						}));
					});
				});

				jQuery(".tui-container")
					.append(
						jQuery("<div class='close'>")
							.append("<span>Enter</span>")
							.click(function() {
								// enable next button
								$.log("$('.tui-entry-field').val().length = "+$('.tui-entry-field').val().length)
								if ($('.tui-entry-field').val().length > 0) {
									TheranOS.Data.User.clear('id_clinician')
									TheranOS.Data.User.write('id_clinician',$('.tui-entry-field').val())
			                    	$('.disabled').fadeTo(500, 1.0).removeClass('disabled');
								} else {
				                    $('.button.next').fadeTo(500, 0.1).addClass('disabled');
								};	
								jQuery(".tui-container").fadeOut('fast', function() {
									jQuery(".tui-container").remove();
								});
								
							})
					)
					.css({opacity: 0, visibility: 'visible'})
					.animate({opacity: 1}, 'slow')

			}))
	})
	
    $('survey', oContent).each(function(i) {
        // BUILD SURVEYS
		$.log('page: survey: building type="'+$(this).attr('type')+'"')
		
		elem.addClass('survey')
        switch ($(this).attr('type')) {
	        case "feel":
	            $('.positioner:first',elem).append(TheranOS.UI.Survey.Smiley())
	                break;
	        case "one":
				var that = this;
	            $('option', this).each(function(i) {
					var optionName = $(this).text()
	                $('<label>')
						.click(function() {
							TheranOS.Data.User.clear($(that).attr('name'))
							TheranOS.Data.User.write($(that).attr('name'),optionName)
	                    	$('.radio').removeClass('checked');
	                    	$('.disabled').fadeTo(500, 1.0).removeClass('disabled');
	                    	// ACTIVATE 'NEXT' BUTTON
	                    	$('.radio',this).addClass('checked')
	                    	})
						.append($('<div class="radio">'))
						.append(TheranOS.Util.getLocalizedString($(this).text()))
						.appendTo($('.positioner:first',elem))
					if(TheranOS.Data.User.read($(that).attr('name'))) {
						$.log('Found some data in them hills')
						$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read($(that).attr('name')))
						if (optionName == TheranOS.Data.User.read($(that).attr('name'))) {
							$.log('Clicked')
							$('label:last',elem).trigger('click')
						}
					}
                })
                break;
	        case "one-or-none":
				var that = this;
	            $('option', this).each(function(i) {
					var optionName = $(this).text()
	                $('<label>')
						.click(function() {
							TheranOS.Data.User.clear($(that).attr('name'))
							TheranOS.Data.User.write($(that).attr('name'),optionName)
		                    $('.radio').removeClass('checked');
		                    $('.disabled').fadeTo(500, 1.0).removeClass('disabled');
		                    // ACTIVATE 'NEXT' BUTTON
		                    $('.radio',this).addClass('checked')
		                })
						.append($('<div class="radio">'))
						.append(TheranOS.Util.getLocalizedString($(this).text()))
						.appendTo($('.positioner:first',elem))	
					if(TheranOS.Data.User.read($(that).attr('name'))) {
						$.log('Found some data in them hills')
						$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read($(that).attr('name')))
						if (optionName == TheranOS.Data.User.read($(that).attr('name'))) {
							$.log('Clicked')
							$('label:last',elem).trigger('click')
						}
					}
	            })
				$('label:not(:last)',elem).wrapAll('<div class="column" style="border-right: 1px solid rgb(130, 130, 130); padding-right: 40px;">');
				$('label:last',elem).wrapAll('<div class="column" style="margin-right: 0px">');
	            break;
	        case "many":
				var that = this;
	            $('option', this).each(function(i) {
					var optionName = $(this).text()
	                $('<label>')
						.append($('<div class="checkbox">'))
						.append(TheranOS.Util.getLocalizedString($(this).text()))
						.click(function() {
							if ($('div.checkbox',this).hasClass('checked')) {
								TheranOS.Data.User.clear($(that).attr('name'),optionName)
							} else {
								TheranOS.Data.User.write($(that).attr('name'),optionName)
							}
	                    	$('.disabled').fadeTo(500, 1.0).toggleClass('disabled');
	                   		// ACTIVATE 'NEXT' BUTTON
	                    	$('div.checkbox',this).toggleClass('checked')
	                        if (($('.checkbox.checked').size() < 1) && (!$('.button.next').hasClass('disabled'))) {
	                        	$('.button.next').fadeTo(500, 0.1).toggleClass('disabled');
	                        	// DEACTIVATE 'NEXT' BUTTON
	                        }
	                	})
						.appendTo($('.positioner:first',elem))
					if(TheranOS.Data.User.read($(that).attr('name'))) {
						$.log('Found some data in them hills')
						$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read($(that).attr('name')))
						if (TheranOS.Data.User.read($(that).attr('name')).indexOf(optionName) > 0) {
							$.log('Clicked')
							$('label:last',elem).trigger('click')
						}
					}
				})
	            break;
			case "increasing":
				var that = this;
				elem.addClass('increasing')
	        	$('option', this).each(function(i) {
					var optionName = $(this).text()
		            $('<label>').append($('<div class="radio">').click(function() {
						TheranOS.Data.User.clear($(that).attr('name'))
						TheranOS.Data.User.write($(that).attr('name'),optionName)
	                    $('.radio').removeClass('checked');
		                $('.disabled').fadeTo(500, 1.0).toggleClass('disabled');
		                // ACTIVATE 'NEXT' BUTTON
	                    $(this).addClass('checked')
	            	})).append(TheranOS.Util.getLocalizedString($(this).text())).append($('<span class="units">'+$(this).attr('units')+'</span>')).appendTo($('.positioner:first',elem))
	            })
	            break;	
	        default:
        }
		// squish if needed
		if ($(this).attr('squish')) {
			$('label:not(:first-child)',elem).css("margin-top","10px")
			$('.column > label:first-child',elem).css("margin-top","0px")
			$('.column',elem).css("margin-top","16px")
		}
		
        // break it up into columns if desired
        if ($(this).attr('columns')) {
            $(elem).addClass('columns-' + $(this).attr('columns'))
                var iNumColumns = $(this).attr('columns');
            var iNumItems = $('option', this).size();
            var iDivisor = iNumItems / iNumColumns;
            var iLeftover = iNumItems % iNumColumns;
            var elemTemp = elem;
            for (var i = 0; i < iNumColumns; i++) {
                var _from = (i * Math.floor(iDivisor));
                var _to = ((i + 1) * Math.ceil(iDivisor));
                $.log("iDivisor = " + iDivisor)
                    $.log("SURVEY: Put items from " + _from + " to " + _to + " into column " + (i + 1))
                    $('label', elem).slice(_from, _to).wrapAll('<div class="column">')
                }
            var elemTemp = null;
        }
    })

    function _drawButtons() {
    	$('#buttons').empty();
	    // CLEAR OUT BUTTON DIV (INIT)
	    oContent.find('button').each(function(i) {
	        // APPEND BUTTONS
	        var _type = $(this).attr('type')
	        // EITHER PUT BUTTONS ON STAGE OR IN BUTTON DIV
	        if (_type == "next" || _type == "previous" || _type == "gray" || (_type.indexOf('flat') >= 0)) {
	            $('#buttons').append( new TheranOS.UI.Button($(this)).draw() )
			} else {
	            $('.positioner:first',elem).append( new TheranOS.UI.Button($(this)).draw()	)
			}
		})
    }
	function _seedData() {
		
	}
    function _arrangePage() {
        $.log('Arranging...')
        var horizontalMode;
        var verticalMode;
        var classes = $('#' + TheranOS.currentPage).attr('class').split(' ');
        if (classes.length > 0) {
            $.log('ARRANGING: Found some classes..."' + classes + '" but current page is ' + TheranOS.currentPage)
            for (i in classes) {
                if (classes[i].indexOf('horizontal') >= 0) { horizontalMode = classes[i].split('-')[1]; }
                if (classes[i].indexOf('vertical') >= 0) { verticalMode = classes[i].split('-')[1]; }
            }
        }
        switch (horizontalMode) {
        case "right":
			var _paraWidth = $('.positioner','#' + TheranOS.currentPage).width();
			$.log('Page is aligned right and width is '+_paraWidth+'. Therefore padding-left will be set to '+(610-_paraWidth))
			$('.positioner','#' + TheranOS.currentPage).css({left: (610-_paraWidth)});
        case "left":
        case "center":
            $('.positioner','#' + TheranOS.currentPage).css('text-align', horizontalMode);
            $.log('Arranging Horizontal layout: ' + horizontalMode);
        default:
            break;
        }
        switch (verticalMode) {
        case "middle":
            $.log('Arranging Vertical layout: ' + verticalMode);
            // get height of all contents
			var contentHeight = $('.positioner','#' + TheranOS.currentPage).innerHeight();
            var contentOffset = $('.positioner','#' + TheranOS.currentPage).offset();
            var pageHeight = 480
            $.log("pageHeight = " + pageHeight + "\n" + "contentHeight = " + contentHeight + "\n" + "contentOffset.top = " + contentOffset.top + "\n" + "$('div.page').innerHeight() - contentHeight - contentOffset.top = " + ($('div.page').innerHeight() - (contentHeight + contentOffset.top)))
            $('.positioner','#' + TheranOS.currentPage).css('top', (pageHeight - (contentHeight + contentOffset.top)) / 2)
            break;
        case "bottom":
            $.log('Arranging Horizontal layout: ' + verticalMode)
                break;
        case "top":
            $.log('Arranging Horizontal layout: ' + verticalMode)
        default:
            break;
        }
		if($('body > div.page:last').hasClass('increasing')){
			var previousElementWidthHalf = $('label:first','body > div.page:last').width()/2
			$.log('page: survey: increasing: previousElementWidth = '+$('label:first','body > div.page:last').width())
			$.log('page: survey: increasing: previousElementWidthHalf = '+previousElementWidthHalf)
			var lastElementWidthHalf = $('label:last','body > div.page:last').width()/2
			$.log('page: survey: increasing: lastElementWidthHalf = '+$('label:last','body > div.page:last').width())
			$.log('page: survey: increasing: previousElementWidthHalf = '+lastElementWidthHalf)
			var idealSpacing = (580 - (previousElementWidthHalf + lastElementWidthHalf)) / ($('label','body > div.page:last').size() - 1);
			$.log('page: survey: increasing: idealSpacing = '+idealSpacing)
			$('label','body > div.page:last').each(function(i){
				if(i>0) {
					var cssMarginLeft = 0;
					var thisElementWidthHalf = $(this).width()/2
					$.log('page: survey: increasing: thisElementWidthHalf ('+i+') = '+thisElementWidthHalf)
					cssMarginLeft = Math.floor((idealSpacing - thisElementWidthHalf) - previousElementWidthHalf);
					$.log('page: survey: increasing: cssMarginLeft ('+i+') = '+cssMarginLeft)
					$(this).css('margin-left',cssMarginLeft);
					previousElementWidthHalf = thisElementWidthHalf;
				}
			});
		}
    }
    var _easingType = "linear"//"easeOutQuint";
    var _easingTime = 500//1500;
    switch (sMode) {
    case "next":
        $('div.page:last')
		.animate(
			{left: '-640px'}, 
			_easingTime, 
			_easingType, 
			function() {
            			$(this).remove()
            		})
		.after(elem.addClass(sType)
        	// draw buttons
        		.css("left", "640px")
			.animate(
				{left: '0px'}, 
				_easingTime, 
				_easingType));
        _drawButtons();
        _arrangePage();
        break;
    case "previous":
        $('div.page:first').animate({
            left:
            '640px'
        }, _easingTime, _easingType, function() {
            $(this).remove()
            }).before(elem.addClass(sType).css("left", "-640px").animate({
            left: '0px'
        }, _easingTime, _easingType));
        _drawButtons();
        _arrangePage();
        break;
    case "whiteout":
    case "blackout":
        $('div.page:last').before($('<div class="' + sMode + '">').animate({
            opacity: 1.0
        }, 500, 'easeOutQuint', function() {
            $('div.page').remove();
            $(this).before(elem.addClass(sType));
            _drawButtons();
            _arrangePage()
                $(this).animate({
                opacity: 0.0
            }, 500, function() {
                $(this).remove()
                })
            }));
        break;
	case "default":
    default:
        $('div.page').remove();
        $('body').prepend(elem.addClass(sType));
        _drawButtons();
        _arrangePage();
		_seedData();
        break;
    }
}









TheranOS.Init = function() {
	TheranOS.UI.IntroRefresh = (DEBUG == true) ? 1000 : 7000  												// UI: Set intro refresh time to 1000 so we don't have to wait
	$.getScript("language/en_US/LocalizedStrings.js", function(){ TheranOS.Strings = localizedStrings; });	// Localization: Load Strings
	TheranOS.UI.drawPage('screen:first', "default", function(){												// UI: Load intro screen...
        setTimeout(function() {																				// ...and refresh to start screen
			TheranOS.UI.drawPage('screen:eq(1)', "whiteout")
        }, TheranOS.UI.IntroRefresh);
	})
}





var keys = {
	rowOne: ['1','2','3','4','5','6','7','8','9','0','Delete'],
	rowTwo: ['q','w','e','r','t','y','u','i','o','p'],
	rowThree: ['a','s','d','f','g','h','j','k','l'],
	rowFour: ['Shift','z','x','c','v','b','n','m'],
	rowFive: ['Space']
};

keys.rowOne.div = ".tui-row-1";
keys.rowTwo.div = ".tui-row-2";
keys.rowThree.div = ".tui-row-3";
keys.rowFour.div = ".tui-row-4";
keys.rowFive.div = ".tui-row-5";
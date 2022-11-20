// to do
// create event queue

// GLOBALS
var currentPage = null;

// INIT
$().ready(function(){
	
	// TURN ON FIREBUG DEBUGGING
	DEBUG = true;																				
	
	// USER DATA
	var userData = [];																			
	
	// INITIALIZE START SCREEN WITH THERANOS INTRO
	$.get("data.xml", function(data){															
		pageDraw(data,'screen:first');
	
		// REFRESH TO START SCREEN
		setTimeout(	function(){	$.get("data.xml", function(data){ pageDraw(data,'screen:eq(1)',"whiteout");	}) }, 1000 )
	});
});

// PAGE DRAW FUNCTION
function pageDraw(oData,sDestination,sMode) {
	
	var sType = $(sDestination,oData).attr('type');
	var oContent = $('content:first',$(sDestination,oData));
	var sName = $(sDestination,oData).attr('name');
	var sBackgroundImage = $(sDestination,oData).attr('background')
	
	// SET REFERENCE TO CURRENT PAGE FOR NAV
	currentPage = sName;																		
	$.log("Drawing "+currentPage+". Type is "+sType)

	// CREATE PAGE ELEMENT WITH CLASS AND ID
	var elem = $('<div class="page" id="'+currentPage+'">');
	
	// ATTACH BACKGROUND IF IT'S PRESENT
	$.log('Do we have a background image? '+sBackgroundImage)
	
	if (sBackgroundImage) {
		$(elem).css('background',"#fff url('images/"+currentPage+".png')")
	}

	
	// CHECK PAGE ALIGNMENT OF INCOMING PAGE
	if (oContent.attr('align')) {elem.addClass('horizontal-'+oContent.attr('align')); $.log('pageDraw: adding class: '+'horizontal-'+oContent.attr('align'))}
	if (oContent.attr('valign')) {elem.addClass('vertical-'+oContent.attr('valign')); $.log('pageDraw: adding class: '+'vertical-'+oContent.attr('valign'))}
	
	// APPEND P BLOCKS
	$('p',oContent).each(function(i){ $($($('<p>').append($(this))).html()).appendTo(elem);	})	// CONVERT <p><em> in XML to HTML
	if (oContent.attr('width')) {
		$.log('Content has specified width: '+oContent.attr('width'))
		$('p',elem).css('width',oContent.attr('width')+'px')
	}
	$('survey',oContent).each(function(i){														// BUILD SURVEYS
		switch($(this).attr('type')) {
			case "feel":
				elem.append(smiley())
				break;
			case "one":
				$('option',this).each(function(i){
					$('<label>')
						.append($('<div class="radio">').click(function(){
							$('.radio').removeClass('checked');
							$('.disabled').fadeTo(500,1.0).removeClass('disabled');				// ACTIVATE 'NEXT' BUTTON
							$(this).addClass('checked')
						}))
						.append($(this).text())
						.appendTo(elem)
				})
				break;
			case "many":
				$('option',this).each(function(i){
					$('<label>')
						.append($('<div class="checkbox">').click(function(){
							$('.disabled').fadeTo(500,1.0).toggleClass('disabled');				// ACTIVATE 'NEXT' BUTTON
							$(this).toggleClass('checked')
							if (($('.checkbox.checked').size() < 1) && (!$('.button.next').hasClass('disabled'))) {
								$('.button.next').fadeTo(500,0.1).toggleClass('disabled');		// DEACTIVATE 'NEXT' BUTTON
							}
						}))
						.append($(this).text())
						.appendTo(elem)
				})
				break;
			default:
		}
		// break it up into columns if desired
		if ($(this).attr('columns')) {
			$(elem).addClass('columns-'+$(this).attr('columns'))
			var iNumColumns = $(this).attr('columns');
			var iNumItems = $('option',this).size();
			var iDivisor = iNumItems/iNumColumns;
			var iLeftover = iNumItems%iNumColumns;
			var elemTemp = elem;
			for (var i = 0; i<iNumColumns; i++) { 
				var _from = (i*Math.floor(iDivisor));
				var _to = ((i+1)*Math.ceil(iDivisor));
				$.log("iDivisor = "+iDivisor)
				$.log("SURVEY: Put items from "+_from+" to "+_to+" into column "+(i+1))
				$('label',elem).slice(_from,_to).wrapAll('<div class="column">')
			}
			var elemTemp = null;
		}
	})
	
	function _drawButtons() {
		$('#buttons').empty();																	// CLEAR OUT BUTTON DIV (INIT)
		oContent.find('button').each(function(i){ 												// APPEND BUTTONS
			var _type = $(this).attr('type')													// EITHER PUT BUTTONS ON STAGE OR IN BUTTON DIV
			if (_type == "next" ||
				_type == "previous" ||
				_type == "gray" ||
				(_type.indexOf('flat') >= 0)) {
				$('#buttons').append(new Button($(this)).draw())
			} else { elem.append(new Button($(this)).draw()) }
		})
	}	
	function _arrangePage() {
		$.log('Arranging...')
		var horizontalMode;
		var verticalMode;
		var classes = $('#'+currentPage).attr('class').split(' '); 
		if (classes.length > 0) {	
			$.log('ARRANGING: Found some classes..."'+classes+'" but current page is '+currentPage)
			for (i in classes) {
				if (classes[i].indexOf('horizontal')>=0) {horizontalMode = classes[i].split('-')[1];}
				if (classes[i].indexOf('vertical')>=0) {verticalMode = classes[i].split('-')[1];}
			}			
		}
		switch (horizontalMode) {
			case "left":
			case "center":
			case "right":
				$('body > div.page:last').css('text-align',horizontalMode)
				$.log('Arranging Horizontal layout: '+horizontalMode)
			default:
				break;
		}
		switch (verticalMode) {
			case "middle":
				$.log('Arranging Horizontal layout: '+verticalMode)
				// get height of all contents
				var lastElemHeight = $('#'+currentPage+' *:last').innerHeight(); 
				var lastElemOffset = $('#'+currentPage+' *:last').offset(); 
				var pageHeight = 480 // $('div.page').innerHeight() is flawed
				$.log("pageHeight = " + pageHeight + "\n" + "lastElemHeight = " + lastElemHeight + "\n" + "lastElemOffset.top = " + lastElemOffset.top + "\n" + "$('div.page').innerHeight() - lastElemHeight - lastElemOffset.top = " + ($('div.page').innerHeight() - (lastElemHeight + lastElemOffset.top)))
				$('div.page').css('padding-top',(pageHeight - (lastElemHeight + lastElemOffset.top))/2)
				break;
			case "bottom":
				$.log('Arranging Horizontal layout: '+verticalMode)
				break;
			case "top":
				$.log('Arranging Horizontal layout: '+verticalMode)
			default:
				break;
		}		
	}
	var _easingType = "easeOutQuint";
	var _easingTime = 1500;
	switch(sMode) {
		case "next":		
			$('div.page:last')
				.animate(
					{left: '-640px'}, 
					_easingTime,
					_easingType,
					function(){$(this).remove()})
				.after(
					elem
					.addClass(sType)
					// draw buttons
					.css("left","640px")
					.animate({left: '0px'}, _easingTime, _easingType)
				);	
				_drawButtons();
				_arrangePage();
			break;
		case "previous":		
			$('div.page:first')
				.animate(
					{left: '640px'}, 
					_easingTime,
					_easingType,
					function(){$(this).remove()})
				.before(
					elem
					.addClass(sType)
					.css("left","-640px")
					.animate({left: '0px'}, _easingTime, _easingType)
				);	
				_drawButtons();
				_arrangePage();
			break;
		case "whiteout":
		case "blackout":
			$('div.page:last').before(
				$('<div class="'+sMode+'">')
				.animate(
					{opacity: 1.0}, 
					500,
					'easeOutQuint',
					function() {
						$('div.page').remove();
						$(this).before(elem.addClass(sType));
						_drawButtons();
						_arrangePage()
						$(this).animate({opacity:0.0},500, function() {$(this).remove()})
					})
				);
			break;
		default:
			$('div.page').remove();
			$('body').prepend(elem.addClass(sType));
			_drawButtons();
			_arrangePage()
			break;
	}
}

var selectedSmiley = null;

function smiley() {
	var count = 10;
	var smileys = $('<div class="smileys">');
	for (i=count;i>0;i--) {
		var elem = $('<a class="smiley"><span>&nbsp;</span></a>');
		elem.bind('click',function(){
			$('.smiley').removeClass('selected');
			$(this).addClass('selected');
			selectedSmiley = $(this);
			$('.disabled').fadeTo(500,1.0).removeClass('disabled');
		});
		elem.find('span').css('backgroundPosition',"-"+(i-1)*54+"px 0px");
		elem.css('left',16+(i-1)*54+"px")
		smileys.append(elem);
	}
	// set up labels
	var labels = new Array();
	labels["very bad"] = "rgb(114,121,197)";
	labels["average"] = "rgb(128,128,128)";
	labels["very good"] = "rgb(162,157,40)";
	for (var label in labels) {
		smileys.append($('<label>').text(label).css('color',labels[label]));
	}
	$(smileys).find('label:eq(1)').css({'text-align':'center','width':'200px','left':'190px'})
	$(smileys).find('label:eq(2)').css('right',0);
	return smileys;
}

function Button(oButtonObject) {
	this.draw = function() {
		var buttonType = $(oButtonObject).attr('type') 									// BUTTON TYPE
		var buttonText = $(oButtonObject).attr('text')										// BUTTON LABEL
		var disabled = ($(oButtonObject).attr('disabled') == "true") ? "disabled" : "";	// DISABLE IF FLAGGED IN XML
		var _id = $(oButtonObject).attr('id') 												// BUTTON ID (may not be necessary)
		return $("<a href='#' class='button'>")
				.append($("<span>").append(buttonText))
				.click(function(){
					if (!$(this).hasClass('disabled')) {
						var reference = null;																// reference to object in DOM
						var elem = $('<a href="#" class="button"><span></span></a>');
						var destination = $(oButtonObject).attr('destination')								// WHERE BUTTON LEADS
						var transition = $(oButtonObject).attr('transition')		
						switch (buttonType) {
							case "next":
								buttonText = (buttonText) ? buttonText : "Next";
								_id = (_id) ? _id : 'button-next';
								break;
							case "previous":
								this.buttonText = (this.buttonText) ? this.buttonText : "Go Back";
								_id = (_id) ? _id : 'button-previous';
								break;
							case "flat":
								buttonText = (buttonText) ? buttonText : "Default";
								break;
							case "flat power":
								buttonText = (buttonText) ? buttonText : "Power Off";
								_id = (_id) ? _id : 'button-power';
								break;
							default:
								break;
						}					
						$.get("data.xml", function(data){
							switch (destination) {
								case "start":
									pageDraw(data,'screen:first',transition);
									break;
								case "configuration":
								case "enrollment":
									var answer = passwordCheck(destination);
									if(answer) {
										pageDraw(data,'screen[name="'+destination+'"]',transition);
									}
									break
								default:	
									pageDraw(data,'screen[name="'+destination+'"]',transition);
									break;
							}
						})						
					}
					return false;
				})
				.addClass(buttonType)
				.addClass(disabled)
				.attr({'id':_id})
	}
	var passwordCheck = function(passwordType) {
		var passcode = 303;
		var verified = (parseInt(prompt(passwordType)) == passcode) ? true : false;
		return verified // DID USER ENTER PROPER PASSWORD?
	}
}
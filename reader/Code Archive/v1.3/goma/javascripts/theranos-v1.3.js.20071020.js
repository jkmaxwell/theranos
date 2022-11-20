$().ready(function(){
	/*
	** GLOBALS
	*/
	// initialize all buttons with class previous to last page visited
	
	/*
	** SWITCHER
	*/
	var pageID = $('body').attr('id');
	switch(pageID) {
		case "intro":
			$("p:first").fadeIn(1000, function(){
				$("p").next().fadeIn(1000, function(){
					$("p:first").animate({opacity: 1}, 10000, function() {
						$("p:first").fadeOut(1000, function(){
							$("p").next().fadeOut(1000, function(){
								document.location.href="start.html";
							});
						});
					});
				});
			});
			break;
		case "start":
			// SET UP BUTTONS
			var startButton = new Button("start","Start the test","button-start",$('#textcontainer'));
			var enrollmentButton = new Button("flat","Enrollment","button-enrollment",$('#buttons'));
			var configurationButton = new Button("flat","Configuration","button-configuration",$('#buttons'));
			var powerButton = new Button("flat power","Power off","button-power",$('#buttons'));
			startButton.draw();
			enrollmentButton.draw();
			configurationButton.draw();
			powerButton.draw();
			break;
		case "survey1":
			smiley();
			// SET UP BUTTONS
			var nextButton = new Button("next","Next","button-next",$('#buttons'));
			var previousButton = new Button("previous","Go Back","button-previous",$('#buttons'));
			nextButton.draw();
			previousButton.draw();
			// DISABLE NEXT UNTIL SURVEY IS CLICKED
			nextButton.disable();
			break;
		default:
	}
});

var selectedSmiley = null;

function smiley() {
	var count = 10;
	for (i=count;i>0;i--) {
		var elem = $('<a class="smiley"><span>&nbsp;</span></a>');
		elem.bind('click',function(){
			$('.smiley').removeClass('selected');
			$(this).addClass('selected');
			selectedSmiley = $(this);
			$('#button-next').fadeTo(500,1.0);
			$('#button-next').removeClass('disabled');
			$('#button-next').click(function(){ // animate content off-screen
				$('.page').animate(
					{left: '-640px'}, 'slow'
				);
			});
		});
		elem.find('span').css('backgroundPosition',"-"+(i-1)*54+"px 0px");
		elem.css('left',19+(i-1)*54+"px")
		elem.appendTo('#textcontainer');
	}
}

function page(){
	this.next = function(){
		
	};
	this.previous = function(){
		
	};
}

function Button(sType,sText,sId,oParent,bEnabled) {
	this.buttonType = sType;
	this.buttonText = (sText) ? sText : ""; // if no text is provided, set to blank so switch sets them
	this.reference = null;	// reference to object in DOM
	this.parentRef = (oParent) ? oParent : $('body');
	this.enabled = (bEnabled) ? bEnabled : true;
	this.elem = $('<a href="#" class="button"><span></span></a>');
	this.id = (sId) ? sId : ""; // if no id is provided, set to blank so switch sets them
	this.action = function() {}
	switch (sType) {
		case "next":
			this.buttonText = (this.buttonText) ? this.buttonText : "Next";
			this.id = (this.id) ? this.id : 'button-next';
			break;
		case "previous":
			this.buttonText = (this.buttonText) ? this.buttonText : "Go Back";
			this.id = (this.id) ? this.id : 'button-previous';
			this.action = function() {history.back(1);}
			break;
		case "flat":
			this.buttonText = (this.buttonText) ? this.buttonText : "Default";
			break;
		case "flat power":
			this.buttonText = (this.buttonText) ? this.buttonText : "Power Off";
			this.id = (this.id) ? this.id : 'button-power';
			break;
		default:
			break;
	}
	this.draw = function() {
		$(this.parentRef)
			.append(
				$("<a href='#' class='button'>")
				.append($("<span>").append(this.buttonText))
				.click(function(){return false;})
				.addClass(this.buttonType)
				.attr({'id':this.id})
			);
		this.reference = $('#'+this.id);
		this.elem.click(this.action);
	}
	this.remove = function() {
		this.reference.remove();
	}
	this.enable = function() {
		this.reference.fadeTo(500,1.0);
		this.reference.removeClass('disabled');
	}
	this.disable = function() {
		this.reference.fadeTo(500,0.1);
		this.reference.addClass('disabled');
	}
}
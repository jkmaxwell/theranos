/*
- at some point move button IDs and text from user-defined XML to auto-generated in button code. 
- put five minute timeout on door close at end of thing with the door hanging open
- return reader to the screen
- put clock screens in for duration
- put mike's new words in there for how much questions 
*/

/*
Error Codes
001	Drawer Immobilized: Drawer had an error when trying to open, then had another error when trying to home. 

*/

TheranOS.UI = { }; 								// Set up TheranOS UI Library
TheranOS.UI.width = 640;
TheranOS.UI.height = 480;
TheranOS.UI.Survey = { }; 						// Set up Survey UI Element Library
TheranOS.AssayString = "";						// ######### TEMPORARY ###############

TheranOS.UI.ProgressBar = function(mode) {
	this.progressAmount = 0;
	this.progressMode = mode;
	
	// Create the HTML.
	this.element = $('<div class="statusBarWrapper"/>');
	this.element.append('<div class="statusBar"><div/></div>');
	
	switch(mode) {
		case "time":
			this.element.append('<p><span/> '+TheranOS.Util.getLocalizedString('progress_bar.time_remaining')+'.</p>');
			break;
		default:
			break;
	}
}

TheranOS.UI.ProgressBar.prototype = {
	draw: function() {
		return this.element;
	},
	update: function(updateAmount) {
		this.progressAmount = updateAmount
		$('div',this.element).width(this.progressAmount+'%');
		if (this.progressMode == "time") $('p > span',this.element).text(this.progressAmount)
	}
}

TheranOS.UI.PageManager = (function(){
	
	var currentPage = null;
    var oldPage = null;

	var _easingType = "linear" //"easeOutQuint";
    var _easingTime = 500 //1500;
 
	return {
		drawPage: function(targetPage, targetPageTransition, chainedMethod) {
			$.log('TheranOS.UI.PageManager.drawPage('+targetPage+', '+targetPageTransition+', '+chainedMethod+')');
			var newPage = null;
			$.get(TheranOS.XML,function(data){
				newPage = new TheranOS.UI.Page(
					$(targetPage, data).attr('name'), 			// pageName
					$(targetPage, data).attr('type'), 			// pageType
					$(targetPage, data).attr('action'), 		// pageAction
					$(targetPage, data).attr('background'), 	// pageBackgroundImage
					$('content:first', $(targetPage, data))		// pageContent
				)
				if (chainedMethod) {chainedMethod()};
				switch (targetPageTransition) {
					case "next":
						$.log('TheranOS.UI.PageManager.drawPage: Transition: '+targetPageTransition);
						oldPage = currentPage;
			        	$('div.page:last').after(newPage.display("next"))
						newPage.arrange();
						$('div.page')
							.animate(
								{left: '-=640px'}, 
								_easingTime, 
								_easingType, 
								function() {
									currentPage = $('div.page')
									TheranOS.UI.PageManager.removePage(oldPage)
								}
							)
			        	break;
			    	case "previous":
						$.log('TheranOS.UI.PageManager.drawPage: Transition: '+targetPageTransition);
						oldPage = currentPage;
			        	$('div.page:first').before(newPage.display("previous"))
						newPage.arrange();
						$('div.page')
							.animate(
								{left: '+=640px'}, 
								_easingTime, 
								_easingType, 
								function() {
									currentPage = $('div.page')
									TheranOS.UI.PageManager.removePage(oldPage)
								}
							)
			        	break;
			    	case "whiteout":
			    	case "blackout":
						$.log('TheranOS.UI.PageManager.drawPage: Transition: '+targetPageTransition);
						oldPage = currentPage;
			        	$('div.page:last')
							.before(
								$('<div class="' + targetPageTransition + '">')
									.animate({opacity: 1.0}, 500, 'easeOutQuint', function() {
										TheranOS.UI.PageManager.removePage(oldPage)
				            			$(this).before(newPage.display());
										newPage.arrange();
										currentPage = $('div.page');
										$.log('currentPage = '+currentPage.html())
				                		$(this).animate({ opacity: 0.0 }, 500, function() {
				                			$(this).remove()
				                		})
				            		})
							);
			        	break;
					case "default":
			    	default:
						$.log('TheranOS.UI.PageManager.drawPage: Transition: '+targetPageTransition);
						// Clear out the body
						oldPage = currentPage;
						$('body').contents().remove();
						// Attach the new page
			        	$('body').prepend(newPage.display());
						newPage.arrange();
						currentPage = $('div.page')
						$.log('currentPage = '+currentPage.html())
			        	break;
			    }				
			})			
		
		},
		removePage: function(targetPage) {
			$.log('TheranOS.UI.PageManager.removePage('+targetPage+')');
			targetPage.remove();
		},
		drawKeyboard: function(targetInput) {
			$.log('TheranOS.UI.PageManager.drawKeyboard(). targetInput = '+targetInput);
		
			// Show the keyboard.
			var keyboard = new TheranOS.UI.Keyboard(targetInput)
			$('body').append(keyboard.draw())
			keyboard.show();
			

		},
		removeKeyboard: function() {
			$.log('TheranOS.UI.PageManager.removeKeyboard()');
			// hide any visible keyboards:
			$(".tui-container").fadeOut('fast', function() {
				$(".tui-container").remove();
			});		
		}
	}
})();



TheranOS.UI.Page = function(pageName, pageType, pageAction, pageBackgroundImage, pageContent) {
	
	$.log('TheranOS.UI.Page('+pageName+', '+pageType+', '+pageAction+', '+pageBackgroundImage+', '+pageContent+')');
	
	var that = this;												// Our friend the great scope fixer
	
	this.sName = pageName;											// Page Name
	this.sType = pageType; 											// Type: Survey, Instruction, Status
	this.sReaderAction = pageAction;								// Reader Action (AJAX Query)
	this.sBackgroundImage = pageBackgroundImage || null;			// Background Image
    this.oContent = pageContent;									// Page Content Object

	this.iContentWidth = this.oContent.attr('width') || 580;		// Text Width
	this.sContentAlign = this.oContent.attr('align');				// Text Align (Horizontal)
	this.sContentVAlign = this.oContent.attr('valign');				// Text Align (Vertical)
	
	// Create the HTML
	this.element = null;

		// Create the Page DIV and nested Positioner DIV
		this.element = $('<div class="page"><div class="positioner"></div><div id="buttons"></div></div>');
		
		// Add any relevant pagetype class.
		this.element.addClass(this.sType);
		
		// Attach background image if present
		if (this.sBackgroundImage) { $(this.element).css('background', "#fff url('images/" + this.sName + ".png')"); }
		
		// Add alignment classes for positioning
	    if (this.sContentAlign) { this.element.addClass('horizontal-' + this.sContentAlign); }
	    if (this.sContentVAlign) { this.element.addClass('vertical-' + this.sContentVAlign); }

		// Set width of the positioner DIV if specified
	    if (this.iContentWidth < 580) {
	        $.log('TheranOS.UI.Page: Content has specified width: ' +  this.iContentWidth)
	        $('.positioner:first', this.element).css('width', this.iContentWidth + 'px')
		}	
		
	    // Append text blocks
	    $('text', this.oContent).each(function(i) {
			$.log("TheranOS.UI.Page: Writing text block with: "+$(this).text())
			$('.positioner:first',that.element).append(
				$('<p>')
					.append( TheranOS.Util.getLocalizedString( $(this).text() ) )
					.addClass( $(this).attr('class') )
			)
		});		
		
		// Append input fields
		$('textinput', this.oContent).each(function(){			
			var textInputName = $(this).attr('name');	
			var textInputValue = TheranOS.Data.User.read(textInputName)	|| "";
			$.log('TheranOS.UI.Page: textinput found with name='+textInputName+' and value='+textInputValue);
			$('.positioner:first',that.element).append(
				$('<input class="tui-entry-field">')
					.attr('name',textInputName)
					.val(textInputValue)
					.bind('focus', function(e) {
						if(!($('.tui-container').size() > 0)) {
							TheranOS.UI.PageManager.drawKeyboard('.tui-entry-field[name="'+textInputName+'"]');
						}
					})
			)
			TheranOS.UI.PageManager.drawKeyboard('.tui-entry-field[name="'+textInputName+'"]');
		});
		
		// Wrap page in a status block
		if (this.sType == "status") {
			$.log('TheranOS.UI.Page: sType: status');
			
			// Build StatusBox frame.
			$('p',this.element).wrapAll($('<div class="statusBox" />')).wrapAll('<div class="statusBox-middle" />');
			$('div.statusBox',this.element).prepend($('<div class="statusBox-top">')).append($('<div class="statusBox-bottom">'));
			if(this.sName == "warming" || this.sName == "power") $('div.statusBox',this.element).addClass('opaque')
			
			// Build Statusbar if present
			if ($('statusbar',this.oContent).size()) {
				$.log('TheranOS.UI.Page: sType: '+"Found "+$('statusbar',this.oContent).size()+" statusbar(s): "+this.oContent.toString()+' of type = '+$('statusbar',this.oContent).attr('type'));
				var progressBar = new TheranOS.UI.ProgressBar($('statusbar',this.oContent).attr('type'));
				$('div.statusBox-middle',this.element).append(progressBar.draw());
			}
		}

		// Wrap page in an error block
		if (this.sType == "error") {
			$.log('TheranOS.UI.Page: sType: error');
			
			// Build StatusBox frame.
			$('p',this.element).wrapAll($('<div class="errorBox" />')).wrapAll('<div class="errorBox-middle" />');
			$('div.errorBox',this.element).prepend($('<div class="errorBox-top">')).append($('<div class="errorBox-bottom">'));
			$('div.errorBox-middle',this.element).append('<div class="errorBox-buttons">')
		}
					
		// Add Buttons.
	    $('button',this.oContent).each(function(i) {
		
	        var _buttonType = $(this).attr('type');
			var _buttonText = TheranOS.Util.getLocalizedString($(this).attr('text'));
	        var _buttonDisabledStatus = ($(this).attr('disabled') == "true") ? "disabled": "";
			var _buttonID = $(this).attr('id');
			var _buttonDestination = $(this).attr('destination');
			var _buttonPageTransitionType = $(this).attr('transition');

			$.log('TheranOS.UI.Page: button: drawing a button:\n_buttonType: '+_buttonType+
				'\n_buttonText: '+_buttonText+
				'\n_buttonDisabledStatus: '+_buttonDisabledStatus+
				'\n_buttonID: '+_buttonID+
				'\n_buttonDestination: '+_buttonDestination+
				'\n_buttonPageTransitionType: '+_buttonPageTransitionType
			);
			
			var _button = new TheranOS.UI.Button( _buttonType, _buttonText, _buttonDisabledStatus, _buttonID, _buttonDestination, _buttonPageTransitionType );
			
			var _buttonTargetLocation;
			if ( _buttonType == "next" || _buttonType == "previous" || _buttonType == "gray" || (_buttonType.indexOf('flat') >= 0) ) {
				_buttonTargetLocation = '#buttons';
			} else if (_buttonType == "error") {
				_buttonTargetLocation = '.errorBox-buttons';
			} else {
				_buttonTargetLocation =  '.positioner:first';
			}
										
			if (_buttonType == "big") {
				$(_buttonTargetLocation,that.element).prepend( _button.draw() );
			} else {	
				$(_buttonTargetLocation,that.element).append( _button.draw() );
			};
		})
				
		// Build surveys.
	    $('survey', this.oContent).each(function(i) {
			
			var _surveyType = $(this).attr('type');
			var _surveyName = $(this).attr('name');
			
			$.log('TheranOS.UI.Page: survey found. Name is '+_surveyName+' and Type is '+_surveyType);
			
			$(that.element).addClass('survey');
			
			if(TheranOS.Data.User.read(_surveyName)) {
				$.log('TheranOS.UI.Page: survey has stored data: '+TheranOS.Data.User.read(_surveyName));
            	$('.disabled',that.element).removeClass('disabled').debug();
			}
			
			switch (_surveyType) {
				case "feel":
					var feelSurvey = new TheranOS.UI.Survey.Smiley();
		            $('.positioner:first',that.element).append(feelSurvey.draw())
		            break;
				case "one":
		            $('option', this).each(function(i) {
						var optionName = $(this).text()
		                $('<label>')
							.click(function() {
								TheranOS.Data.User.clear(_surveyName)
								TheranOS.Data.User.write(_surveyName,optionName)
		                    	$('.radio',that.element).removeClass('checked');
		                    	$('.disabled',that.element).fadeTo(500, 1.0).removeClass('disabled');
		                    	// ACTIVATE 'NEXT' BUTTON
		                    	$('.radio',this).addClass('checked')
		                    })
							.append($('<div class="radio">'))
							.append(TheranOS.Util.getLocalizedString($(this).text()))
							.appendTo($('.positioner:first',that.element))
						if(TheranOS.Data.User.read(_surveyName)) {
							$.log('Found some data in them hills')
							$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read(_surveyName))
							if (optionName == TheranOS.Data.User.read(_surveyName)) {
								$.log('Clicked')
								$('label:last',that.element).trigger('click')
							}
						}
	                })
	                break;
		        case "one-or-none":
		            $('option', this).each(function(i) {
						var optionName = $(this).text()
		                $('<label>')
							.click(function() {
								TheranOS.Data.User.clear(_surveyName)
								TheranOS.Data.User.write(_surveyName,optionName)
		                    	$('.radio',that.element).removeClass('checked');
		                    	$('.disabled',that.element).fadeTo(500, 1.0).removeClass('disabled');
			                    // ACTIVATE 'NEXT' BUTTON
			                    $('.radio',this).addClass('checked')
			                })
							.append($('<div class="radio">'))
							.append(TheranOS.Util.getLocalizedString($(this).text()))
							.appendTo($('.positioner:first',that.element))	
						if(TheranOS.Data.User.read(_surveyName)) {
							$.log('Found some data in them hills')
							$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read(_surveyName))
							if (optionName == TheranOS.Data.User.read(_surveyName)) {
								$.log('Clicked')
								$('label:last',that.element).trigger('click')
							}
						}
		            })
					$('label:not(:last)',that.element).wrapAll('<div class="column" style="border-right: 1px solid rgb(130, 130, 130); padding-right: 40px;">');
					$('label:last',that.element).wrapAll('<div class="column" style="margin-right: 0px">');
		            break;
		        case "many":
		            $('option', this).each(function(i) {
						var optionName = $(this).text()
						var optionElement = $('<label>')
							.append($('<div class="checkbox">'))
							.append(TheranOS.Util.getLocalizedString($(this).text()))
							.click(function() {
								$.log("TheranOS.UI.Page: Survey: Many: Clicked")
								if ($('div.checkbox',this).hasClass('checked')) {
									TheranOS.Data.User.clear(_surveyName,optionName)
								} else {
									TheranOS.Data.User.write(_surveyName,optionName)
								}
		                    	$('.disabled',that.element).fadeTo(500, 1.0).toggleClass('disabled');
		                   		// ACTIVATE 'NEXT' BUTTON
		                    	$('div.checkbox',this).toggleClass('checked')
		                        if (($('.checkbox.checked',that.element).size() < 1) && (!$('.button.next',that.element).hasClass('disabled'))) {
		                        	$('.button.next',that.element).fadeTo(500, 0.1).toggleClass('disabled');
		                        	// DEACTIVATE 'NEXT' BUTTON
		                        }
		                	})
						if(TheranOS.Data.User.read(_surveyName)) {
							$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read(_surveyName))
							if (TheranOS.Data.User.read(_surveyName).indexOf(optionName) > -1) {
								optionElement.trigger('click')
							}
						}	
						$('.positioner:first',that.element).append(optionElement)
					})
					
		            $(that.element).addClass('columns-2')
	    
	            	var iNumColumns = 2;
					var iNumItems = $('label', that.element).size();
		            var iDivisor = iNumItems / iNumColumns;
		            var iLeftover = iNumItems % iNumColumns;
		
		            for (var i = 0; i < iNumColumns; i++) {
		                var _from = (i * Math.floor(iDivisor));
		                var _to = ((i + 1) * Math.ceil(iDivisor));
		                $.log("iDivisor = " + iDivisor)
		                    $.log("SURVEY: Put items from " + _from + " to " + _to + " into column " + (i + 1))
		                    $('label', that.element).slice(_from, _to).wrapAll('<div class="column">')
	                }

		            break;
				case "time":
					that.element.addClass('time')
		        	$('option', this).each(function(i) {
						var optionName = $(this).text()
						var optionElement = $('<label>')
							.append(
								$('<div class="radio">').css('background-image','url(../images/radio_time'+(i+1)+'.png)')
							)
							.append(TheranOS.Util.getLocalizedString($(this).text()))
							.append($('<span class="units">'+$(this).attr('units')+'</span>'))
							.click(function() {
								$.log("TheranOS.UI.Page: Survey: time: Clicked")
								TheranOS.Data.User.clear(_surveyName)
								TheranOS.Data.User.write(_surveyName,optionName)
		                    	$('.radio',that.element).removeClass('checked');
			                	$('.disabled',that.element).fadeTo(500, 1.0).toggleClass('disabled');
			                	// ACTIVATE 'NEXT' BUTTON
		                    	$('.radio',this).addClass('checked')
		            		})
						
						if(TheranOS.Data.User.read(_surveyName)) {
							$.log('Current optionName = '+optionName+' and saved value = '+TheranOS.Data.User.read(_surveyName))
							if (optionName == TheranOS.Data.User.read(_surveyName)) {
								$.log('Clicked')
								optionElement.trigger('click')
							}
						}
						
						$('.positioner:first',that.element).append(optionElement);
						
		            })
		            break;
				default:
					break;
			}
		})
		
	

	// Attach Events
	// If it's a power screen, hide the UI
	if (this.sName == "power" || this.sName == "test_done" || (this.sName.indexOf('error')) > -1){
		$.log('TheranOS.UI.Page: sName: '+this.sName+'. Shutting down.');
		
		// Attach click event to return user to start screen.
		$(this.element).click(function(){ TheranOS.Util.startUp() });
	}
	
	// Process actions.
	if(this.sReaderAction) {
		$.log('TheranOS.UI.Page: sReaderAction: '+this.sReaderAction);
		TheranOS.Util.DeviceManager.doCommand(this.sReaderAction);
		switch(this.sReaderAction) {
			case "get_config":
				var data = "config={'allow_proto_abort': 'True', 'cart_id_prompt': 'False', 'clinician_id_input': 'vkeyboard', 'cab_com': 'True', 'cart_id_ndigits': '3', 'hb_retry_interval': '3600', 'ca_cert_dir': '/home/labuser/build2/yacto/branches/goma/th-rdr-core/Utils/ca_cert/', 'intro': 'Menu', 'patient_enroll': 'True', 'display_proto_err': 'False', 'clinician_data_file': 'clinician.txt', 'species_prompt': 'False', 'patient_id_prompt': 'True', 'patient_id_type': 'patient', 'netmon_en': 'True', 'smtp_server': 'mail.theranos.com', 'sync_login_server': 'root@10.100.3.83', 'sync_repo_dir': '/home/labuser/zepto/trunk/linux', 'net_list': 'None', 'netmon_mode_pots': 'demand', 'conduct_survey': 'False', 'patient_id_input': 'vkeyboard', 'email': 'None', 'cart_id_skip': 'False', 'hb_interval': '86400', 'display_proto_log': 'False', 'display_proto_results': 'False', 'reader_ui': 'goma', 'cab_err_display': 'False', 'cab_debug': 'False', 'sample_type_prompt': 'False', 'admin_en': 'False', 'compress_logs': 'True', 'net_wait': '60', 'clinician_id_prompt': 'True', 'reader_ready': '/tmp/reader.ready', 'netmon_def_mode': 'keepon', 'cart_id_input': 'vkeyboard', 'heartbeat_en': 'True', 'wait_temp_ready': 'True', 'proto_debug': 'False', 'user_instructions': 'Patient'}";				
				var jsonObject = eval( '(' + data + ')' );
				TheranOS.Config.Modes = jsonObject.config;
			/*	$.ajax({
					type: "GET",
					url: 'http://localhost:8080/Main/APP/app?stage=get_config',
					beforeSend: function(data) { $.log('TheranOS.UI.Page: Action: AJAX: '+that.sReaderAction+' beforeSend: XMLHttpRequest = '+data); },
					success: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+that.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
						// if
							// ok: set config
							// error:
						var jsonObject = eval( '(' + data + ')' );
						TheranOS.Config.Modes = jsonObject.config;
					},
					error: function(data, textStatus, errorThrown) {
						$.log('TheranOS.UI.Page: Action: AJAX '+that.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
						TheranOS.UI.PageManager.drawPage('screen[name="error_open_tray"]', "blackout");
					},
					complete: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+that.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
					}
				});		*/			
				break;
			case "system_status":
				function recursiveCall() {
					$.ajax({
						type: "GET",
						url: 'http://localhost/Assay/APP/app?stage=system_status',
						beforeSend: function(data) {
							$.log('TheranOS.UI.Page: Action: AJAX: '+that.sReaderAction+' beforeSend: XMLHttpRequest = '+data);
						},
						success: function(data, textStatus) {
							$.log('TheranOS.UI.Page: Action: AJAX: '+that.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
							// if
								// ok: go ahead. if there's a wait screen, thaw it out
								// temp_not_ready: throw up a wait screen if it's not there.  returns a temperature value
								// busy: throw up a wait screen if it's not there
							if ((data.indexOf('temp_not_ready') > -1)) {
								if (that.sName != "warming") {
									TheranOS.UI.PageManager.drawPage('screen[name="warming"]', "blackout");
								} else {
									var _currentTemp = parseInt(data.split('=')[1]);
									var _optimalTemp = 34;
									var _minutesTotal = 90;

							    	if (_currentTemp >= _optimalTemp) { 
									}
									else {
										var _timeEstimate = parseInt(_minutesTotal - (_minutesTotal * (_currentTemp/_optimalTemp)));
										_timeEstimate += (_timeEstimate > 1) ? " minutes" : " minute";

										$('p.sub',that.element).text('Estimated time remaining: '+_timeEstimate+'.')
										setTimeout(function(){recursiveCall()},1000);
							    	}
									
								}
							} else if (data.indexOf('busy') > -1) {
								if (that.sName != "warming") {
									TheranOS.UI.PageManager.drawPage('screen[name="warming"]', "blackout");
								} else {
									$('p.sub',that.element).text('Just a few minutes remaining.')
									setTimeout(function(){recursiveCall()},1000);
								}
							} else if (data.indexOf('ok') > -1) {
								if (that.sName == "warming") {
									TheranOS.UI.PageManager.drawPage('screen[name="start"]', "whiteout");
								}
							}
						},
						error: function(data, textStatus, errorThrown) {
							$.log('TheranOS.UI.Page: Action: AJAX '+that.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
						},
						complete: function(data, textStatus) {
							$.log('TheranOS.UI.Page: Action: AJAX: '+that.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
						}
					});					
				}
				// Start polling in 5 seconds
				setTimeout(function(){recursiveCall()},2000);
				
				break;
			case "begin":
				$.ajax({
					type: "GET",
					url: 'http://localhost/Assay/APP/app?stage=begin',
					beforeSend: function(data) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' beforeSend: XMLHttpRequest = '+data);
					},
					success: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
						if ((data.indexOf('busy') > -1)) {
							if (that.sName != "waiting") {
								TheranOS.UI.PageManager.drawPage('screen[name="waiting"]', "whiteout");
								setTimeout(function(){TheranOS.UI.PageManager.drawPage('screen[name="start"]', "whiteout");},10000);
							}
						} else if (data.indexOf('ok') > -1) {
							if (that.sName == "waiting") {
								TheranOS.UI.PageManager.drawPage('screen[name="start"]', "whiteout");
							}
						}

					},
					error: function(data, textStatus, errorThrown) {
						$.log('TheranOS.UI.Page: Action: AJAX '+this.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
					},
					complete: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
					}
				});
				break;
			case "open_tray":
				$.ajax({
					type: "GET",
					url: 'http://localhost/Assay/APP/app?stage=open_tray',
					beforeSend: function(data) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' beforeSend: XMLHttpRequest = '+data);
					},
					success: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
						// if
							// ok: go ahead. if there's a wait screen, thaw it out
							// error: there's been an error opening the tray and we need to do something
						if ((data.indexOf('error') > -1)) {
							// oh no!  the door won't open.  try to close the tray
								// on success
									// begin error screens		
							TheranOS.UI.PageManager.drawPage('screen[name="error_open_tray"]', "blackout");
									// on fail
									// TheranOS.UI.PageManager.drawPage('screen[name="error_call"]', "blackout");
						} else if ((data.indexOf('ok') > -1)) {
							// needs to start polling http://localhost/Assay/APP/app?method=cmd_is_done&args=tray and listen for a 1 (done) and then enable the button
							function recursiveCall() {
							  	$.get('http://localhost/Assay/APP/app?method=cmd_is_done&args=tray',
									function(data){
								    	if (parseInt(data) == 1) { 
											$('.disabled',that.element).fadeTo(500, 1.0).removeClass('disabled');
										}
										else {
											setTimeout(function(){recursiveCall()},1000);
								    	}
									}
								)
							}
							// Start polling in 5 seconds
							setTimeout(function(){recursiveCall()},5000);
						}						
					},
					error: function(data, textStatus, errorThrown) {
						$.log('TheranOS.UI.Page: Action: AJAX '+this.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
					},
					complete: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
					}
				});
				break;
			case "close_tray":
				$.ajax({
					type: "GET",
					url: 'http://localhost/Assay/APP/app?stage=close_tray',
					beforeSend: function(data) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' beforeSend: XMLHttpRequest = '+data);
					},
					success: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
						// if
							// ok: go ahead. if there's a wait screen, thaw it out
							// error: there's been an error opening the tray and we need to do something
					},
					error: function(data, textStatus, errorThrown) {
						$.log('TheranOS.UI.Page: Action: AJAX '+this.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
					},
					complete: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
					}
				});
				// needs to start polling http://localhost/Assay/APP/app?method=cmd_is_done&args=tray and listen for a 1 (done) and then enable the button
				break;
			case "begin_assay":
			    var _assayString ='';
				$.ajax({
					type: "GET",
					url: 'http://localhost/Assay/APP/app?stage=get_proto',
					beforeSend: function(data) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' beforeSend: XMLHttpRequest = '+data);
					},
					success: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
				      	_assayString = (data.indexOf('protocolName') > -1) ? data.substr(13,data.length) : ""; /***************/
						TheranOS.AssayString = _assayString;
						// if
							// protocolName = <assayname>
								// if in _lab mode_, print the assay name (_assayString) to the status screen
								if (TheranOS.Config.Modes.display_proto_results == true) {
									// delete p elements in status box
									// prepend $('<p>').text('Running test '+_assayString)
									// run proto
								}
								$.ajax({
									type: "GET",
									url: 'http://localhost/Assay/'+_assayString+'/app?stage=run_proto',
									beforeSend: function(data) {
										$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' beforeSend: XMLHttpRequest = '+data);
										function recursiveCall() {
										  	$.get('http://localhost/Assay/'+_assayString+'/app?method=get_progress',
												function(data){
											    	if (parseInt(data) >= 100) { 
													}
													else {
														$('div','.statusBar').css('width',((parseInt(data)/100)*280)+'px');
														setTimeout(function(){recursiveCall()},1000);
											    	}
												}
											)
										}
										// Start polling in 5 seconds
										setTimeout(function(){recursiveCall()},5000);
									},
									success: function(data, textStatus) {
										$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' success: textStatus = '+textStatus+' and data = '+data);
										// if
											// ok: go to eject screen
											TheranOS.UI.PageManager.drawPage('screen[name="test_eject"]', "whiteout"); 
											// results: results=JSON format and display on screen
												// display it on the screen
											// error: there's been an error opening the tray and we need to do something
									},
									error: function(data, textStatus, errorThrown) {
										$.log('TheranOS.UI.Page: Action: AJAX '+this.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
									},
									complete: function(data, textStatus) {
										$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
									}
								});
							// error: there's been an error opening the tray and we need to do something
					},
					error: function(data, textStatus, errorThrown) {
						$.log('TheranOS.UI.Page: Action: AJAX '+this.sReaderAction+' error: textStatus = '+textStatus+' and errorThrown = '+errorThrown+' and data = '+data);
					},
					complete: function(data, textStatus) {
						$.log('TheranOS.UI.Page: Action: AJAX: '+this.sReaderAction+' complete: textStatus = '+textStatus+' and data = '+data);
					}
				});
				break;
			case "post_data":
				$.post('http://localhost/Assay/'+TheranOS.AssayString+'/app?stage=post_data', TheranOS.Data.User.serialize(),function(data){
					$.log('post_data: page: action: response = '+data)
				}, "json");
				break;
			case "shutdown":
				// Begin Power Down.
				TheranOS.Util.powerDown(this.element);
				break;
			case "restart":
				// Begin Power Down.
				TheranOS.Util.restart(this.element);
				break;
			default:
		}
	}
	
	$.log('TheranOS.UI.Page: At this point our HTML is: '+this.element.html())
}

TheranOS.UI.Page.prototype = {
	display: function(displayPosition) {
		$.log('TheranOS.UI.Page.display('+displayPosition+')');
		displayPosition = (displayPosition == "next") ? 640 : (displayPosition == "previous") ? -640 : 0;
		return this.element.css("left",displayPosition);
	},
	arrange: function() {
		// Align elements horizontally.
		switch (this.sContentAlign) {
        	case "right":
				var _paraWidth = 610 - $('.positioner',this.element).width();
				$('.positioner',this.element).css({left: _paraWidth});
        	case "left":
        	case "center":
            	$('.positioner','#' + TheranOS.currentPage).css('text-align', this.sContentAlign);
        	default:	
				$.log('TheranOS.UI.Page.arrange(): Arranging Horizontal: '+this.sContentAlign);
            	break;
        }
		// Align elements vertically.
		switch (this.sContentVAlign) {
			case "middle":
				$.log('TheranOS.UI.Page.arrange(): Arranging Vertical: '+this.sContentVAlign);
		    	// get height of all contents
				var contentHeight = $('.positioner',this.element).innerHeight();
		    	var contentOffset = $('.positioner',this.element).offset();
		    	var pageHeight = 480
		    	$.log('TheranOS.UI.Page.arrange():'+ "\n" + "pageHeight = " + pageHeight + "\n" + "contentHeight = " + contentHeight + "\n" + "contentOffset.top = " + contentOffset.top + "\n" + "$('div.page').innerHeight() - contentHeight - contentOffset.top = " + ($('div.page').innerHeight() - (contentHeight + contentOffset.top)))
		    	$('.positioner',this.element).css('top', (pageHeight - (contentHeight + contentOffset.top)) / 2)
		    	break;
			case "bottom":
				$.log('TheranOS.UI.Page.arrange(): Arranging Vertical: '+this.sContentVAlign);
		    	// get height of all contents
				var contentHeight = $('.positioner',this.element).innerHeight();
		    	var contentOffset = $('.positioner',this.element).offset();
		    	var pageHeight = 480
				var buttonOffset = (this.sType != "landscape") ? 83 : 0// Value Approximated by Sight
		    	$('.positioner',this.element).css('top', (pageHeight - (contentHeight + contentOffset.top)) - buttonOffset) 
	        	break;
			case "top":
				$.log('TheranOS.UI.Page.arrange(): Arranging Vertical: '+this.sContentVAlign);
			default:
	    		break;
		}
		// If the first paragraph is two lines and the content is now too big, squish the content.  Ignore "time" type
		if ( ( $('label',this.element).size() > 0 ) && !(this.element.hasClass('time')) ) {
			for (var i = 0, heightLimit = 370, currentHeight = 0; (currentHeight<heightLimit)&&(i<$('label',this.element).size()); i++) {
				currentOffset = $('label:eq('+i+')',this.element).offset()
				currentHeight = currentOffset.top + $('label:eq('+i+')',this.element).innerHeight();
				if (currentHeight > heightLimit) {
					$('label:not(:first-child)',this.element).css("margin-top","10px")
					$('.column > label:first-child',this.element).css("margin-top","0px")
					$('.column',this.element).css("margin-top","16px")
				}
			}
		};
		// Distribute "time"-style survey
		if(this.element.hasClass('time')){
			var previousElementWidthHalf = $('label:first',this.element).width()/2
			$.log('page: survey: time: previousElementWidth = '+$('label:first',this.element).width())
			$.log('page: survey: time: previousElementWidthHalf = '+previousElementWidthHalf)
			var lastElementWidthHalf = $('label:last',this.element).width()/2
			$.log('page: survey: time: lastElementWidthHalf = '+$('label:last',this.element).width())
			$.log('page: survey: time: previousElementWidthHalf = '+lastElementWidthHalf)
			var idealSpacing = (580 - (previousElementWidthHalf + lastElementWidthHalf)) / ($('label',this.element).size() - 1);
			$.log('page: survey: time: idealSpacing = '+idealSpacing)
			$('label',this.element).each(function(i){
				if(i>0) {
					var cssMarginLeft = 0;
					var thisElementWidthHalf = $(this).width()/2
					$.log('page: survey: time: thisElementWidthHalf ('+i+') = '+thisElementWidthHalf)
					cssMarginLeft = Math.floor((idealSpacing - thisElementWidthHalf) - previousElementWidthHalf);
					$.log('page: survey: time: cssMarginLeft ('+i+') = '+cssMarginLeft)
					$(this).css('margin-left',cssMarginLeft);
					previousElementWidthHalf = thisElementWidthHalf;
				}
			});
		}	
	}
}
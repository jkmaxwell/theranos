TheranOS.Util = { };							// Set up TheranOS Utilities (i.e., Localization)



TheranOS.Util.getLocalizedString = function	(key) {
	$.log('TheranOS.Util.getLocalizedString('+key+')');
	try {
		var ret = TheranOS.Strings[key];
		if (ret === undefined)
			ret = key;
		return ret;
	} catch (ex) {}
	return key;
};

TheranOS.Util.DeviceTimers = [];	// Device Timers array (power down, restart, tray timers, etc.)

TheranOS.Util.startUp = function() {
	$.log('TheranOS.Util.startUp()');
	// Clear any timeout
	clearTimeout(TheranOS.Util.PowerDownTimer);
	// Return user to start screen
	TheranOS.UI.PageManager.drawPage('screen[name="start"]', "whiteout");
};

TheranOS.Util.powerDown = function(elem) {
	$.log('TheranOS.Util.powerDown('+elem+')');
	
	// Clear any timeout
	clearTimeout(TheranOS.Util.DeviceTimers["PowerDownTimer"]);
	
	var _powerDownTextTime = 30;
	
	function powerDownCycle(elem) {
		if ( _powerDownTextTime > 0 ) {
			var _s = (_powerDownTextTime > 1) ? "s" : "";
			var _x = Math.pow(((_powerDownTextTime+3)/30),1.5);
			
			$(elem).find('p:last','div.statusBox').text('Turning off in '+_powerDownTextTime+' second'+_s+'. Touch the screen at any time to turn it back on.');
			//$('div.statusBox',elem).css('opacity',_x)
						
			_powerDownTextTime--;
			TheranOS.Util.DeviceTimers["PowerDownTimer"] = setTimeout(function(){powerDownCycle(elem);},1000);
		} else {
			$('body').css('background-color','#000');
			$('div.page').animate({opacity: 0.0}, 500, 'easeOutQuint');
		}
	};
	
	TheranOS.Util.DeviceTimers["PowerDownTimer"] = setTimeout(function(){powerDownCycle();},1000);
};

TheranOS.Util.restart = function(elem) {
	$.log('TheranOS.Util.restart('+elem+')');
	
	// Clear any timeout
	clearTimeout(TheranOS.Util.DeviceTimers["RestartTimer"]);
	
	var _restartTextTime = 10;
	
	function restartCycle(elem) {
		if ( _restartTextTime > 0 ) {
			var _s = (_restartTextTime > 1) ? "s" : "";
			var _x = Math.pow(((_restartTextTime+3)/30),1.5);
			$(elem).find('p:last','div.statusBox').text('The system will restart in '+_restartTextTime+' second'+_s+'. Please don’t touch anything.');
			//$('div.statusBox',elem).css('opacity',_x)
						
			_restartTextTime--;
			TheranOS.Util.DeviceTimers["RestartTimer"] = setTimeout(function(){restartCycle(elem);},1000);
		} else {
				$('body').css('background-color','#000');
				$('div.page').animate({opacity: 0.0}, 500, 'easeOutQuint',function(){
					$.get('http://localhost:8080/Main/APP/app?stage=reboot');
				});
		}
	}
	
	TheranOS.Util.DeviceTimers["RestartTimer"] = setTimeout(function(){restartCycle();},1000);
};

TheranOS.Util.DeviceManager = (function(){
	var deviceTimers = []; 	// Create Device Timers array
							// Usage: deviceTimers["action_name"] as key
	var assayString;
							
	function runCommand(commandName,targetElement) {
		$.log('TheranOS.Util.DeviceManager.doCommand('+commandName+')');
		switch(commandName) {
			case "get_config":
			case "system_status":
			case "begin":
			case "open_tray":
				// try to open
					// if success
					// if error
						// try to close
							// if success
							// if error
								// call screen
			case "close_tray":
				// try to close
					// if success
					// if error
						// try to open
							// if success
							// if error
								// call screen
			case "begin_assay":
			case "post_user_data":
			case "shutdown":	
			case "restart":														
			default:
		}
	}
	// need to make AS objet and give it getter/setters
	return {
		doCommand: runCommand
	};
})();

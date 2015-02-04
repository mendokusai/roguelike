window.onload = function(){
// Check if rot.js can work on this browser
	if (!ROT.isSupported()) {
	    alert("The rot.js library isn't supported by your browser.");
	} else {
    //create the display
		var display = new ROT.Display({width:80, height:20});
		var container = display.getContainer();
		//add the container to the body
		document.body.appendChild(container);

		var foreground, background, colors;
		for (var i = 0; i < 15; i++){
			//create backgorund color range
		foreground = ROT.Color.toRGB([255 - (i * 20),
												  			  255 - (i * 20 ),
												  			  255 - (i * 20 )]);
		background = ROT.Color.toRGB([ i * 20, i * 20, 9 * 20]);
		//creates color format specifier
		colors = '%c{' + foreground + '}%b{' + background + '}';
		// draw the text at col 2 and row i
		display.drawText(2, i, colors + "Hello World!");
		}
	}
}
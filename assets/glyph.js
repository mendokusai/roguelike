Game.Glyph = function(chr, foreground, background) {
	//instantiate properties to default
	this._char = chr || ' ';
	this._foreground = foreground || 'white';
	this._background = background || 'black';	
};

//create getters for glyphs
Game.Glyph.prototype.getChar = function() {
	return this._char;
}
Game.Glyph.prototype.getBackground = function() {
	return this._background;
}
Game.Glyph.prototype.getForeground = function() {
	return this._foreground;
}

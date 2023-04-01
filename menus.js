globalThis.MAT = new class { //Menus and transformations
	constructor() {
		this.currentMenu = 1;
		this.errorReason = null;
		this.isErrored = false;
		this.considerParens = true; //Console should be able to change this
	}
	changeMenu(x) {
		var oldMenu = document.getElementById(`controls${this.currentMenu}`);
		var newMenu = document.getElementById(`controls${x}`);
		oldMenu.classList.add('hidden');
		newMenu.classList.remove('hidden');
		this.currentMenu = x;
	}
	startError(reason){
		this.errorReason = reason
		this.isErrored = true;
	}
	commaFormat(){
		var code = document.getElementById('editor-default')
		var temp = null;
		var parenCount = 0;
		var global = false
		try { //global testing
		var toencode = bytebeat.editorValue
			global = true
		} catch(err) { //local testing
			console.log(`Locally testing because ${err.message}`)
			var toencode = code.value
		}
		var inString = false;
		var inArray = false;
		var stringCount = 0;
			for (var i=0;i<toencode.length;i++) {
				if (this.isErrored) {break}
				switch(toencode[i]){
					case `,`: case `;`:
						if((parenCount == 0 || !this.considerParens) && !inArray && !inString && toencode[i+1] != `\n`) {
							temp = toencode.slice(0,i) + `${toencode[i]}\n` + toencode.slice(i+1,toencode.length)
							toencode = temp
						}
					break

					case `\``: case `'`: case `"`:
						inString = !inString
						stringCount++
					break

					case `[`: 
						if(!inString) {
							inArray = true
						}
					break

					case `]`: 
						if (!inArray) {
							this.startError("Unbalanced array")
						}
						else if(!inString) {
							inArray = false
						}	
					break

					case `(`: 
						if(!inString) {
							parenCount++
						}
					break

					case `)`: 
						if(!inString) {
							parenCount--
							if (parenCount<0){
								this.startError("Unbalanced parenthesies")
							}
						}
					break
				}
			}
			if(stringCount&1){
				console.error("Error in comma-formatting: Unterminated string!")
			} else if(inArray) {
				console.error("Error in comma-formatting: Unbalanced array!")
			} else if(parenCount != 0) {
				console.error("Error in comma-formatting: Unbalanced parenthesies!")
			} else if (this.isErrored) {
				console.error(`Error in comma-formatting: ${this.errorReason}!`)
			} else if(global) {
				bytebeat.editorView.dispatch({
					changes: {
						from: 0,
						to: bytebeat.editorView.state.doc.toString().length,
						insert: toencode
					}
				})
				console.log("Sucessfully formatted!")
			} else {
			code.value = toencode
			console.log("Sucessfully formatted!")
			}
			this.isErrored=false
		}
}
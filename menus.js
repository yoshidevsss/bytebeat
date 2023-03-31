globalThis.MAT = new class { //Menus and transformations
	constructor() {
		this.currentMenu = 1;
	}
	changeMenu(x) {
		var oldMenu = document.getElementById(`controls${this.currentMenu}`);
		var newMenu = document.getElementById(`controls${x}`);
		oldMenu.classList.add('hidden');
		newMenu.classList.remove('hidden');
		this.currentMenu = x;
	}
	commaFormat(){
		var code = document.getElementById('editor-default')
		var temp = null;
		var global = false
		try { //global testing
		var toencode = bytebeat.editorValue
			global = true
		} catch(err) { //local testing
			console.warn(`Locally testing because ${err.message}`)
			var toencode = code.value
		}
		var inString = false;
		var inArray = false;
		var stringCount = 0;
			for (var i=0;i<toencode.length;i++) {
				switch(toencode[i]){
					case `,`: case `;`:
						if(!inArray && !inString && toencode[i+1] != `\n`) {
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
						if(!inString) {
							inArray = false
						}	
					break
				}
			}
			if(stringCount&1){
				console.error("Error in comma-formatting: Unterminated string")
			}
			if(global) {
				bytebeat.editorView.dispatch({
					changes: {
						from: 0,
						to: bytebeat.editorView.state.doc.toString().length,
						insert: toencode
					}
				})
			} else {
			code.value = toencode
			}
		}
}
globalThis.MAT = new class { //Menus and transformations
	constructor() {
		this.currentMenu = 1;
		this.errorReason = null;
		this.isErrored = false;
		this.considerParens = true; //Console should be able to change this
		this.formatted = null;
		this.code = document.getElementById('editor-default');
		this.forceElem = document.getElementById('control-force-output');
		this.clearElem = document.getElementById('control-clear-output');
		this.startElem = document.getElementById('control-format');
		this.global = false;
		this.errorText = null;
		this.oldCode = null;
	}
	changeMenu(x) {
		var oldMenu = document.getElementById(`controls${this.currentMenu}`);
		var newMenu = document.getElementById(`controls${x}`);
		oldMenu.classList.add('hidden');
		newMenu.classList.remove('hidden');
		this.currentMenu = x;
	}
	startError(reason){
		this.errorReason = reason;
		this.isErrored = true;
	}
	setCodeMirrorEditor(string){
			bytebeat.editorView.dispatch({
				changes: {
					from: 0,
					to: bytebeat.editorView.state.doc.toString().length,
					insert: string
				}
			})
	}
	output(text = this.formatted){
		if(this.global) {
		this.setCodeMirrorEditor(text)
		} else {
		this.code.value = text
		}
		this.forceElem.classList.add("hidden")
		this.startElem.classList.remove(`hidden`);
		this.clearElem.classList.add("hidden")
		return text
	}
	clear(){
		this.output(this.oldCode)
	}
	commaFormat(){
		var initialCode;
		var temp = null;
		var parenLayerCount = 0;
		this.global = false
		try { //global testing
		var toencode = initialCode = bytebeat.editorValue;
			this.global = true;
		} catch(err) { //local testing
			console.log(`Locally testing because ${err.message}`);
			var toencode = initialCode = this.code.value;
		}
		var inString = false;
		var arrayLayerCount = false;
		var stringCount = 0;
			for (var i=0;i<toencode.length;i++) {
				if (this.isErrored) {break} // error handling
				switch(toencode[i]){
					case `,`: case `;`:
						if((parenLayerCount == 0 || !this.considerParens) && (arrayLayerCount == 0) && !inString && toencode[i+1] != `\n`) {
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
							arrayLayerCount++
						}
					break

					case `]`: 
						if(!inString) {
							arrayLayerCount--
							if (arrayLayerCount<0){
								this.startError("Unbalanced arrays!")
							}
						}							
					break

					case `(`: 
						if(!inString) {
							parenLayerCount++
						}
					break

					case `)`: 
						if(!inString) {
							parenLayerCount--
							if (parenLayerCount<0){
								this.startError("Unbalanced parenthesies!")
							}
						}
					break
				}
			}
			this.formatted=toencode;
			this.errorText=null;
			if(stringCount&1){
				console.error(this.errorText = "Error in comma-formatting: Unterminated string!")
				this.isErrored = true
			} else if(arrayLayerCount != 0) {
				console.error(this.errorText = "Error in comma-formatting: Unbalanced array!")
				this.isErrored = true
			} else if(parenLayerCount != 0) {
				console.error(this.errorText = "Error in comma-formatting: Unbalanced parenthesies!")
				this.isErrored = true
			} else if (this.isErrored) {
				console.error(this.errorText = `Error in comma-formatting: ${this.errorReason}`)
			} else {this.output()}
			if(this.isErrored){
				console.warn("This simply means the formatting may be incorrect. To force the formatted code to output use MAT.output() or click Force output")
			} else {
				console.log("Sucessfully formatted!")
				this.forceElem.classList.add('hidden');	
				this.startElem.classList.remove(`hidden`);
				this.clearElem.classList.add('hidden');			
			}
			if(this.isErrored){
				this.output(`${initialCode} \n\n// ${this.errorText} \n// This simply means the formatting may be incorrect. To force the formatted code to output, click "Force output"`);
				this.oldCode = initialCode;
				this.forceElem.classList.remove('hidden');
				this.startElem.classList.add(`hidden`);
				this.clearElem.classList.remove('hidden');	
			}
			this.isErrored=false
		}
}
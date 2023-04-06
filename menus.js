String.prototype.corrupt = (x) => {
	let construction = ""
	let str = this.valueOf()

	for(let i=0; i<this.length;i++){
		construction += fromCharCode(str.charCodeAt(i)+x)
	}

	return construction
}

globalThis.baker = new class { //Chasyxx's bakers chasyxx.github.io/minibaker
	constructor() {
		this.in = null
		this.temp = null
		this.c1 = null
		this.c2 = null
		this.cc1 = null
		this.cc2 = null
		this.cmb = null
		this.sts = null
	}
	minibake(str){
		if (str.length&1) {
			str+= " "
		}
		str = str.replace( /, /g, ",")
		let len = Math.floor( str.length / 2 )
		let output = ""
		for(let i=0;i<len;i++){
			this.c1 = str.substring( i * 2, i * 2 + 1)
			this.c2 = str.substring( i * 2 + 1, i * 2 + 2)
			this.cc1 = this.c1.charCodeAt(0)
			this.cc2 = this.c2.charCodeAt(0)
			this.cmb = (this.cc1 << 8) | this.cc2
			output += String.fromCharCode(this.cmb)
			//output += String.fromCodePoint(cmb)
		}
		MAT.output("eval(unescape(escape`" + output + "`.replace(/u(..)/g,\"$1%\")))",true)
	}
	debake(str) {
		let temp = null
		str = str.replace( /, /g, ",").slice(21,str.length-27)
		let len = str.length
		let output = ""
		for(let i=0;i<len;i++){
			temp=str.charCodeAt(i)
			this.cc1=temp>>8
			this.cc2=temp&255
			if(this.cc1!=0){
			output += String.fromCharCode(this.cc1)
			} if(this.cc2!=0){
			output += String.fromCharCode(this.cc2)
			}
			//output += String.fromCodePoint(cmb)
		}
		if(output != "") {
		MAT.output(output,true)
		}
	}
}

/*===========================  ==     ==  ==  === =   =  ===========================*/
/*===========================  = =   = = =  =  =  ==  =  ===========================*/
/*===========================  =  = =  = ====  =  = = =  ===========================*/
/*===========================  =   =   = =  = === =  ==  ===========================*/


globalThis.MAT = new class { //Menus and transformations
	constructor() {
		this.currentMenu = 1
		this.errorReason = null
		this.errorChar = null
		this.isErrored = false
		this.considerParens = true //Console should be able to change this
		this.formatted = null
		this.code = document.getElementById('editor-default')
		this.forceElem = document.getElementById('control-force-output')
		this.clearElem = document.getElementById('control-clear-output')
		this.startElem = document.getElementById('control-format')
		this.bakeElem = document.getElementById('control-minibake')
		this.debakeElem = document.getElementById('control-deminibake')
		this.tabName = document.getElementById('TAB-NAME')
		this.disappear = [document.getElementById(`control-sum`)]
		this.AprilFoolsElements=[this.forceElem,this.clearElem,this.startElem,this.bakeElem,this.debakeElem]
		this.errorText = null
		this.oldCode = null
		this.MaxParenLayersAllowed = 0
		this.localTest = null

		// Disappear items in disappear array if global (when I locally test the bytebeat script doesn't load to automatically call some functions; I use this to create manual uttons for these functions instead; When the bytebeat script doesn't load the bytebeat class doesn't exist, os it throws an exception that is then caught and switches course, meaning the buttons do not disappear and i can more easily test things like seed().)


	}

	get codeText() {
		return this.localTest?this.code.value:bytebeat.editorValue
	}

	changeMenu(x) {
		var oldMenu = document.getElementById(`controls${this.currentMenu}`)
		var newMenu = document.getElementById(`controls${x}`)
		oldMenu.classList.add('hidden')
		newMenu.classList.remove('hidden')
		this.currentMenu = x

		if (x==2&&this.localTest==null){
			
		try {
			var xQr = (bytebeat.editorValue)
			this.disappear.forEach(X => {
				X.classList.add('hidden')
			});
			this.localTest=false
		} catch (error) {
			this.localTest=error.message
			console.warn(`Local testing (${error.message})`)
		}
		}
	}
	startError(reason, char=-1){
		this.errorReason = reason
		this.errorChar = char
		this.isErrored = true
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
	output(text = this.formatted, update=false){
		if(this.localTest) {
			this.code.value = text
		} else {
			this.setCodeMirrorEditor(text)
		}
		this.forceElem.classList.add("hidden")
		this.startElem.classList.remove(`hidden`)
		this.clearElem.classList.add("hidden")
		try{if(update && !this.localTest) {
			bytebeat.updateUrl() //Commit changes to the saved URL
		}}catch(err){console.error(`URL not saved (${err.message})`)}
	}
	clear(){
		this.output(this.oldCode,true)
	}
	commaFormat(){
		var initialCode
		var parenLayerCount = 0
		if(this.localTest) {
			var toEncode = initialCode = this.code.value
		} else {
			var toEncode = initialCode = bytebeat.editorValue
		}
		var inString = false
		var arrayLayerCount = false
		var stringCount = 0
			for (var i=0;i<toEncode.length;i++) {
				if (this.isErrored) {break} // error handling
				switch(toEncode[i]){
					case `,`: case ``:
						console.log(this.MaxParenLayersAllowed + " , " + parenLayerCount + ": " + (parenLayerCount < (this.MaxParenLayersAllowed+1)))
						if((parenLayerCount < (this.MaxParenLayersAllowed+1) || !this.considerParens) && (arrayLayerCount == 0) && !inString && toEncode[i+1] != `\n`) {
							toEncode = toEncode.slice(0,i) + `${toEncode[i]}\n` + toEncode.slice(i+1,toEncode.length)
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
								this.startError("Unbalanced array!",i)
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
								this.startError("Unbalanced parenthesies!",i)
							}
						}
					break
				}
			}
			this.formatted=toEncode
			this.errorText=null
			if(stringCount&1){
				console.error(this.errorText = "Error in comma-formatting: Unterminated string!")
				this.isErrored = true
			} else if(arrayLayerCount > 0) {
				console.error(this.errorText = "Error in comma-formatting: Unbalanced array!")
				this.isErrored = true
			} else if(parenLayerCount > 0) {
				console.error(this.errorText = "Error in comma-formatting: Unbalanced parenthesies!")
				this.isErrored = true
			} else if (this.isErrored) {
				console.error(this.errorText = `Error in comma-formatting at char ${this.errorChar}: ${this.errorReason}`)
			} else {this.output(this.formatted,true)}
			if(this.isErrored){
				console.warn("This simply means the formatting may be incorrect. To force the formatted code to output use MAT.output() or click Force output")
			} else {
				console.log("Sucessfully formatted!")
				this.forceElem.classList.add('hidden')	
				this.startElem.classList.remove(`hidden`)
				this.clearElem.classList.add('hidden')			
			}
			if(this.isErrored){
				this.output(`${initialCode} \n\n// ${this.errorText} \n// This simply means the formatting may be incorrect. To force the formatted code to output, click "Force output"`,false)
				this.oldCode = initialCode
				this.forceElem.classList.remove('hidden')
				this.startElem.classList.add(`hidden`)
				this.clearElem.classList.remove('hidden')	
			}
		this.isErrored=false
	}
	bake(){
		var wasPlaying = false;
		if(this.localTest) {
			var toEncode = this.code.value
		} else {
			var toEncode = bytebeat.editorValue
			wasPlaying = bytebeat.isPlaying
			bytebeat.playbackToggle(false)
		}
		baker.minibake(toEncode)
		if(wasPlaying){
			bytebeat.playbackToggle(true)
		}
	}
	debake(){
		var wasPlaying = false;
		if(this.localTest) {
			var toEncode = this.code.value
		} else {
			var toEncode = bytebeat.editorValue
			wasPlaying = bytebeat.isPlaying
			bytebeat.playbackToggle(false)
		}
		baker.debake(toEncode)
		if(wasPlaying){
			bytebeat.playbackToggle(true)
		}
	}
	setParens(x){
		x-=0
		this.MaxParenLayersAllowed = x
		console.log(x + ": " + typeof x)
	}
	seed(forTitle=false, toEncode){ //No, it's not a checksum! One character doesn't affect the whole thing!
		if(this.localTest && !toEncode) {
				var toEncode = this.code.value
			} else if (!toEncode) {
				var toEncode = bytebeat.editorValue
			}
			var inputLength = toEncode.length
			var temp = 0
			var temp3 = 0
			for(var i=0;i<inputLength;i++){
				temp += toEncode.charCodeAt(Math.floor(i*1.5)%inputLength)
				temp3 += toEncode.charCodeAt(i)*(i&1?i:-i)
			}
			var temp2 = btoa(temp.toString(36)).replace('==','').replace('=','')
			var temp4 = btoa(temp3.toString(36)).replace('==','').replace('=','')
			var finalSeed = (temp2 + "-3-" + temp4)
			if(forTitle){
				this.tabName.innerText = "CHYX: " + finalSeed
			}
		return finalSeed
	}
}

let logdiv = document.getElementById('log')
let headers = document.getElementsByClassName('library-header')
let modes = document.getElementsByClassName('song-options')
let currentDate = new Date()
let day = currentDate.getDate()
let month = currentDate.getMonth() + 1

let apfo = async () => {try{

if(month==4&&day==1){
	let r = "Uncaught ReferenceError: April.first is not defined\n"

	MAT.setCodeMirrorEditor(r/*[Math.floor(Math.random()*(r.length+1))]*/)
	MAT.AprilFoolsElements.forEach(X => {
		X.innerText=r
	});
	for(let i=0;i<headers.length;i++){
		headers.item(i).innerText = r
	}
	for(let i=0;i<modes.length;i++){
		modes.item(i).innerText = r
	}
	let s = Math.floor(Math.random()*(r.length)*8)+(r.length*4)
	for(let i=0;i<s;i++){
		IIOR=Math.random()>0.5
		logdiv.innerHTML+= r[i%r.length] + (IIOR?"<br>":"")
		if(IIOR) {
		await new Promise(resolve => setTimeout(resolve, 25));
		}
	}
}

} catch(ERR) {
	logdiv.innerText = ERR.stack
}}

setTimeout(apfo,1000)


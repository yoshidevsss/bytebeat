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
		var temp = null
		var inString = false;
		var stringCount = 0;
			for (var i=0;i<code.value.length;i++) {
				switch(code.value[i]){
					case `,`: case `;`:
						if(!inString && code.value[i+1] != `\n`) {
							temp = code.value.slice(0,i) + `${code.value[i]}\n` + code.value.slice(i+1,code.value.length)
							code.value = temp
						}
					break

					case `\``: case `'`: case `"`:
						inString = !inString
						stringCount++
						break
				}
			}
			if(stringCount&1){
				console.error("Error in comma-formatting: Unterminated string")
			}
		}
}
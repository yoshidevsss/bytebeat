let splashes = [
	`What do you mean "this.func is not a function"!?!?`,
	`[object Object]`,
	`Bit reverse? Line break!`,
	`Line break? Bit reverse!`]
splash = document.getElementById(`splash`)
splash.innerText= splashes[Math.round((Math.random())*splashes.length)]
const splashes = [
`What do you mean "this.func is not a function"!?!?`,
`[object Object]`,
`Bit reverse? Line break!`,
`Line break? Bit reverse!`,
`Imagine if the website completely broke :skull:`,
`Go away, logmode10!`,
`Go away, Sinmode!`,
`Go away, SinFreq!`,
`chasyxx.guthub.io/minibaker`,
`0x8F <3`,
`Fun fact! If you scroll down, the website looks just like dollChan! But it isn't, it says that right above me.`,
`missingNo.`,
`No, i'm not adding Pale Moon compatibillty, juan!`]

const splash = document.getElementById(`splash`)
const rnd = Math.floor((Math.random())*splashes.length)
splash.innerText= splashes[rnd]
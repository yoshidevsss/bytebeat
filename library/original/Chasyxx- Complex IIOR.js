// Complex IIOR

// Uses THE MOTHERLODE, a collection of effects you can use on _ANY_ variable that changes. This tool was made by Graserpirate.

// This song is a remix of inside castle, by Rio Zack.

// Repeat x beats of y
// SUPER useful if you're writing complex beats/melodies
// Include this or the FXs won't work (or you could replace r(x, y) with Array(x).fill(y))
// r(1,[arrays]) also serves as a replacement for [arrays].flat()
r = repeat = (x, y) => Array(x).fill(y).flat(9),

// Uses up a lot of chars and isn't /super/ readable, but a major timesaver when creating
// Particularly the NaN handing
m = mix = (x, vol = 1, dist = 0) => ((x * vol * (1 + dist)) % (256 * vol))||0,

// Waveshaper distortion
ds = (x, amt) => x * (1 - amt) + (128 * ((x / 128) - 1) ** 3 + 128) * amt,

// The Breakbeat drum machine. This is where the magic happens
// It sequences through an array and plays the corresponding number of beats
//    (1 = quarter note, 2 = 2 8th notes, etc)
// Something interesting happens when you don't use powers of 2, however:
//    You get strange and wonderful sounds
// the variables 's' and 'h' make it sound like a snare and a hihat, respectively
// most sounds are different timbres of the same note
// but if you replace 'T' with something other than T, such as any bytebeat melody,
// you can apply that timbre to the melody.
// Adding / &ing a breakbeat with a melody can also add attack to the notes of the melody
bt = beat = (arr, spd, vel = 2e4, vol = 1, T = t, oct = 0) =>
	m(vel / (T & (2 ** (spd - oct) / arr[(t >> spd) % arr.length]) - 1), vol),

s = sin(t / 9 & t >> 5), // Snare
// s = sin(t>>5), // acoustic-sounding grungy snare
// s = sin((t | t * .7) >> 4), // quieter snare
h = (1 & (t>>2) * .9)*2, // Hihat


// The FX rack, stores memory for use in effects
// Automatically keeps track of what's stored where
// If you see red (NaNs), raise 3e5 higher, or adjust your reverbs' 'dsp' variable
// Works best when FX are not inside conditionals (meaning the number of FX in use changes)
// But even then, should only create a momentary click/pop (might be more severe for reverb)
// I chose 3e6 because it's the size of Doom's sourcecode, you shouldn't be using more than that
// You can also set it to [] and modify the effects to read m(fx[stuff]) to get around NaN issues
//    ^(this gets rid of the lag when editing, but sparse arrays might be slower during runtime)
t ? 0 : fx = r(3e5, 0),
// Iterator, resets to 0 at every t
fxi = 0,

// NOTE: IF YOU ALTER T, DO IT AFTER THIS FUNCTION
t2 = t,
//dsp = downsample the bitrate of the reverb, dsp=1 cuts uses half as much space, 2 uses 1/4, etc
rv = reverb = (x, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 0) => (
	ech = fxi + ((t2 % len) >> dsp),
	x = x * dry + wet * fx[ech],
	fx[ech] = x * feedb, //shorter, but lower res = louder
	//t2 % (1<<dsp) ? 0 : fx[ech] = x * feedb,
	fxi += len >> dsp,
	x
),

lp = lopass = (x, f) => ( // f ~= frequency, but not 1:1
	// fx[fxi] is the value of the last sample
	// You will need to change the 'x % 256' if you're using signed or floatbeat
	x = min(max(x % 256, fx[fxi] - f), fx[fxi] + f), // Clamp the change since last sample between (-f, f)
	fx[fxi] = x,
	fxi++,
	x
),

// Sounds kinda off, and hipass+lopas=/=original when you use ^, but + sounds harsher
hp = hipass = (x, f) => (x % 256) - lp(x, f),

//downsample
dsp = downsample = (x, res) => (
	x = fx[fxi] = t2 % res ? fx[fxi] : x,
	x
),

// Multi-voice melody: 'voices' is like a list of resonances
mvm = (melody, speed, voices) => (
	vcp = voices,
	vcp.reduce((sum, i) =>
		sum + m(i * t * 1.05946 ** melody[(t >> speed) % melody.length], .9 / vcp.length), 0)
),

t *= 48 / 48,
//t+=2e6,

// ------------ARRAYS------------

// Chrome lags when these are defined at every t
// weirdly though this isn't the case for functions
//note: any arrays with s or h must be outside the t||()
t || (
melody=[2,4,5,9,2,4,5,9,2,4,5,9,12,9,7,5,0,2,4,7,0,2,4,7,0,2,4,7,0,2,4,0,-2,0,2,5,-2,0,2,5,-2,0,2,5,-2,0,2,-2,-3,-1,1,4,-3,-1,1,4,-3,-1,1,7,-3,-1,1,9]
),
t-=32768,
s=(s+1)/2,
drumArray=[s,0,s,0,s,s,s,h],

rotate = ofs => sin((t * 2 ** -16) + ofs) + 2,
rRrR=max(0,t/(1<<16)),
bar=t>>16,

//  ------------SONG------------

a=t=>(p=melody[(t>>13)%64],z=t*2**(p/12)*3.2,(z&128)/1.5)*(1-t%8192/12E3),
b=(t,X=1)=>(p=melody[((t>>17)%4)*16],z=(t/(4/X))*2**(p/12)*3.2,(z&128)/1.5)*(32-t%65536/48E3),
mel=lp(a(t)+a(t-12168)/2+a(t-24336)/4+a(t-36504)/8+a(t-48672)/16,rRrR),
bass=(t,X)=>(b(t,X)+b(t-12168)/2+b(t-24336,X)/4+b(t-36504,X)/8+b(t-48672,X)/16)/(32*X),
drums=drumArray[(t>>12)%drumArray.length]*(64/(((t>>7)&31)+1)),drums=isNaN(drums)?0:drums*3,
drums2=bt([1,0,3,0,2,4,3,5],12),
subOutput=((mel+((bar>15&&bar!=31&&bar!=47)?bass(t,1):0)+((bar>23&&bar!=31&&bar!=47)?bass(t,2):0)^(bar>31?(bar&2?drums2:drums):0))/1.7),

subOutput2=bar<31?rv(subOutput,16e2+(rRrR*64)):subOutput,
bar>47?0:bar<32?dsp(subOutput2,4):subOutput2

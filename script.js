// Predefined coordinates
const regions = {
	name: [
		{
			left: 70,
			top: 26,
			width: 290,
			height: 60
		}
	],
	group1: [
		{
			left: 65,
			top: 885,
			width: 310,
			height: 36
		},
		{
			left: 65,
			top: 918,
			width: 310,
			height: 35
		},
		{
			left: 65,
			top: 953,
			width: 310,
			height: 35
		},
		{
			left: 65,
			top: 987,
			width: 310,
			height: 34
		},
		{
			left: 65,
			top: 1021,
			width: 310,
			height: 35
		}
	],
	group2: [
		{
			left: 443,
			top: 885,
			width: 310,
			height: 36
		},
		{
			left: 443,
			top: 918,
			width: 310,
			height: 35
		},
		{
			left: 443,
			top: 953,
			width: 310,
			height: 35
		},
		{
			left: 443,
			top: 987,
			width: 310,
			height: 34
		},
		{
			left: 443,
			top: 1021,
			width: 310,
			height: 35
		}
	],
	group3: [
		{
			left: 817,
			top: 885,
			width: 310,
			height: 36
		},
		{
			left: 817,
			top: 918,
			width: 310,
			height: 35
		},
		{
			left: 817,
			top: 953,
			width: 310,
			height: 35
		},
		{
			left: 817,
			top: 987,
			width: 310,
			height: 34
		},
		{
			left: 817,
			top: 1021,
			width: 310,
			height: 35
		}
	],
	group4: [
		{
			left: 1191,
			top: 885,
			width: 310,
			height: 36
		},
		{
			left: 1191,
			top: 918,
			width: 310,
			height: 35
		},
		{
			left: 1191,
			top: 953,
			width: 310,
			height: 35
		},
		{
			left: 1191,
			top: 987,
			width: 310,
			height: 34
		},
		{
			left: 1191,
			top: 1021,
			width: 310,
			height: 35
		}
	],
	group5: [
		{
			left: 1565,
			top: 885,
			width: 310,
			height: 36
		},
		{
			left: 1565,
			top: 918,
			width: 310,
			height: 35
		},
		{
			left: 1565,
			top: 953,
			width: 310,
			height: 35
		},
		{
			left: 1565,
			top: 987,
			width: 310,
			height: 34
		},
		{
			left: 1565,
			top: 1021,
			width: 310,
			height: 35
		}
	]
}

// Sub-stat ranges
const range = {
	Empty: {
		min: 0,
		max: 100
	},
	HP: {
		min: 320,
		max: 580
	},
	ATK: {
		min: 30,
		max: 60
	},
	DEF: {
		min: 40,
		max: 70
	},
	'HP%': {
		min: 6.4,
		max: 11.6
	},
	'ATK%': {
		min: 6.4,
		max: 11.6
	},
	'DEF%': {
		min: 8.1,
		max: 14.7
	},
	CritRate: {
		min: 6.3,
		max: 10.5
	},
	CritDMG: {
		min: 12.6,
		max: 21
	},
	EnergyRegen: {
		min: 6.8,
		max: 12.4
	},
	BasicAttackDMGBonus: {
		min: 6.4,
		max: 11.6
	},
	HeavyAttackDMGBonus: {
		min: 6.4,
		max: 11.6
	},
	ResonanceSkillDMGBonus: {
		min: 6.4,
		max: 11.6
	},
	ResonanceLiberationDMGBonus: {
		min: 6.4,
		max: 11.6
	}
}

// Supported characters
const chars = {
	Aalto: {},
	Augusta: {},
	Baizhi: {},
	Brant: {},
	Calcharo: {},
	Camellya: {},
	Cantarella: {},
	Carlotta: {},
	Cartethyia: {},
	Changli: {},
	Chisa: {},
	Chixia: {},
	Ciaconna: {},
	Danjin: {},
	Encore: {},
	Galbrena: {},
	Iuno: {},
	Jianxin: {},
	Jinhsi: {},
	Jiyan: {},
	Lingyang: {},
	Lumi: {},
	Lupa: {},
	Mortefi: {},
	Phoebe: {},
	Phrolova: {},
	Qiuyuan: {},
	Roccia: {},
	Rover: {},
	Sanhua: {},
	Taoqi: {},
	'The Shorekeeper': {},
	Verina: {},
	'Xiangli Yao': {},
	Yangyang: {},
	Yinlin: {},
	Youhu: {},
	Yuanwu: {},
	Zani: {},
	Zhezhi: {}
}

document.getElementById('imageInput').addEventListener('change', async function (e) {
	// File
	const file = e.target.files[0]
	if (!file) return
	// Hide upload
	document.querySelector('label[for="imageInput"]').style.display = 'none'
	// Tesseract
	const worker = await Tesseract.createWorker('eng')
	// Tesseract Settings
	await worker.setParameters({
		tessedit_pageseg_mode: 7
	})
	// Image Element
	const img = new Image()
	img.src = URL.createObjectURL(file)
	await img.decode()
	// Create a canvas for cropping
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')

	// Container Elements
	var container = document.querySelectorAll('.gear')
	var currentContainer = 0
	var score = 0
	for (let echo in regions) {
		var rv = 0
		var cv = 0
		for (let i = 0; i < regions[echo].length; i++) {
			// Setup
			const { left, top, width, height } = regions[echo][i]
			canvas.width = width
			canvas.height = height
			ctx.clearRect(0, 0, width, height)
			ctx.drawImage(img, left, top, width, height, 0, 0, width, height)

			// Contrast Adjustement
			increaseContrast(canvas, ctx)

			// Convert cropped area to a data URL
			const croppedDataUrl = canvas.toDataURL()

			// OCR on the cropped region
			const {
				data: { text }
			} = await Tesseract.recognize(croppedDataUrl, 'eng')

			// Detect Char
			if (echo == 'name') {
				var match = Object.keys(chars).find((key) => text.toLowerCase().includes(key.toLowerCase()))
				if (match) {
					document.querySelector('.title').textContent = match + "'s Echoes"
					document.querySelector('.backdrop').style.backgroundImage = `url("./media/img/backdrop/${match.replace(' ', '')}.webp")`
				}
				continue
			}

			// Toggle container
			container[currentContainer].style.display = 'flex'

			// Cleanup
			var output =
				text
					.replace('al', 'HP')
					.replace('\n', '')
					.replace(/(\d+(\.\d+)?%?)/, '')
					.replace(/\s+/, ' ')
					.trim() +
				' ' +
				(text.match(/(\d+(\.\d+)?%?)/) || [''])[0]

			// Empty stats
			if (text == '' || text.length < 4) {
				output = 'Empty 0'
			}

			// Pre-format
			var label = output.split(' ')
			label.pop()
			label = label.join(' ')
			var amount = output.split(' ')[output.split(' ').length - 1]

			// Fix incorrect chars
			if (amount[0] == '1' && amount[1] == '7') {
				// 11.7 > 17.7
				amount = '17' + amount.slice(2)
			}
			if (amount[0] == '1' && amount[1] == '.') {
				// 1.9 > 7.9
				amount = '7' + amount.slice(1)
			}
			if ('ATK|HP|DEF'.includes(label) && amount[amount.length - 1] == '%') {
				// Fix missing %
				label += '%'
			}
			label = label.replace('Ronus', 'Bonus') // Ronus -> Bonus

			// Label formats
			var calcLabel = label.replaceAll(' ', '').replaceAll('.', '')
			var calcAmount = amount.replace('%', '')

			// Percentage
			var perc = (((calcAmount - range[calcLabel].min) / (range[calcLabel].max - range[calcLabel].min)) * 100).toFixed(2)
			if (perc < 1) {
				perc = 3
			}

			// Roll values
			rv += parseFloat(perc)

			// Crit value
			if (calcLabel.includes('Crit')) {
				cv += parseFloat(perc)
			}

			// Add element
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">${label}</span>
					<span class="value">${amount}</span>`
			if (calcLabel == 'Empty') {
				// Empty Stat
				el.style.background = 'linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ' + perc + '%, transparent ' + perc + '%), rgba(32, 34, 37, 0.52)'
			} else {
				// Found stat
				el.style.background = 'linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ' + perc + '%, transparent ' + perc + '%), rgba(32, 34, 37, 0.52)'
			}
			container[currentContainer].append(el)
		}

		if (echo != 'name') {
			// Crit Value
			var cv_perc = (cv / 200) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Crit Roll Value</span>
					<span class="value">${cv.toFixed(1)}<span class="sub-value">/200</span></span>`
			el.style.background = 'linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ' + cv_perc + '%, transparent ' + cv_perc + '%), rgba(32, 34, 37, 0.52)'
			container[currentContainer].append(el)

			// Roll Value
			var rv_perc = (rv / 500) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Sub Roll Value</span>
					<span class="value">${rv.toFixed(1)}<span class="sub-value">/500</span></span>`
			el.style.background = 'linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ' + rv_perc + '%, transparent ' + rv_perc + '%), rgba(32, 34, 37, 0.52)'
			container[currentContainer].append(el)

			// Scoring
			score += rv

			currentContainer++
		}
	}
	// Scoring Label
	var scoreLabel = document.querySelector('.gear-score')
	var score_perc = (score / 2500) * 100
	scoreLabel.innerHTML = `Score: ${score_perc.toFixed(2)}%<span class="sub-value">(${score.toFixed(2)}/2500)</span>`
	scoreLabel.style.display = 'flex'

	// Enable reset
	document.querySelector('#reset').style.display = 'block'
})

function increaseContrast(canvas, ctx, contrast = 1.5) {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
	const data = imageData.data
	for (let i = 0; i < data.length; i += 4) {
		data[i] = (data[i] - 128) * contrast + 128 // Red
		data[i + 1] = (data[i + 1] - 128) * contrast + 128 // Green
		data[i + 2] = (data[i + 2] - 128) * contrast + 128 // Blue
		// data[i + 3] is alpha (leave unchanged)
	}
	ctx.putImageData(imageData, 0, 0)
}

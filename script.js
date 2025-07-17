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
	None: {
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
	Aalto: {
		weights: {
			HP: 0,
			ATK: 0.5,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 0.13
		}
	},
	Augusta: {},
	Baizhi: {
		weights: {
			HP: 1,
			ATK: 0,
			DEF: 1,
			'HP%': 1,
			'ATK%': 0,
			'DEF%': 1,
			CritRate: 0,
			CritDMG: 0,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Brant: {
		weights: {
			HP: 0,
			ATK: 0.5,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0.18
		}
	},
	Calcharo: {
		weights: {
			HP: 0,
			ATK: 0.5,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Camellya: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0.17
		}
	},
	Cantarella: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.07,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Carlotta: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.01,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Cartethyia: {
		weights: {
			HP: 0.5,
			ATK: 0,
			DEF: 0,
			'HP%': 1,
			'ATK%': 0,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0.1,
			ResonanceSkillDMGBonus: 0.13,
			ResonanceLiberationDMGBonus: 0.24
		}
	},
	Changli: {
		weights: {
			HP: 0,
			ATK: 0.5,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.04,
			HeavyAttackDMGBonus: 0.02,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Chisa: {},
	Chixia: {
		weights: {
			HP: 0,
			ATK: 0.5,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Ciaconna: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.5,
			HeavyAttackDMGBonus: 0.5,
			ResonanceSkillDMGBonus: 0.04,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Danjin: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0.5,
			ResonanceLiberationDMGBonus: 0.5
		}
	},
	Encore: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Galbrena: {},
	Iuno: {},
	Jianxin: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.5,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0.36
		}
	},
	Jinhsi: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.35,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 0.18
		}
	},
	Jiyan: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.3,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0.15,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Lingyang: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.29,
			ResonanceLiberationDMGBonus: 0.06
		}
	},
	Lumi: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 0.36,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.26,
			ResonanceLiberationDMGBonus: 0.3
		}
	},
	Lupa: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.25,
			BasicAttackDMGBonus: 0.05,
			HeavyAttackDMGBonus: 0.07,
			ResonanceSkillDMGBonus: 0.13,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Mortefi: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.08,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.18,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Phoebe: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.13,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0.14
		}
	},
	Phrolova: {},
	Qiuyuan: {},
	Roccia: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.25,
			BasicAttackDMGBonus: 0.06,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0.15,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Rover: {},
	Sanhua: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0.27,
			ResonanceLiberationDMGBonus: 0.28
		}
	},
	Taoqi: {
		weights: {
			HP: 0,
			ATK: 0,
			DEF: 1,
			'HP%': 0,
			'ATK%': 0,
			'DEF%': 1,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 0.43,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.1,
			ResonanceLiberationDMGBonus: 0.37
		}
	},
	'The Shorekeeper': {
		weights: {
			HP: 1,
			ATK: 0,
			DEF: 0,
			'HP%': 1,
			'ATK%': 0,
			'DEF%': 0,
			CritRate: 0,
			CritDMG: 1,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 0.09,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.03,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Verina: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 1,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 1,
			CritRate: 0,
			CritDMG: 0,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0
		}
	},
	'Xiangli Yao': {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.09,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.17,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Yangyang: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0,
			BasicAttackDMGBonus: 0.32,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0.14,
			ResonanceLiberationDMGBonus: 1
		}
	},
	Yinlin: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.08,
			HeavyAttackDMGBonus: 0.09,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 0.21
		}
	},
	Youhu: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 1,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 1,
			CritRate: 0,
			CritDMG: 0,
			EnergyRegen: 1,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 0,
			ResonanceLiberationDMGBonus: 0
		}
	},
	Yuanwu: {
		weights: {
			HP: 0,
			ATK: 0,
			DEF: 1,
			'HP%': 0,
			'ATK%': 0,
			'DEF%': 1,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0,
			HeavyAttackDMGBonus: 0,
			ResonanceSkillDMGBonus: 1,
			ResonanceLiberationDMGBonus: 0.4
		}
	},
	Zani: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 0.02,
			HeavyAttackDMGBonus: 1,
			ResonanceSkillDMGBonus: 0.06,
			ResonanceLiberationDMGBonus: 0.2
		}
	},
	Zhezhi: {
		weights: {
			HP: 0,
			ATK: 1,
			DEF: 0,
			'HP%': 0,
			'ATK%': 1,
			'DEF%': 0,
			CritRate: 1,
			CritDMG: 1,
			EnergyRegen: 0.2,
			BasicAttackDMGBonus: 1,
			HeavyAttackDMGBonus: 0.06,
			ResonanceSkillDMGBonus: 0.07,
			ResonanceLiberationDMGBonus: 0
		}
	}
}

document.getElementById('imageInput').addEventListener('change', async function (e) {
	// Upload label
	var label = document.querySelector('label[for="imageInput"]')
	// File
	const file = e.target.files[0]
	if (!file) return
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

	// Validate image
	if (img.width != 1920 || img.height != 1080 || file.name.split('.').pop().toLowerCase() != 'jpeg') {
		label.setAttribute('data-error', 'Error: Unsupported file. Please upload the original 1920x1080 JPEG file.')
		return
	}

	// Hide upload
	label.style.display = 'none'
	label.removeAttribute('data-error')

	// Container Elements
	var container = document.querySelectorAll('.gear')
	var showcase = document.querySelector('.showcase')
	var controls = document.querySelector('.controls')
	var info = document.querySelector('.info-weighted')
	var bar = document.querySelector('.score-bar')
	var currentContainer = 0
	var total_rv = 0
	var total_cv = 0
	var total_wv = 0
	for (let echo in regions) {
		var rv = 0
		var cv = 0
		var wv = 0
		for (let i = 0; i < regions[echo].length; i++) {
			// Setup
			const { left, top, width, height } = regions[echo][i]

			// OCR on the cropped region
			var {
				data: { text }
			} = await worker.recognize(img, {
				rectangle: { top: top, left: left, width: width, height: height }
			})

			// Detect Char
			if (echo == 'name') {
				// Scan errors
				text = text.replace('Zanj', 'Zani')

				var match = Object.keys(chars).find((key) => text.toLowerCase().includes(key.toLowerCase()))
				if (match) {
					document.querySelector('.title').textContent = match + "'s Echoes"
					document.querySelector('.backdrop').style.backgroundImage = `url("./media/img/backdrop/${match.replace(' ', '')}.webp")`
				}
				continue
			}

			// Cleanup
			var output =
				text
					.replace('al', 'HP')
					.replace('Ronus', 'Bonus')
					.replace('\n', '')
					.replace(/(\d+(\.\d+)?%?)/, '')
					.replace(/\s+/, ' ')
					.replace(' /', '')
					.replace(' :', '')
					.trim() +
				' ' +
				(text.match(/(\d+(\.\d+)?%?)/) || [''])[0]

			// Empty stats
			var req = ['Crit', 'DMG', 'HP', 'DEF', 'ATK', 'Energy']
			var found = req.some((req) => output.includes(req))
			if (text == '' || text.length < 4 || !found) {
				output = 'None 0'
			}

			console.log(`[Log] Tesseract: ${output}`)

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

			// Label formats
			var calcLabel = label.replaceAll(' ', '').replaceAll('.', '')
			var calcAmount = amount.replace('%', '')

			// Percentage
			var perc = ((calcAmount / range[calcLabel].max) * 100).toFixed(2)

			// Weighted values
			if (calcLabel != 'None') {
				// Roll values
				rv += parseFloat(perc)

				// Crit value
				if (calcLabel.includes('Crit')) {
					cv += parseFloat(perc)
				}

				// Weighted values
				if (chars[match].weights) {
					wv += chars[match].weights[calcLabel] * perc
				}
			}

			// Add element
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">${label}</span>
					<span class="value">${amount}</span>`
			if (calcLabel == 'Empty') {
				// Empty Stat
				el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
			} else {
				if (chars[match].weights && chars[match].weights[calcLabel] == '1') {
					// Weighted
					el.style.background = `
					url("./media/img/bg-gradient.png") center/100% 100%,
					linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%)`
					el.style.border = 'var(--border-main)'
				} else {
					// Normal
					el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
					el.setAttribute('secondary-stat', '')
				}
			}
			// Crit styling class
			if (calcLabel.includes('Crit')) {
				el.setAttribute('crit', '')
			} else {
				el.setAttribute('no-crit', '')
			}
			container[currentContainer].append(el)
		}

		if (echo != 'name') {
			// HR
			el = document.createElement('hr')
			container[currentContainer].append(el)

			// Crit Value
			var cv_perc = (cv / 200) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Crit</span>
					<span class="value">${cv.toFixed(1)}<span class="sub-value">/200</span></span>`
			el.style.background = 'linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ' + cv_perc + '%, transparent ' + cv_perc + '%), rgba(32, 34, 37, 0.52)'
			container[currentContainer].append(el)

			// Roll Value
			var rv_perc = (rv / 500) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Rolls</span>
					<span class="value">${rv.toFixed(1)}<span class="sub-value">/500</span></span>`
			el.style.background = 'linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ' + rv_perc + '%, transparent ' + rv_perc + '%), rgba(32, 34, 37, 0.52)'
			container[currentContainer].append(el)

			// Weighted Value (Perfection)
			var wv_perc = (wv / 500) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Perfection: ${ranking(wv_perc)}</span>
					<span class="value">${wv.toFixed(1)}<span class="sub-value">/500</span></span>`
			el.style.background = 'linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ' + wv_perc + '%, transparent ' + wv_perc + '%), rgba(32, 34, 37, 0.52)'
			container[currentContainer].append(el)

			// Totals
			total_rv += rv
			total_cv += cv
			total_wv += wv

			// Toogle container opacity
			container[currentContainer].style.opacity = '1'

			currentContainer++
		}
	}
	var details = document.querySelector('.details')

	// Crit Score
	var cv_perc = (total_cv / 1000) * 100
	var el = document.createElement('div')
	el.classList = 'gear-score'
	el.innerHTML = `Crit: ${cv_perc.toFixed(2)}%<span class="sub-value">${total_cv.toFixed(2)}/1000</span>`
	el.addEventListener('mouseover', () => {
		showcase.setAttribute('crit-filter', '')
	})
	el.addEventListener('mouseout', () => {
		showcase.removeAttribute('crit-filter')
	})
	details.append(el)

	// Roll Score
	var rv_perc = (total_rv / 2500) * 100
	var el = document.createElement('div')
	el.classList = 'gear-score'
	el.innerHTML = `Rolls: ${rv_perc.toFixed(2)}%<span class="sub-value">${total_rv.toFixed(2)}/2500</span>`
	details.append(el)

	// Weighted Stats (Perfection)
	if (chars[match].weights) {
		var weighted_perc = ((total_wv / 2500) * 100).toFixed(2)

		var el = document.createElement('div')
		el.classList = 'gear-score'
		el.innerHTML = `Perfection: ${ranking(weighted_perc)}<span class="sub-value">${weighted_perc}%</span><span class="sub-value">${total_wv.toFixed(2)}/${2500}</span>`
		el.addEventListener('mouseover', () => {
			showcase.setAttribute('secondary-filter', '')
		})
		el.addEventListener('mouseout', () => {
			showcase.removeAttribute('secondary-filter')
		})
		details.append(el)
	}

	// Info
	var el = document.createElement('button')
	el.textContent = 'Info'
	el.className = 'info-button'
	el.addEventListener('click', function () {
		document.querySelector('.info-page').style.opacity = '1'
		document.querySelector('.info-page').style.pointerEvents = 'all'
	})
	controls.append(el)
	details.style.opacity = '1'

	window.addEventListener('mouseup', function (event) {
		var info = document.querySelector('.info-page')
		if (info && !info.contains(event.target)) {
			info.style.opacity = '0'
			info.style.pointerEvents = 'none'
		}
	})

	// Weighted Stats Display
	var statMap = {
		HP: 'HP',
		ATK: 'ATK',
		DEF: 'DEF',
		'HP%': 'HP%',
		'ATK%': 'ATK%',
		'DEF%': 'DEF%',
		CritRate: 'Crit. Rate',
		CritDMG: 'Crit. DMG',
		EnergyRegen: 'Energy Regen',
		BasicAttackDMGBonus: 'Basic ATK DMG Bonus',
		HeavyAttackDMGBonus: 'Heavy ATK DMG Bonus',
		ResonanceSkillDMGBonus: 'Resonance Skill DMG Bonus',
		ResonanceLiberationDMGBonus: 'Resonance Liberation DMG Bonus'
	}

	for (var stat in chars[match].weights) {
		// Create Bars
		var perc = ((chars[match].weights[stat] / 1) * 100).toFixed(2)
		var el = document.createElement('div')
		el.classList = 'gear-bar'
		el.innerHTML = `
					<span class="title">${statMap[stat]}</span>
					<span class="value">${chars[match].weights[stat]}<span class="sub-value">/1</span></span>`
		if (chars[match].weights[stat] != 0) {
			el.style.background = 'linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ' + perc + '%, transparent ' + perc + '%), rgba(32, 34, 37, 0.52)'
		} else {
			el.style.background = 'rgba(32, 34, 37, 0.52)'
		}
		info.append(el)
	}

	// Reset
	var el = document.createElement('button')
	el.textContent = 'Reset'
	el.className = 'reset-button'
	el.addEventListener('click', function () {
		location.reload()
	})
	controls.append(el)
})

function ranking(perc) {
	switch (true) {
		case perc >= 75:
			return 'Sentinel'
		case perc >= 70:
			return 'WTF+'
		case perc >= 65:
			return 'WTF'
		case perc >= 60.5:
			return 'SSS+'
		case perc >= 56.5:
			return 'SSS'
		case perc >= 53:
			return 'SS+'
		case perc >= 50:
			return 'SS'
		case perc >= 47.5:
			return 'S+'
		case perc >= 45:
			return 'S'
		case perc >= 42.5:
			return 'A+'
		case perc >= 40:
			return 'A'
		case perc >= 37.5:
			return 'B+'
		case perc >= 35:
			return 'B'
		case perc >= 32.5:
			return 'C+'
		case perc >= 30:
			return 'C'
		case perc >= 27.5:
			return 'D+'
		case perc >= 25:
			return 'D'
		case perc >= 22.5:
			return 'F+'
		default:
			return 'F'
	}
}

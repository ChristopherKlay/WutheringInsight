// Imports
import { name, regions } from './import/scan.js'
import { range, statMap } from './import/stats.js'
import { chars } from './import/chars.js'

// Element Handles
var echoContainer = document.querySelector('.echo-fields')
var showcase = document.querySelector('.showcase')
var controls = document.querySelector('.controls')
var info = document.querySelector('.info-weighted')
var echoInput = document.querySelector('.echo-input')
var filters = document.querySelector('.filters')

// Add control functionality
// -> Filter
document.querySelectorAll('.filter-button').forEach((el) => {
	el.addEventListener('click', () => changeFilter(el))
})

// -> Export
document.querySelector('.export-button').addEventListener('click', exportImage)

// Upload Showcase
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
		tessedit_pageseg_mode: 7,
		tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%,. '
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

	// Hide base controls
	document.querySelector('.base-controls').style.display = 'none'

	// Setup loop variables
	var cv_total = 0
	var wv_total = 0
	var titleCount = 1

	// Recognize character
	var {
		data: { text }
	} = await worker.recognize(img, {
		rectangle: { top: name.top, left: name.left, width: name.width, height: name.height }
	})

	// Character scan errors
	// -> Ending 'j' instead of 'i'
	var split = text.split(' ')
	if (split[0].slice(-1) == 'j') {
		split[0] = split[0].slice(0, -1) + 'i'
		text = split.join(' ')
	}

	// Rover Variants
	if (text.includes('Rover')) {
		// Create canvas element for extraction
		const canvas = document.createElement('canvas')
		canvas.width = img.width
		canvas.height = img.height

		// Draw image
		const ctx = canvas.getContext('2d')
		ctx.drawImage(img, 0, 0)

		// Select variant by color distance
		/*
		 * Aero: #98D1BE
		 * Havoc: #E946A3
		 * Spectro: #C4B260
		 */
		var pixel = ctx.getImageData(31, 64, 1, 1).data
		var palette = ['#98D1BE', '#E946A3', '#C4B260']
		var variant = closestColor(rgbToHex(pixel[0], pixel[1], pixel[2]), palette)

		switch (variant) {
			case '#98D1BE':
				text = 'Rover (Aero)'
				break
			case '#E946A3':
				text = 'Rover (Havoc)'
				break
			case '#C4B260':
				text = 'Rover (Spectro)'
		}
	}

	// Character-specific setup
	var match = Object.keys(chars).find((key) => text.toLowerCase().includes(key.toLowerCase()))
	if (match) {
		document.querySelector('.title').textContent = match + "'s Echoes"
		if (match.includes('Rover')) {
			document.querySelector('.splash').style.backgroundImage = `url("./media/img/backdrop/Rover.webp")`
		} else {
			document.querySelector('.splash').style.backgroundImage = `url("./media/img/backdrop/${match.replace(' ', '')}.webp")`
		}
	}

	// Max Weight Calculation
	var weightMaxPerc =
		Object.values(chars[match].weights)
			.sort((a, b) => b - a)
			.slice(0, 5)
			.reduce((acc, val) => acc + val, 0) * 100
	var critMaxPerc = (chars[match].weights['CritRate'] + chars[match].weights['CritDMG']) * 100

	for (let echo in regions) {
		var cv_echo = 0
		var wv_echo = 0
		var echoStats = {}

		// Create echo
		var echoSlot = document.createElement('div')
		echoSlot.className = 'echo'
		echoSlot.innerHTML = `
			<div class="echo-title">Echo #${titleCount}</div>
		`
		echoContainer.append(echoSlot)

		for (let i = 0; i < regions[echo].length; i++) {
			// Setup
			const { left, top, width, height } = regions[echo][i]

			// OCR on the cropped region
			var {
				data: { text }
			} = await worker.recognize(img, {
				rectangle: { top: top, left: left, width: width, height: height }
			})

			// Cleanup
			// -> OCR Replacements
			var output =
				text
					.replace('al', 'HP')
					.replace('Ronus', 'Bonus')
					.replace('\n', '')
					.replace(/(\d+(\.\d+)?%?)/, '')
					.replace(/\s+/, ' ')
					.trim() +
				' ' +
				(text.match(/(\d+(\.\d+)?%?)/) || [''])[0]

			// -> Remove faulty scan elements
			output = output
				.split(' ')
				.filter((element) => element.length > 1)
				.join(' ')

			// Empty stats
			var req = ['Crit', 'DMG', 'HP', 'DEF', 'ATK', 'Energy']
			var found = req.some((req) => output.includes(req))
			if (text == '' || text.length < 4 || !found) {
				output = 'None 0'
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

			// Label formats
			var calcLabel = label.replaceAll(' ', '').replaceAll('.', '')
			var calcAmount = amount.replace('%', '')

			// Tier Check
			var tier = getTier(calcLabel, calcAmount)

			// Percentage
			var perc = (calcAmount / range[calcLabel]['8']) * 100

			// Weighted values
			if (calcLabel != 'None') {
				// Crit value
				if (calcLabel.includes('Crit')) {
					cv_echo += chars[match].weights[calcLabel] * perc
				}

				// Weighted values
				if (chars[match].weights) {
					wv_echo += chars[match].weights[calcLabel] * perc
				}
			}

			// Replaceability
			echoStats[calcLabel] = calcAmount

			// Add element
			var el = document.createElement('div')
			el.classList = 'echo-bar'

			// Add icon
			var icon = document.createElement('img')
			icon.className = 'icon'
			icon.src = `./media/img/stats/${assignIcon(calcLabel)}.webp`
			el.append(icon)

			// Add label
			var title = document.createElement('span')
			title.textContent = label
			title.className = 'title'
			el.append(title)

			var value = document.createElement('span')
			value.textContent = amount
			value.className = 'value'
			el.append(value)

			// Add segments
			var seg = document.createElement('div')
			seg.className = 'segments'
			for (var s = 1; s < 9; s++) {
				var box = document.createElement('div')
				if (tier >= s) {
					box.setAttribute('active', '')
				}
				seg.append(box)
			}
			el.append(seg)

			// Add attributes
			el.querySelector('.value').setAttribute('tier', tier)
			el.setAttribute('data-weight', chars[match].weights[calcLabel])

			if (calcLabel.includes('Crit')) {
				el.setAttribute('crit', 'true')
			} else {
				el.setAttribute('crit', 'false')
			}
			echoSlot.append(el)
		}

		if (echo != 'name') {
			// HR
			el = document.createElement('hr')
			echoSlot.append(el)

			// Crit Value
			if (critMaxPerc > 0) {
				var perc = (cv_echo / critMaxPerc) * 100
				var el = document.createElement('div')
				el.classList = 'echo-bar'
				el.innerHTML = `
					<span class="title">Crit</span>
					<span class="value">${perc.toFixed(2)}%</span>`
				el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
				echoSlot.append(el)
			}

			// Weighted Value
			if (chars[match].weights) {
				var perc = (wv_echo / weightMaxPerc) * 100
				var el = document.createElement('div')
				el.classList = 'echo-bar'
				el.innerHTML = `
					<span class="title">Weighted</span>
					<span class="value">${perc.toFixed(2)}%</span>`
				el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
				echoSlot.append(el)
			}

			// Value
			echoSlot.querySelector('.echo-title').setAttribute('replace', calculateValue(echoStats, match, `Echo #${titleCount}`).toFixed(2))

			// Totals
			cv_total += cv_echo
			wv_total += wv_echo

			// Toogle container opacity
			echoSlot.style.opacity = '1'

			// Increase title count
			titleCount++
		}
	}
	var ratings = document.querySelector('.ratings')

	// Crit Score
	if (critMaxPerc > 0) {
		var cv_perc = (cv_total / (critMaxPerc * 5)) * 100
		var el = document.createElement('div')
		el.classList = 'echo-score'
		el.innerHTML = `Crit: ${getRank(cv_perc)}<span class="sub-value">${cv_perc.toFixed(2)}%</span>`
		ratings.append(el)
	}

	// Weighted Stats
	if (chars[match].weights) {
		var wv_perc = (wv_total / (weightMaxPerc * 5)) * 100
		var el = document.createElement('div')
		el.classList = 'echo-score'
		el.innerHTML = `Weighted: ${getRank(wv_perc)}<span class="sub-value">${wv_perc.toFixed(2)}%</span>`
		ratings.append(el)
	}

	// Info Page - Weight Overview
	for (var stat in chars[match].weights) {
		// Create Bars
		var perc = ((chars[match].weights[stat] / 2.2) * 100).toFixed(2)
		var el = document.createElement('div')
		el.classList = 'echo-bar'
		el.innerHTML = `
					<span class="title">${statMap[stat]}</span>
					<span class="value">${chars[match].weights[stat]}</span>`
		if (chars[match].weights[stat] != 0) {
			el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
		} else {
			el.style.background = 'rgba(32, 34, 37, 0.52)'
		}
		info.append(el)
	}

	// Info
	var el = document.createElement('button')
	el.textContent = 'Info'
	el.className = 'info-button'
	el.addEventListener('click', function () {
		document.querySelector('.info-page').style.opacity = '1'
		document.querySelector('.info-page').style.pointerEvents = 'all'
	})
	controls.prepend(el)

	window.addEventListener('mouseup', function (event) {
		var info = document.querySelector('.info-page')
		if (info && !info.contains(event.target)) {
			info.style.opacity = '0'
			info.style.pointerEvents = 'none'
		}
	})

	// Enable controls
	controls.classList.toggle('hidden')
	ratings.classList.toggle('hidden')
	filters.classList.toggle('hidden')
})

// Manual Input
document.querySelector('.manualInput').addEventListener('click', function () {
	// Hide base controls
	document.querySelector('.base-controls').style.display = 'none'

	// Setup echo
	var echoSlot = document.createElement('div')
	echoSlot.className = 'echo custom'
	echoSlot.innerHTML = `
		<div class="echo-title">Custom Echo</div>
	`

	// Input Elements
	for (let i = 0; i < 5; i++) {
		// Create row
		var row = document.createElement('div')
		row.className = 'row'

		// Create stat options
		var selectContainer = document.createElement('div')
		selectContainer.className = 'selection-container'
		selectContainer.setAttribute('data-weight', 0)
		var select = document.createElement('select')
		select.setAttribute('stat', '')
		for (var key in statMap) {
			const option = document.createElement('option')
			option.value = key
			option.textContent = statMap[key]
			select.appendChild(option)
		}
		select.addEventListener('change', calcCustomEcho)
		selectContainer.appendChild(select)

		// Add segments
		var seg = document.createElement('div')
		seg.className = 'segments'
		for (var s = 1; s < 9; s++) {
			var box = document.createElement('div')
			box.setAttribute('tier', s)
			seg.append(box)
		}
		selectContainer.append(seg)
		row.append(selectContainer)

		// Create stat ranges
		var select = document.createElement('select')
		select.setAttribute('value', '')
		const option = document.createElement('option')
		select.appendChild(option)
		select.addEventListener('change', calcCustomEcho)
		row.appendChild(select)

		echoSlot.appendChild(row)
	}

	// Character Select
	var select = document.createElement('select')
	select.setAttribute('char', '')
	for (var key in chars) {
		const option = document.createElement('option')
		option.value = key
		option.textContent = key
		select.appendChild(option)
	}
	select.addEventListener('change', calcCustomEcho)
	echoSlot.append(select)

	// Divider element
	var el = document.createElement('hr')
	echoSlot.append(el)

	// Crit Value
	var el = document.createElement('div')
	el.classList = 'echo-bar'
	el.innerHTML = `
					<span class="title">Crit</span>
					<span class="value">0%</span>`
	el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) 0%, rgba(32, 34, 37, 0.52) 0%`
	echoSlot.append(el)

	// Weighted Value
	var el = document.createElement('div')
	el.classList = 'echo-bar'
	el.innerHTML = `
					<span class="title">Weighted: Unranked</span>
					<span class="value">0%</span>`
	el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) 0%, rgba(32, 34, 37, 0.52) 0%`
	echoSlot.append(el)

	echoContainer.append(echoSlot)
	echoSlot.style.opacity = '1'

	// Enable controls
	// Enable ratings + filters
	controls.classList.toggle('hidden')
	filters.classList.toggle('hidden')
})

function calcCustomEcho() {
	var char = echoContainer.querySelector('select[char]').value
	var stats = echoContainer.querySelectorAll('select[stat]')
	var values = echoContainer.querySelectorAll('select[value]')
	var ratings = echoContainer.querySelectorAll('.echo-bar')
	var segments = echoContainer.querySelectorAll('.segments')
	var showcase = document.querySelector('.showcase')
	var cv_echo = 0
	var wv_echo = 0
	var echoStats = {}
	var currentSelections = []

	// Set Max
	var weightMaxPerc =
		Object.values(chars[char].weights)
			.sort((a, b) => b - a)
			.slice(0, 5)
			.reduce((acc, val) => acc + val, 0) * 100
	var critMaxPerc = (chars[char].weights['CritRate'] + chars[char].weights['CritDMG']) * 100

	// Gather all selected values
	const selectedValues = Array.from(stats).map((select) => select.value)

	// Loop through all select boxes
	stats.forEach((select, idx) => {
		Array.from(select.options).forEach((option) => {
			// If this option is selected in any other select box, disable it
			option.disabled = selectedValues.includes(option.value) && select.value !== option.value && option.value != 'None'
		})
	})

	// Update select/sliders
	for (var i = 0; i < stats.length; i++) {
		// Reset on "None"
		if (stats[i].value == 'None') {
			// Reset styles
			values[i].value = 0

			// Reset attributes
			stats[i].parentElement.removeAttribute('data-weight')
			stats[i].parentElement.removeAttribute('crit')
		}

		// Set range options
		if (values[i].getAttribute('type') != stats[i].value) {
			values[i].options.length = 0
			values[i].setAttribute('type', stats[i].value)
			for (var key in range[stats[i].value]) {
				var option = document.createElement('option')
				option.value = range[stats[i].value][key]
				option.textContent = range[stats[i].value][key]
				values[i].append(option)
			}
		}

		// Add stats
		echoStats[stats[i].value] = values[i].value

		// Calculate values
		// -> Crit
		if (stats[i].value.includes('Crit')) {
			cv_echo += chars[char].weights[stats[i].value] * ((values[i].value / range[stats[i].value][8]) * 100)
			stats[i].parentElement.setAttribute('crit', 'true')
		} else {
			stats[i].parentElement.setAttribute('crit', 'false')
		}
		// -> WV
		if (chars[char].weights && stats[i].value != 'None') {
			wv_echo += chars[char].weights[stats[i].value] * ((values[i].value / range[stats[i].value][8]) * 100)
			stats[i].parentElement.setAttribute('data-weight', chars[char].weights[stats[i].value])
		}

		// Tier to segments
		var tier = getTier(stats[i].value, values[i].value)
		values[i].setAttribute('tier', tier)
		var boxes = segments[i].querySelectorAll('[tier]')
		boxes.forEach((el) => {
			if (el.getAttribute('tier') <= tier) {
				el.setAttribute('active', '')
			} else {
				el.removeAttribute('active')
			}
		})
	}

	// Echo Value
	showcase.querySelector('.echo-title').setAttribute('replace', calculateValue(echoStats, char, 'Custom').toFixed(2))

	// Crit
	var cv_perc = (cv_echo / critMaxPerc) * 100
	ratings[0].style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${cv_perc}%, rgba(32, 34, 37, 0.52) ${cv_perc}%`
	ratings[0].querySelector('.value').innerHTML = `${cv_perc.toFixed(2)}%`

	if (critMaxPerc > 0) {
		ratings[0].style.display = 'flex'
	} else {
		ratings[0].style.display = 'none'
	}

	// Weighted
	if (chars[char].weights) {
		var wv_perc = (wv_echo / weightMaxPerc) * 100
		ratings[1].style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${wv_perc}%, rgba(32, 34, 37, 0.52) ${wv_perc}%`
		ratings[1].querySelector('.title').textContent = `Weighted: ${getRank(wv_perc)}`
		ratings[1].querySelector('.value').innerHTML = `${wv_perc.toFixed(2)}%`
		ratings[1].style.display = 'flex'
	} else {
		ratings[1].style.display = 'none'
	}
}

function getTier(stat, amount) {
	let tier = 0
	if (amount == 0) {
		return 0
	}
	for (const [key, value] of Object.entries(range[stat])) {
		if (amount >= value) {
			tier = Math.max(tier, Number(key))
		}
	}
	return tier
}

function changeFilter(el) {
	var showcase = document.querySelector('.showcase')
	var attr = el.getAttribute('data-filter')

	if (attr == 'weight' || attr == 'crit') {
		// Find the other filter button (crit if weight clicked, and vice versa)
		var otherFilter = attr == 'weight' ? 'crit' : 'weight'

		// If clicked element is already active, deactivate it and clear filter
		if (el.classList.contains('active')) {
			showcase.setAttribute('filter', 'none')
			el.classList.remove('active')
		} else {
			// Deactivate the other button if active
			var otherEl = document.querySelector(`[data-filter="${otherFilter}"]`)
			if (otherEl && otherEl.classList.contains('active')) {
				otherEl.classList.remove('active')
			}
			// Activate clicked button and set filter accordingly
			el.classList.add('active')
			showcase.setAttribute('filter', attr)
		}
	} else if (attr == 'color') {
		if (el.classList.contains('active')) {
			showcase.setAttribute('tiers', 'hide')
			el.classList.remove('active')
		} else {
			showcase.setAttribute('tiers', 'show')
			el.classList.add('active')
		}
	} else if (attr == 'replace') {
		if (el.classList.contains('active')) {
			showcase.setAttribute('replace', 'hide')
			el.classList.remove('active')
		} else {
			showcase.setAttribute('replace', 'show')
			el.classList.add('active')
		}
	}
}

function exportImage() {
	const node = document.body

	// Export styles
	document.body.setAttribute('data-export', '')
	document.querySelector('.splash').setAttribute('data-export', '')

	htmlToImage
		.toPng(node, {
			pixelRatio: 1,
			filter: function (node) {
				// Exclude elements by data-export-exclude attribute
				if (node.hasAttribute && node.hasAttribute('data-export-exclude')) {
					return false
				}

				// Exclude script tags the Ko-fi widget
				if (node.tagName == 'SCRIPT' || (node.classList && node.classList.contains('kofi-widget-container'))) {
					return false
				}

				return true
			}
		})
		.then((dataUrl) => {
			// Revert styles
			document.body.removeAttribute('data-export')
			document.querySelector('.splash').removeAttribute('data-export')

			// Process result
			const link = document.createElement('a')
			link.download = 'WutheringInsight.png'
			link.href = dataUrl
			link.click()
		})
		.catch((err) => {
			// Revert styles
			document.body.removeAttribute('data-export')
			document.querySelector('.splash').removeAttribute('data-export')

			console.error('oops, something went wrong!', err)
		})
}

function calculateValue(values, char, id) {
	var accumProbBase = [7.33, 21.98, 41.52, 65.03, 80.66, 91.08, 97.03, 100]
	var accumProbAlt = [18.52, 18.52, 62.97, 62.97, 62.97, 89.35, 89.35, 100]
	let result = 0

	// Start Group - Value Valc
	console.groupCollapsed(`[Debug] Value Calculation (${id})`)

	for (let v in values) {
		// Get Tier
		for (let [key, val] of Object.entries(range[v])) {
			if (val == values[v]) {
				var tier = key
				continue
			}
		}

		// Skip Empty/None
		if (values[v] == 0) {
			continue
		}

		// Get Perc
		var perc = (values[v] / range[v]['8']) * 100

		// Modifiers
		var probFactor = 0.1
		var modWeight = chars[char].weights[v]
		if (v == 'DEF' || v == 'ATK') {
			var modProb = accumProbAlt[tier - 1] * (probFactor / 100)
		} else {
			var modProb = accumProbBase[tier - 1] * (probFactor / 100)
		}

		// Update result
		var increase = parseFloat((perc + perc * modProb) * modWeight)
		result += increase

		// Debugging - Group: Value Calc
		console.table({
			Stat: v,
			Value: values[v],
			Percentage: perc,
			Tier: tier,
			Probability: modProb,
			Weight: modWeight,
			Increase: increase
		})
	}

	// End Group - Value Calc
	console.groupEnd()

	return result
}

function assignIcon(stat) {
	var icons = {
		None: '#',
		HP: 'hp',
		ATK: 'atk',
		DEF: 'def',
		'ATK%': 'atk',
		'HP%': 'hp',
		'DEF%': 'def',
		CritRate: 'crit_r',
		CritDMG: 'crit_d',
		EnergyRegen: 'energy',
		BasicAttackDMGBonus: 'dmg_basic',
		HeavyAttackDMGBonus: 'dmg_heavy',
		ResonanceSkillDMGBonus: 'dmg_res',
		ResonanceLiberationDMGBonus: 'dmg_lib'
	}
	return icons[stat]
}

function getRank(perc) {
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

function hexToRGB(hex) {
	hex = hex.replace(/^#/, '')
	if (hex.length === 3)
		hex = hex
			.split('')
			.map((x) => x + x)
			.join('')
	const num = parseInt(hex, 16)
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHex(r, g, b) {
	// Ensure each value is between 0 and 255
	const clamp = (val) => Math.max(0, Math.min(255, val))
	r = clamp(r)
	g = clamp(g)
	b = clamp(b)

	// Convert each channel to a 2-digit hex string
	const toHex = (val) => val.toString(16).padStart(2, '0')

	return '#' + toHex(r) + toHex(g) + toHex(b)
}

function closestColor(targetColor, colorArray) {
	let closestDistance = Infinity
	let closestColor = null
	const [r1, g1, b1] = hexToRGB(targetColor)
	colorArray.forEach((color) => {
		const [r2, g2, b2] = hexToRGB(color)
		const distance = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
		if (distance < closestDistance) {
			closestDistance = distance
			closestColor = color
		}
	})
	return closestColor
}

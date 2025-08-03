// Imports
import { name, regions } from './import/scan.js'
import { range, statMap } from './import/stats.js'
import { chars } from './import/chars.js'

// Element Handles
var echoContainer = document.querySelector('.gear-fields')
var showcase = document.querySelector('.showcase')
var controls = document.querySelector('.controls')
var info = document.querySelector('.info-weighted')
var gearInput = document.querySelector('.gear-input')

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
	var total_cv = 0
	var total_wv = 0
	var titleCount = 1

	// Recognize character
	var {
		data: { text }
	} = await worker.recognize(img, {
		rectangle: { top: name.top, left: name.left, width: name.width, height: name.height }
	})

	// Character scan errors
	text = text.replace('Zanj', 'Zani')

	// CHaracter-specific setup
	var match = Object.keys(chars).find((key) => text.toLowerCase().includes(key.toLowerCase()))
	if (match) {
		document.querySelector('.title').textContent = match + "'s Echoes"
		document.querySelector('.backdrop').style.backgroundImage = `url("./media/img/backdrop/${match.replace(' ', '')}.webp")`
	}

	for (let echo in regions) {
		var tv = 0
		var cv = 0
		var wv = 0

		// Create echo
		var echoSlot = document.createElement('div')
		echoSlot.className = 'gear'
		echoSlot.innerHTML = `
			<div class="gear-title">Echo #${titleCount}</div>
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
			// -> Common replacements
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

			// Tier Check
			var tier = getTier(calcLabel, calcAmount)

			// Percentage
			var perc = (calcAmount / range[calcLabel]['8']) * 100

			// Weighted values
			if (calcLabel != 'None') {
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
			el.setAttribute('tier', tier)
			if (chars[match].weights[calcLabel] == 1) {
				el.setAttribute('weighted', 'true')
			} else {
				el.setAttribute('weighted', 'false')
			}
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
			var perc = (cv / 200) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Crit</span>
					<span class="value">${cv.toFixed(2)}<span class="sub-value">/200</span></span>`
			el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
			echoSlot.append(el)

			// Weighted Value
			if (chars[match].weights) {
				var perc = (wv / 500) * 100
				var el = document.createElement('div')
				el.classList = 'gear-bar'
				el.innerHTML = `
					<span class="title">Weighted: ${getRank(perc)}</span>
					<span class="value">${wv.toFixed(1)}<span class="sub-value">/500</span></span>`
				el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
				echoSlot.append(el)
			}

			// Totals
			total_cv += cv
			total_wv += wv

			// Toogle container opacity
			echoSlot.style.opacity = '1'

			// Increase title count
			titleCount++
		}
	}
	var details = document.querySelector('.details')

	// Crit Score
	var cv_perc = (total_cv / 1000) * 100
	var el = document.createElement('div')
	el.classList = 'gear-score'
	el.innerHTML = `Crit: ${cv_perc.toFixed(2)}%<span class="sub-value">${total_cv.toFixed(2)}/1000</span>`
	el.addEventListener('mouseover', () => {
		showcase.setAttribute('filter', 'crit')
	})
	el.addEventListener('mouseout', () => {
		showcase.setAttribute('filter', '')
	})
	details.append(el)

	// Weighted Stats
	if (chars[match].weights) {
		var weighted_perc = (total_wv / 2500) * 100
		var el = document.createElement('div')
		el.classList = 'gear-score'
		el.innerHTML = `Weighted: ${getRank(weighted_perc)}<span class="sub-value">${weighted_perc.toFixed(2)}%</span><span class="sub-value">${total_wv.toFixed(2)}/${2500}</span>`
		el.addEventListener('mouseover', () => {
			showcase.setAttribute('filter', 'weight')
		})
		el.addEventListener('mouseout', () => {
			showcase.setAttribute('filter', '')
		})
		details.append(el)
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
			el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
		} else {
			el.style.background = 'rgba(32, 34, 37, 0.52)'
		}
		info.append(el)
	}

	// Enable details
	details.style.opacity = '1'

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
	controls.style.opacity = '1'
	controls.style.pointerEvents = 'all'
})

// Manual Input
document.querySelector('.manualInput').addEventListener('click', function () {
	// Hide base controls
	document.querySelector('.base-controls').style.display = 'none'

	// Setup echo
	var echoSlot = document.createElement('div')
	echoSlot.className = 'gear custom'
	echoSlot.innerHTML = `
		<div class="gear-title">Custom Echo</div>
	`

	// Input Elements
	for (let i = 0; i < 5; i++) {
		// Create row
		var row = document.createElement('div')
		row.className = 'row'

		// Create stat options
		var selectContainer = document.createElement('div')
		selectContainer.className = 'selection-container'
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
	el.classList = 'gear-bar'
	el.innerHTML = `
					<span class="title">Crit</span>
					<span class="value">0<span class="sub-value">/200</span></span>`
	el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) 0%, rgba(32, 34, 37, 0.52) 0%`
	echoSlot.append(el)

	// Weighted Value
	var el = document.createElement('div')
	el.classList = 'gear-bar'
	el.innerHTML = `
					<span class="title">Weighted: Unranked</span>
					<span class="value">0<span class="sub-value">/500</span></span>`
	el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) 0%, rgba(32, 34, 37, 0.52) 0%`
	echoSlot.append(el)

	echoContainer.append(echoSlot)
	echoSlot.style.opacity = '1'

	// Enable controls
	controls.style.opacity = '1'
	controls.style.pointerEvents = 'all'
})

function calcCustomEcho() {
	var char = echoContainer.querySelector('select[char]').value
	var stats = echoContainer.querySelectorAll('select[stat]')
	var values = echoContainer.querySelectorAll('select[value]')
	var ratings = echoContainer.querySelectorAll('.gear-bar')
	var segments = echoContainer.querySelectorAll('.segments')
	var cv = 0
	var tv = 0
	var wv = 0

	// Update select/sliders
	for (var i = 0; i < stats.length; i++) {
		if (stats[i].value == 'None') {
			// Reset styles
			values[i].value = 0
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

		// Calculate values
		// -> Crit
		if (stats[i].value.includes('Crit')) {
			cv += parseFloat((values[i].value / range[stats[i].value][8]) * 100)
		}
		// -> WV
		if (chars[char].weights && stats[i].value != 'None') {
			wv += chars[char].weights[stats[i].value] * ((values[i].value / range[stats[i].value][8]) * 100)
			if (chars[char].weights[stats[i].value] == 1) {
				stats[i].setAttribute('weighted', 'true')
			}
		} else {
			stats[i].setAttribute('weighted', 'false')
		}
		
		// Tier to segments
		var tier = getTier(stats[i].value, values[i].value)
		var boxes = segments[i].querySelectorAll('[tier]')
		boxes.forEach((el) => {
			if (el.getAttribute('tier') <= tier) {
				el.setAttribute('active', '')
			} else {
				el.removeAttribute('active')
			}
		})
	}

	// Crit
	var cv_perc = (cv / 200) * 100
	ratings[0].style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${cv_perc}%, rgba(32, 34, 37, 0.52) ${cv_perc}%`
	ratings[0].querySelector('.value').innerHTML = `${cv.toFixed(1)}<span class="sub-value">/200</span>`

	// Weighted
	if (chars[char].weights) {
		var wv_perc = (wv / 500) * 100
		ratings[1].style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${wv_perc}%, rgba(32, 34, 37, 0.52) ${wv_perc}%`
		ratings[1].querySelector('.title').textContent = `Weighted: ${getRank(wv_perc)}`
		ratings[1].querySelector('.value').innerHTML = `${wv.toFixed(1)}<span class="sub-value">/500</span>`
		ratings[1].style.display = 'flex'
	} else {
		ratings[1].style.display = 'none'
	}
}

function getTier(stat, amount) {
	var match = 0
	if (amount == 0) {
		return 0
	}
	for (const [key, value] of Object.entries(range[stat])) {
		if (amount >= value) {
			match++
		}
	}
	return match
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

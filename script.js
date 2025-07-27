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
	var total_rv = 0
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
		var rv = 0
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

			// Percentage
			var perc = (calcAmount / range[calcLabel].max) * 100

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

			// Add attributes
			el.setAttribute('min', ((range[calcLabel].min / range[calcLabel].max) * 100).toFixed(2))
			el.setAttribute('cur', perc.toFixed(2))

			// Set styling
			if (calcLabel == 'Empty') {
				// Empty Stat
				el.style.background = createGradient(0)
			} else {
				if (chars[match].weights && chars[match].weights[calcLabel] == 1) {
					// Weighted
					el.style.background = createGradient(perc, 'weighted')
					el.setAttribute('weight', 'true')
				} else {
					// Normal
					el.style.background = createGradient(perc)
					el.setAttribute('weight', 'false')
				}
			}
			// Crit styling class
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
					<span class="value">${cv.toFixed(1)}<span class="sub-value">/200</span></span>`
			el.style.background = createGradient(perc, 'sub')
			echoSlot.append(el)

			// Roll Value
			var perc = (rv / 500) * 100
			var el = document.createElement('div')
			el.classList = 'gear-bar'
			el.innerHTML = `
					<span class="title">Rolls</span>
					<span class="value">${rv.toFixed(1)}<span class="sub-value">/500</span></span>`
			el.style.background = createGradient(perc, 'sub')
			echoSlot.append(el)

			// Weighted Value
			if (chars[match].weights) {
				var perc = (wv / 500) * 100
				var el = document.createElement('div')
				el.classList = 'gear-bar'
				el.innerHTML = `
					<span class="title">Weighted: ${ranking(perc)}</span>
					<span class="value">${wv.toFixed(1)}<span class="sub-value">/500</span></span>`
				el.style.background = createGradient(perc, 'sub')
				echoSlot.append(el)
			}

			// Totals
			total_rv += rv
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

	// Roll Score
	var rv_perc = (total_rv / 2500) * 100
	var el = document.createElement('div')
	el.classList = 'gear-score'
	el.innerHTML = `Rolls: ${rv_perc.toFixed(2)}%<span class="sub-value">${total_rv.toFixed(2)}/2500</span>`
	el.addEventListener('mouseover', () => {
		var bars = document.querySelectorAll('.gear-bar[min][cur]')
		// Generate & set gradients including minimal value
		for (var i = 0; i < bars.length; i++) {
			if (bars[i].getAttribute('weight') == 'true') {
				bars[i].style.background = createGradient(bars[i].getAttribute('cur'), 'weighted', bars[i].getAttribute('min'))
			} else {
				bars[i].style.background = createGradient(bars[i].getAttribute('cur'), false, bars[i].getAttribute('min'))
			}
		}
	})
	el.addEventListener('mouseout', () => {
		showcase.setAttribute('filter', '')
		var bars = document.querySelectorAll('.gear-bar[min][cur]')
		// Generate & set gradients to default
		for (var i = 0; i < bars.length; i++) {
			if (bars[i].getAttribute('weight') == 'true') {
				bars[i].style.background = createGradient(bars[i].getAttribute('cur'), 'weighted')
			} else {
				bars[i].style.background = createGradient(bars[i].getAttribute('cur'))
			}
		}
	})
	details.append(el)

	// Weighted Stats
	if (chars[match].weights) {
		var weighted_perc = ((total_wv / 2500) * 100).toFixed(2)

		var el = document.createElement('div')
		el.classList = 'gear-score'
		el.innerHTML = `Weighted: ${ranking(weighted_perc)}<span class="sub-value">${weighted_perc}%</span><span class="sub-value">${total_wv.toFixed(2)}/${2500}</span>`
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
			el.style.background = createGradient(perc, 'sub')
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

	// Setup input
	for (let i = 0; i < 5; i++) {
		// Create row
		var row = document.createElement('div')
		row.className = 'row'

		// Create dropdown
		var select = document.createElement('select')
		for (var key in statMap) {
			const option = document.createElement('option')
			option.value = key
			option.textContent = statMap[key]
			select.appendChild(option)
		}
		select.addEventListener('change', calcCustomEcho)

		// Create slider with min/max
		var slider = document.createElement('input')
		slider.type = 'range'
		slider.min = 0
		slider.max = 0
		slider.addEventListener('change', calcCustomEcho)

		// Create label
		var label = document.createElement('span')
		label.textContent = '0'

		row.appendChild(select)
		row.appendChild(slider)
		row.appendChild(label)

		echoSlot.appendChild(row)
	}

	// Character Select
	var select = document.createElement('select')
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
	el.style.background = createGradient(0, 'sub')
	echoSlot.append(el)

	// Roll Value
	var el = document.createElement('div')
	el.classList = 'gear-bar'
	el.innerHTML = `
					<span class="title">Rolls</span>
					<span class="value">0<span class="sub-value">/500</span></span>`
	el.style.background = createGradient(0, 'sub')
	echoSlot.append(el)

	// Weighted Value
	var el = document.createElement('div')
	el.classList = 'gear-bar'
	el.innerHTML = `
					<span class="title">Weighted: Unranked</span>
					<span class="value">0<span class="sub-value">/500</span></span>`
	el.style.background = createGradient(0, 'sub')
	echoSlot.append(el)

	echoContainer.append(echoSlot)
	echoSlot.style.opacity = '1'

	// Enable controls
	controls.style.opacity = '1'
	controls.style.pointerEvents = 'all'
})

function calcCustomEcho() {
	var select = echoContainer.querySelectorAll('select')
	var slider = echoContainer.querySelectorAll('input[type="range"]')
	var labels = echoContainer.querySelectorAll('span')
	var ratings = echoContainer.querySelectorAll('.gear-bar')
	var cv = 0
	var rv = 0
	var wv = 0
	var char = select[select.length - 1].value

	// Update select/sliders
	for (var i = 0; i < select.length - 1; i++) {
		if (select[i].value == 'None') {
			// Reset styles
			slider[i].value = 0
			labels[i].textContent = 0
			select[i].style.background = 'transparent'
			select[i].style.border = 'none'
			continue
		}

		// Set limits
		slider[i].min = range[select[i].value].min
		slider[i].max = range[select[i].value].max

		// Reset out of bound
		if (slider[i].value < select[i].min || slider[i].value > select[i].max) {
			slider[i].value = slider[i].min
		}

		// Set steps
		if (slider[i].max > 21) {
			slider[i].step = 5
		} else {
			slider[i].step = 0.1
		}

		// Update label
		labels[i].textContent = slider[i].value

		// Calculate values
		// -> Crit
		if (select[i].value.includes('Crit')) {
			cv += parseFloat((slider[i].value / slider[i].max) * 100)
		}
		// -> RV
		rv += parseFloat((slider[i].value / slider[i].max) * 100)
		// -> WV
		if (chars[char].weights) {
			wv += chars[char].weights[select[i].value] * ((slider[i].value / slider[i].max) * 100)
			if (chars[char].weights[select[i].value] == 1) {
				select[i].style.background = createGradient(((slider[i].value / slider[i].max) * 100).toFixed(2), 'weighted')
				select[i].style.border = 'var(--border-main)'
			} else {
				select[i].style.background = createGradient(((slider[i].value / slider[i].max) * 100).toFixed(2))
				select[i].style.border = 'none'
			}
		}
	}
	// Update ratings
	console.log(`[Log] Crit Value: ${cv} - Roll Value: ${rv} - Weighted Value: ${wv}`)

	// Crit
	var cv_perc = (cv / 200) * 100
	ratings[0].style.background = createGradient(cv_perc, 'sub')
	ratings[0].querySelector('.value').innerHTML = `${cv.toFixed(1)}<span class="sub-value">/200</span>`

	// Rolls
	var rv_perc = (rv / 500) * 100
	ratings[1].style.background = createGradient(rv_perc, 'sub')
	ratings[1].querySelector('.value').innerHTML = `${rv.toFixed(1)}<span class="sub-value">/500</span>`

	// Weighted
	if (chars[char].weights) {
		var wv_perc = (wv / 500) * 100
		ratings[2].style.background = createGradient(wv_perc, 'sub')
		ratings[2].querySelector('.title').textContent = `Weighted: ${ranking(wv_perc)}`
		ratings[2].querySelector('.value').innerHTML = `${wv.toFixed(1)}<span class="sub-value">/500</span>`
		ratings[2].style.display = 'flex'
	} else {
		ratings[2].style.display = 'none'
	}
}

function createGradient(perc, type = false, min = false) {
	// Preset parts
	var overlay_img = `url("./media/img/bg-gradient.png") center/100% 100%`
	var overlay_roll = `linear-gradient(90deg,rgba(0, 0, 0, 0) ${min}%, var(--gradient-roll-highlight) ${min}%, var(--gradient-roll-highlight) ${perc}%, rgba(0, 0, 0, 0) ${perc}%)`
	var main = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
	var sub = `linear-gradient(to right, var(--gradient-sub-start) 0%, var(--gradient-sub-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
	var gradients = []

	// Structure gradient
	// -> Add weighted image overlay
	if (type == 'weighted') {
		gradients.push(overlay_img)
	}

	// Min stat overlay
	if (min && min != perc) {
		gradients.push(overlay_roll)
	}

	// Base color options
	if (type && type == 'sub') {
		gradients.push(sub)
	} else {
		gradients.push(main)
	}

	return gradients.join(', ')
}

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

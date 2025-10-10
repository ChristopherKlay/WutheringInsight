// ─── Initial Setup ─────────────────────────────────────────────────────────────────────────── ✣ ─

// Imports
import { name, regions, icons } from './import/scan.js'
import { range, combatStats } from './import/stats.js'
import { chars } from './import/chars.js'

// Element Handles
var echoContainer = document.querySelector('.echo-fields')
var controls = document.querySelector('.controls')
var info = document.querySelector('.info-weighted')
var filters = document.querySelector('.filters')

// ─── Control Elements ──────────────────────────────────────────────────────────────────────── ✣ ─

// Filters
document.querySelectorAll('.filter-button').forEach((el) => {
	el.addEventListener('click', () => setFilter(el))
})

// Export
document.querySelector('.export-button').addEventListener('click', exportImage)

// Showcase Upload (Automated)
document.getElementById('imageInput').addEventListener('change', uploadShowcase)

// Manual Input (Custom Echo)
document.querySelector('.manualInput').addEventListener('click', createCustomEcho)

// Info Page Modal
document.querySelector('.info-button').addEventListener('click', function () {
	document.querySelector('.info-page').classList.remove('hidden')
})

window.addEventListener('mouseup', function (event) {
	var info = document.querySelector('.info-page')
	if (info && !info.contains(event.target)) {
		info.classList.add('hidden')
	}
})

// ─── Upload Showcase ───────────────────────────────────────────────────────────────────────── ✣ ─

/**
 * Processes a user-uploaded showcase image, runs OCR to extract character
 * and stat data, and dynamically builds a complete Echo showcase UI.
 *
 * **Workflow:**
 * 1. **Input Validation:**
 *    - Expects a `.jpeg` file at 1920x1080 resolution.
 *    - Displays an error on the label if the file does not meet requirements.
 *
 * 2. **OCR Setup (Tesseract.js):**
 *    - Creates a worker limited to alphanumeric and whitelisted characters.
 *    - Recognizes the character name in the defined bounding box (`name` region).
 *    - Postprocesses known OCR errors (e.g. `"j"` misread instead of `"i"`).
 *
 * 3. **Character Detection:**
 *    - Matches OCR text to entries in the `chars` global lookup.
 *    - Special handling for **Rover** variants via color sampling/matching.
 *
 * 4. **UI Construction:**
 *    - Updates the showcase title (`<div class="title">`).
 *    - Creates a character card via `createCard(match)`.
 *    - Iterates through each region (`regions`) to:
 *      - OCR stat values and labels from cropped subregions.
 *      - Clean up OCR mistakes, normalize labels, fix missing `%`.
 *      - Determine stat tier with `getTier()`.
 *      - Compute percentage, crit contribution, and weighted contribution.
 *      - Render an `.echo` block containing:
 *        - Echo title (Echo #n).
 *        - Individual stat bars with icon, title, value, and tier segments.
 *        - Crit/Weighted bars for that particular echo.
 *
 * 5. **Totals:**
 *    - Accumulates crit score and weighted score across all echoes (up to 5).
 *    - Displays consolidated crit and weighted ranks at the bottom using `getRank()`.
 *
 * 6. **Info Page:**
 *    - Dynamically builds a weight overview (`.echo-bar` entries for each stat in `chars[match].weights`).
 *    - Adds an "Info" button to open the `.info-page`, with a window listener to close the page when clicking outside.
 *
 * 7. **Final UI Adjustments:**
 *    - Appends ratings container (`.ratings`).
 *    - Reveals `controls`, `ratings`, and `filters` sections.
 *
 * @async
 * @param {Event} event - File input change event triggered when the user uploads an image.
 * @returns {Promise<void>} Resolves once the showcase has been processed and the DOM has been updated.
 *
 * @sideeffect
 * - Reads and validates a JPEG file.
 * - Uses Tesseract.js for OCR.
 * - Mutates DOM: adds `.echo` blocks, `.echo-bar` stats, `.ratings` summary, `.info-page` content.
 * - Toggles visibility of control elements.
 */
async function uploadShowcase(event) {
	// Upload label
	var label = document.querySelector('label[for="imageInput"]')

	// Check for file
	const file = event.target.files[0]
	if (!file) return

	// Tesseract
	const worker = await Tesseract.createWorker('eng')
	await worker.setParameters({
		tessedit_pageseg_mode: 7,
		tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%,. ',
	})

	// Image Element
	const img = new Image()
	img.src = URL.createObjectURL(file)
	await img.decode()

	// Validate image
	if (img.width != 1920 || img.height != 1080) {
		label.setAttribute('data-error', 'Error: Unsupported file. Please upload the original 1920x1080 file.')
		return
	}

	// Hide base controls
	document.querySelector('.base-controls').style.display = 'none'

	// Dim background
	document.querySelector('.canvas').setAttribute('dimmed', '')

	// Setup loop variables
	var cv_total = 0
	var wv_total = 0
	var titleCount = 0

	// Recognize character
	var {
		data: { text },
	} = await worker.recognize(img, {
		rectangle: { top: name.top, left: name.left, width: name.width, height: name.height },
	})

	// Character scan errors

	// Starting J vs I
	text = text.replace('luno', 'Iuno')

	// Zani
	// -> Missing 'i'
	text = text.replace('Zan', 'Zani')
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
		// -> Title
		document.querySelector('.title').textContent = match + "'s Echoes"

		// Card Element
		var card = createCard(match, getSequences(img, icons.seq))
	}

	// Max Values
	var weightMaxPerc = getMaxValue('weight', match)
	var critValueMax = getMaxValue('cv', match)

	for (let echo in regions) {
		var cv_echo = 0
		var wv_echo = 0
		var echoStats = {}

		// Create echo
		var echoSlot = document.createElement('div')
		echoSlot.className = 'echo'

		// Title section
		var echoTitle = document.createElement('div')
		echoTitle.className = 'echo-title'

		// -> Showcase Icons
		var echoSet = document.createElement('img')
		echoSet.className = 'echo-set'
		echoSet.src = areaToDataUrl(img, icons.set[titleCount])
		echoTitle.append(echoSet)

		var echoImage = document.createElement('img')
		echoImage.className = 'echo-image'
		echoImage.src = areaToDataUrl(img, icons.echo[titleCount])
		echoTitle.append(echoImage)

		var echoCost = document.createElement('img')
		echoCost.className = 'echo-cost'
		echoCost.src = areaToDataUrl(img, icons.cost[titleCount])
		echoTitle.append(echoCost)

		echoSlot.append(echoTitle)
		echoContainer.append(echoSlot)

		for (let i = 0; i < regions[echo].length; i++) {
			// Setup
			const { left, top, width, height } = regions[echo][i]

			// OCR on the cropped region
			var {
				data: { text },
			} = await worker.recognize(img, {
				rectangle: { top: top, left: left, width: width, height: height },
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
			if (amount[0] == '7' && amount[1] == '1') {
				// 71 > 7.1
				amount = '7.1' + amount.slice(2)
			}
			if (amount[0] == '1' && amount[1] == '.') {
				// 1.9 > 7.9
				amount = '7' + amount.slice(1)
			}
			if (label != 'Crit. DMG') {
				amount = amount.replace('17', '7')
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

			// Add element
			var el = document.createElement('div')
			el.classList = 'echo-bar'

			// Values
			if (calcLabel != 'None') {
				// Crit value
				el.setAttribute('crit', 'false')
				switch (calcLabel) {
					case 'CritRate':
						if (chars[match].weights[calcLabel] > 0) {
							cv_echo += parseFloat(2 * calcAmount)
							el.setAttribute('crit', 'true')
						}
						break
					case 'CritDMG':
						if (chars[match].weights[calcLabel] > 0) {
							cv_echo += parseFloat(calcAmount)
							el.setAttribute('crit', 'true')
						}
						break
				}

				// Weighted values
				if (chars[match].weights) {
					wv_echo += chars[match].weights[calcLabel] * perc
				}
			}

			// Replaceability
			echoStats[calcLabel] = calcAmount

			// Add icon
			var icon = document.createElement('img')
			icon.className = 'icon'
			icon.src = `./media/img/icons/${combatStats.icon[calcLabel]}.webp`
			el.append(icon)

			// Add label
			var title = document.createElement('span')
			title.textContent = label.replace(' DMG Bonus', '')
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
			el.querySelector('.value').setAttribute('rank', getStatRank(tier))
			el.setAttribute('weighted', chars[match].weights[calcLabel] >= getWeightCutoff(chars[match].weights))

			echoSlot.append(el)
		}

		// Divider
		el = document.createElement('hr')
		echoSlot.append(el)

		// Crit Value
		if (critValueMax > 0) {
			var perc = (cv_echo / (critValueMax / 5)) * 100
			var el = document.createElement('div')
			el.classList = 'echo-bar'
			el.innerHTML = `
					<span class="title">Crit Value</span>
					<span class="value">${cv_echo.toFixed(1)}<span class="sub-value">/${critValueMax / 5}</span></span>`
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

		// Totals
		cv_total += cv_echo
		wv_total += wv_echo

		// Toogle echo container opacity
		echoSlot.style.opacity = '1'

		// Add card element
		if (titleCount == 0) {
			echoContainer.append(card.container)
			card.container.style.opacity = '1'
		}

		// Increase title count
		titleCount++
	}
	var ratings = document.createElement('div')
	ratings.className = 'ratings hidden'
	echoContainer.append(ratings)

	// Crit Score
	if (critValueMax > 0) {
		var cv_perc = (cv_total / critValueMax) * 100
		var el = document.createElement('div')
		el.classList = 'echo-score'

		// Double vs Single Weighted
		if (critValueMax < 210) {
			el.setAttribute('rank', getCritRank(cv_total * 2))
		} else {
			el.setAttribute('rank', getCritRank(cv_total))
		}
		el.innerHTML = `<span style="color: #fff; display: contents;">Crit Value:</span> ${cv_total.toFixed(1)}<span class="sub-value">${cv_perc.toFixed(2)}%</span>`
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

	// -> Title
	info.querySelector('.info-title').textContent = `Weighted Stats (${match})`

	// -> Bars
	var infoBars = document.createElement('div')
	infoBars.className = 'info-bars'
	for (var stat in chars[match].weights) {
		// Create Bars
		var perc = ((chars[match].weights[stat] / 2.2) * 100).toFixed(2)
		var el = document.createElement('div')
		el.classList = 'echo-bar'
		el.innerHTML = `
					<span class="title">${combatStats.label[stat]}</span>
					<span class="value">${chars[match].weights[stat]}</span>`
		if (chars[match].weights[stat] != 0) {
			el.style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${perc}%, rgba(32, 34, 37, 0.52) ${perc}%`
		} else {
			el.style.background = 'rgba(32, 34, 37, 0.52)'
		}
		infoBars.append(el)
	}
	info.append(infoBars)
	info.style.display = 'block'

	// Enable controls
	controls.classList.toggle('hidden')
	ratings.classList.toggle('hidden')
	filters.classList.toggle('hidden')
}

// ─── Manual Input ──────────────────────────────────────────────────────────────────────────── ✣ ─

/**
 * Creates and initializes the "Custom Echo" interface.
 *
 * - Hides the default `.base-controls` section.
 * - Updates the title to "Custom Echo".
 * - Generates a character card (default: `"Aalto"`) and appends it to the global `echoContainer`.
 * - Dynamically builds the interactive echo editor (`echoSlot`)
 * - Each `<select>` is bound to the `updateCustomEcho` updater for live UI recalculation.
 *
 * @function
 * @returns {void} Does not return a value; initializes DOM elements and updates global state.
 */
function createCustomEcho() {
	// Hide base controls
	document.querySelector('.base-controls').style.display = 'none'

	// Dim background
	document.querySelector('.canvas').setAttribute('dimmed', '')

	// Card Element
	var card = createCard('Aalto')
	echoContainer.append(card.container)
	card.container.style.opacity = '1'

	// Setup echo
	var echoSlot = document.createElement('div')
	echoSlot.className = 'echo'
	echoSlot.setAttribute('custom', '')

	// Container Row
	var row = document.createElement('div')
	row.className = 'row'

	// Character Select
	var select = document.createElement('select')
	select.setAttribute('char', '')
	for (var key in chars) {
		const option = document.createElement('option')
		option.value = key
		option.textContent = key

		// Check for unrelased / unweighted
		if (Object.keys(chars[key]).length < 1) {
			option.disabled = true
		}

		select.appendChild(option)
	}
	select.addEventListener('change', updateCustomEcho)
	row.append(select)

	// Reset Stat Selection
	var el = document.createElement('div')
	el.className = 'reset-stats'
	el.textContent = 'Reset'
	el.addEventListener('click', function () {
		// Reset all stats to 'None'
		var selects = document.querySelectorAll('.echo select[stat]')
		selects.forEach((select) => {
			select.value = 'None'
		})
		updateCustomEcho()
	})
	row.append(el)

	echoSlot.append(row)

	// Divider element
	var el = document.createElement('hr')
	echoSlot.append(el)

	// Input Elements
	for (let i = 0; i < 5; i++) {
		// Create row
		var row = document.createElement('div')
		row.className = 'row'

		// Create stat options
		var selectContainer = document.createElement('div')
		selectContainer.className = 'selection-container'
		selectContainer.setAttribute('weighted', 'false')
		var select = document.createElement('select')
		select.setAttribute('stat', '')
		for (var key in combatStats.label) {
			const option = document.createElement('option')
			option.value = key
			option.textContent = combatStats.label[key]
			select.appendChild(option)
		}
		select.addEventListener('change', updateCustomEcho)
		selectContainer.appendChild(select)

		// Add segments
		var seg = document.createElement('div')
		seg.className = 'segments'
		for (var s = 1; s < 9; s++) {
			var box = document.createElement('div')
			seg.append(box)
		}
		selectContainer.append(seg)
		row.append(selectContainer)

		// Create stat ranges
		var select = document.createElement('select')
		select.setAttribute('value', '')
		const option = document.createElement('option')
		select.appendChild(option)
		select.addEventListener('change', updateCustomEcho)
		row.appendChild(select)

		echoSlot.appendChild(row)
	}

	// Divider element
	var el = document.createElement('hr')
	echoSlot.append(el)

	// Crit Value
	var el = document.createElement('div')
	el.classList = 'echo-bar'
	el.innerHTML = `
					<span class="title">Crit Value</span>
					<span class="value">0<span class="sub-value">/42</span></span>`
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

	// Force update to set stats
	updateCustomEcho()

	// Enable controls
	// Enable ratings + filters
	controls.classList.toggle('hidden')
	filters.classList.toggle('hidden')
}

// ─── Functions ─────────────────────────────────────────────────────────────────────────────── ✣ ─

/**
 * Updates the custom echo configuration based on user-selected stats, values,
 * and the currently chosen character.
 *
 * @returns {void} The function does not return a value; it updates DOM state
 *   and style side effects directly.
 */
function updateCustomEcho() {
	var char = echoContainer.querySelector('select[char]').value
	var stats = echoContainer.querySelectorAll('select[stat]')
	var values = echoContainer.querySelectorAll('select[value]')
	var ratings = echoContainer.querySelectorAll('.echo-bar')
	var segments = echoContainer.querySelectorAll('.segments')
	var showcase = document.querySelector('.showcase')
	var cv_echo = 0
	var wv_echo = 0
	var echoStats = {}

	// Max Values
	var weightMaxPerc = getMaxValue('weight', char)
	var critValueMax = getMaxValue('cv', char)

	// Gather all user-selected values
	const selectedValues = Array.from(stats).map((select) => select.value)

	// Loop through all select boxes
	stats.forEach((select, idx) => {
		Array.from(select.options).forEach((option) => {
			// Disable selected options in all other select boxes
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
			stats[i].parentElement.removeAttribute('weighted')
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
		stats[i].parentElement.setAttribute('crit', 'false')
		switch (stats[i].value) {
			case 'CritRate':
				if (chars[char].weights[stats[i].value] > 0) {
					cv_echo += parseFloat(2 * values[i].value)
					stats[i].parentElement.setAttribute('crit', 'true')
				}
				break
			case 'CritDMG':
				if (chars[char].weights[stats[i].value] > 0) {
					cv_echo += parseFloat(values[i].value)
					stats[i].parentElement.setAttribute('crit', 'true')
				}
				break
		}

		// -> WV
		if (chars[char].weights && stats[i].value != 'None') {
			wv_echo += chars[char].weights[stats[i].value] * ((values[i].value / range[stats[i].value][8]) * 100)
			stats[i].parentElement.setAttribute('weighted', chars[char].weights[stats[i].value] >= getWeightCutoff(chars[char].weights))
		}

		// Tier
		var tier = getTier(stats[i].value, values[i].value)
		values[i].setAttribute('rank', getStatRank(tier))

		// Set segments
		var boxes = segments[i].children
		for (var s = 0; s < boxes.length; s++) {
			if (tier > s) {
				boxes[s].setAttribute('active', '')
			} else {
				boxes[s].removeAttribute('active')
			}
		}

		// Update card background
		if (char.includes('Rover')) {
			document.querySelector('.backdrop').src = `./media/img/card/Rover.webp`
			document.querySelector('.artwork').src = `./media/img/card/Rover.webp`
		} else {
			document.querySelector('.backdrop').src = `./media/img/card/${char.replace(' ', '')}.webp`
			document.querySelector('.artwork').src = `./media/img/card/${char.replace(' ', '')}.webp`
		}
	}

	// Crit
	var cv_perc = (cv_echo / (critValueMax / 5)) * 100
	ratings[0].style.background = `linear-gradient(to right, var(--gradient-main-start) 0%, var(--gradient-main-stop) ${cv_perc}%, rgba(32, 34, 37, 0.52) ${cv_perc}%`
	ratings[0].querySelector('.value').innerHTML = `${cv_echo.toFixed(1)}<span class="sub-value">/${critValueMax / 5}</span>`

	if (critValueMax > 0) {
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

/**
 * Creates a character card element consisting of a container, backdrop, and artwork.
 *
 * - The returned object includes DOM elements:
 *   - `container` (`<div>` with class `"echo card"`)
 *   - `backdrop` (`<img>` with class `"backdrop"`)
 *   - `artwork` (`<img>` with class `"artwork"`)
 *
 * @param {string} char - The character name used to determine the card artwork.
 * @returns {{container: HTMLElement, backdrop: HTMLImageElement, artwork: HTMLImageElement}}
 *   An object containing the created card elements.
 */
function createCard(char, seq = 0) {
	// Card Element
	var card = {
		container: document.createElement('div'),
		backdrop: document.createElement('img'),
		artwork: document.createElement('img'),
		sequence: document.createElement('div'),
	}

	// -> Container
	card.container.className = 'echo card'

	// Backdrop
	card.backdrop.className = 'backdrop'

	// Artwork
	card.artwork.className = 'artwork'

	// Sequences
	card.sequence.className = 'sequence'
	// -> Active
	for (var i = 0; i < seq; i++) {
		var el = document.createElement('img')
		el.src = './media/img/interface/seq-active.png'
		card.sequence.append(el)
	}
	// -> Inactive
	for (var i = 0; i < 6 - seq; i++) {
		var el = document.createElement('img')
		el.src = './media/img/interface/seq-inactive.png'
		card.sequence.append(el)
	}

	// Card Setup
	card.container.append(card.backdrop)
	card.container.append(card.artwork)
	card.container.append(card.sequence)

	// Card background
	if (char.includes('Rover')) {
		card.backdrop.src = `./media/img/card/Rover.webp`
		card.artwork.src = `./media/img/card/Rover.webp`
	} else {
		card.backdrop.src = `./media/img/card/${char.replace(' ', '')}.webp`
		card.artwork.src = `./media/img/card/${char.replace(' ', '')}.webp`
	}
	return card
}

/**
 * Calculates the maximum value for a character based on the requested type.
 *
 * Supported types:
 * - `"weight"`: Returns the maximum weighted sum of the top 5 highest stat weights,
 *   multiplied by 100.
 * - `"cv"`: Returns the maximum possible crit value.
 *
 * @param {"weight"|"cv"|string} val - The type of calculation to perform.
 * @param {string} char - The key identifying the character.
 * @returns {number} The maximum value for the given character and calculation type.
 */
function getMaxValue(val, char) {
	switch (val) {
		case 'weight':
			// Max Weighted Sum
			return (
				Object.values(chars[char].weights)
					.sort((a, b) => b - a)
					.slice(0, 5)
					.reduce((acc, val) => acc + val, 0) * 100
			)
		case 'cv':
			return 105 * ((chars[char].weights['CritRate'] > 0) + (chars[char].weights['CritDMG'] > 0))
		default:
			return 0
	}
}

/**
 * Returns the 5th highest numeric value from the given object's values.
 *
 * The function extracts all values from the provided object, sorts them
 * in descending order, and returns the value at index 4 (the fifth element).
 *
 * @param {Object.<string, number>} obj - An object with numeric values.
 * @returns {number | undefined} The 5th largest value, or `undefined` if the object has fewer than 5 values.
 */
function getWeightCutoff(obj) {
	var values = Object.values(obj)
	values.sort((a, b) => b - a)
	return values[4]
}

/**
 * Determines the tier of a given stat value based on predefined thresholds.
 *
 * @param {string} stat - The name of the stat (must exist as a key in the global `range` object).
 * @param {number} amount - The numeric value of the stat to evaluate.
 * @returns {number} The tier number corresponding to the provided amount,
 *   or `0` if the amount does not reach any threshold.
 */
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

/**
 * Toggles filter attributes on the `.showcase` element based on the clicked control element.
 *
 * The clicked element is marked active with the `active` class when enabled,
 * and the class is removed when disabled. Attributes on the `.showcase` element
 * reflect the active filter state.
 *
 * @param {HTMLElement} el - The element that was clicked, containing a `data-filter` attribute.
 * @returns {void} Does not return a value; updates the DOM as a side effect.
 */
function setFilter(el) {
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
			showcase.setAttribute('ranks', 'hide')
			el.classList.remove('active')
		} else {
			showcase.setAttribute('ranks', 'show')
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

/**
 * Exports the contents of the `.echo-fields` element as a PNG image.
 *
 * - Temporarily applies `data-export` styles to the document body.
 * - Uses the `html-to-image` library to render the element as a PNG.
 * - Excludes any elements with the `data-export-exclude` attribute.
 * - Triggers a download of the generated image (`WutheringInsight.png`).
 * - Cleans up by removing export-specific styles, even on error.
 *
 * @function
 * @returns {void} The function does not return a value; triggers PNG download as a side effect.
 */
function exportImage() {
	// Target
	var target = document.querySelector('.echo-fields')

	// Set export styles
	document.body.setAttribute('data-export', '')

	htmlToImage
		.toPng(target, {
			pixelRatio: 1,
			scale: 1,
			filter: function (node) {
				// Exclude elements by data-export-exclude attribute
				if (node.hasAttribute && node.hasAttribute('data-export-exclude')) {
					return false
				}

				return true
			},
		})
		.then((dataUrl) => {
			// Remove export styles
			document.body.removeAttribute('data-export')

			// Download Result
			const link = document.createElement('a')
			link.download = 'WutheringInsight.png'
			link.href = dataUrl
			link.click()
		})
		.catch((err) => {
			// Remove export styles
			document.body.removeAttribute('data-export')

			console.error('[Error]', err)
		})
}

/**
 * Returns the corresponding rank for a percentage value
 * based on predefined thresholds.
 *
 * @param {number} perc - The percentage value to evaluate.
 * @returns {string} The rank for the given percentage.
 */
function getRank(perc) {
	const thresholds = [
		{ min: 75, rank: 'Sentinel' },
		{ min: 70, rank: 'WTF+' },
		{ min: 65, rank: 'WTF' },
		{ min: 60.5, rank: 'SSS+' },
		{ min: 56.5, rank: 'SSS' },
		{ min: 53, rank: 'SS+' },
		{ min: 50, rank: 'SS' },
		{ min: 47.5, rank: 'S+' },
		{ min: 45, rank: 'S' },
		{ min: 42.5, rank: 'A+' },
		{ min: 40, rank: 'A' },
		{ min: 37.5, rank: 'B+' },
		{ min: 35, rank: 'B' },
		{ min: 32.5, rank: 'C+' },
		{ min: 30, rank: 'C' },
		{ min: 27.5, rank: 'D+' },
		{ min: 25, rank: 'D' },
		{ min: 22.5, rank: 'F+' },
	]

	for (const { min, rank } of thresholds) {
		if (perc >= min) return rank
	}
	return 'F'
}

function getStatRank(tier) {
	switch (tier) {
		case 8:
			return 'gold'
		case 7:
			return 'gold'
		case 6:
			return 'gold'
		case 5:
			return 'purple'
		case 4:
			return 'purple'
		case 3:
			return 'blue'
		case 2:
			return 'blue'
		case 1:
			return 'green'
		default:
			return 'green'
	}
}

/**
 * Determines the critical tier based on the given CV (critical value).
 *
 * @param {number} cv - The crit value to evaluate.
 * @returns {number} The tier (rank) corresponding to the provided CV.
 *
 * @example
 * getCritTier(200); // returns 7
 * getCritTier(140); // returns 2
 * getCritTier(300); // returns 8
 * getCritTier(100); // returns 1 (default if no threshold is met)
 */
function getCritRank(cv) {
	var thresholds = [
		{ min: 210, rank: 'gold' },
		{ min: 198, rank: 'gold' },
		{ min: 186, rank: 'gold' },
		{ min: 174, rank: 'purple' },
		{ min: 162, rank: 'purple' },
		{ min: 150, rank: 'blue' },
		{ min: 138, rank: 'blue' },
		{ min: 126, rank: 'green' },
	]

	// use rank instead of tier
	for (const { min, rank } of thresholds) {
		if (cv >= min) return rank
	}
	return 'green'
}

/**
 * Converts a hex color code into its RGB components.
 * Supports both 3-digit (#fff) and 6-digit (#ffffff) formats.
 *
 * @param {string} hex - The hex color code.
 * @returns {number[]} An array [r, g, b] with values from 0 to 255.
 */
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

/**
 * Converts RGB values into a hex color string.
 *
 * @param {number} r - The red component (0–255).
 * @param {number} g - The green component (0–255).
 * @param {number} b - The blue component (0–255).
 * @returns {string} The hex color string in the format "#rrggbb".
 */
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

/**
 * Finds the closest hex color from a provided list of colors
 * by calculating the Euclidean distance in RGB space.
 *
 * @param {string} targetColor - The target color in hex format (e.g. "#ff0000").
 * @param {string[]} colorArray - An array of hex color strings to compare against.
 * @returns {string|null} The closest matching color from the array, or null if the array is empty.
 */
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

/**
 * Extracts a specific rectangular area from the source image and returns a CSS-compatible data URL string.
 *
 * @param {CanvasImageSource} source - The image, video, or canvas source to crop from.
 * @param {Object} cords - An object specifying the crop rectangle.
 * @param {number} cords.left - The x-coordinate (from left) of the crop area in the source image.
 * @param {number} cords.top - The y-coordinate (from top) of the crop area in the source image.
 * @param {number} cords.width - The width of the crop area.
 * @param {number} cords.height - The height of the crop area.
 * @returns {string} A string in the format 'url(data:image/png;base64,...)' for use in CSS background-image.
 *
 * @example
 * const url = areaToDataUrl(img, { left: 10, top: 20, width: 100, height: 50 });
 * element.style.backgroundImage = url;
 */
function areaToDataUrl(source, cords) {
	var canvas = document.createElement('canvas')
	canvas.width = cords.width
	canvas.height = cords.height
	const ctx = canvas.getContext('2d')
	ctx.drawImage(source, cords.left, cords.top, cords.width, cords.height, 0, 0, cords.width, cords.height)
	return canvas.toDataURL()
}

function getSequences(source, cords) {
	// Create canvas element for extraction
	var canvas = document.createElement('canvas')
	canvas.width = source.width
	canvas.height = source.height

	// Draw image
	var ctx = canvas.getContext('2d')
	ctx.drawImage(source, 0, 0)

	// Check sequences
	var seq = 0
	for (var el in cords) {
		// Read pixel
		var pixel = ctx.getImageData(cords[el].left, cords[el].top, 1, 1).data

		// Check value against treshold
		if (pixel[0] + pixel[1] + pixel[2] > 30) {
			// Add sequence
			seq++
		}
	}
	return seq
}

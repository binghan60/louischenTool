function generateRange(start, end) {
	const range = [];
	for (let i = start; i <= end; i++) {
		range.push(i);
	}
	return range;
}

function calculateCombinations() {
	// 取得輸入的值並轉換為數字陣列
	// document.querySelector('#submit').innerHTML = '<i class="fa-solid fa-hourglass-start"></i>';
	const maleUnitStart = parseInt(document.getElementById('maleUnitStart').value);
	const maleUnitEnd = parseInt(document.getElementById('maleUnitEnd').value);
	const maleUnits = generateRange(maleUnitStart, maleUnitEnd);

	const femaleUnits = document.getElementById('femaleUnitLengths').value.split(',').map(Number);
	const bothUnits = document.getElementById('bothUnitLengths').value.split(',').map(Number);
	const totalLength = parseInt(document.getElementById('totalLength').value);
	const firstUnit = document.querySelector('input[name=unitTypeFirst]:checked').value;
	const lastUnit = document.querySelector('input[name=unitTypeLast]:checked').value;

	if (isNaN(totalLength) || totalLength <= 0) {
		alert('請輸入有效的總長度！');
		return;
	}

	const results = [];

	// 簡單的遞歸函數
	function findCombination(currentCombo, currentLength, lastUnitType, allowBoth) {
		// 如果達到總長度，檢查第一個和最後一個單元
		if (currentLength === totalLength) {
			if ((firstUnit === '公單元' && currentCombo[0]?.type !== '公單元') || (firstUnit === '母單元' && currentCombo[0]?.type !== '母單元') || (firstUnit === '公母單元' && currentCombo[0]?.type !== '公母單元') || (lastUnit === '公單元' && currentCombo[currentCombo.length - 1]?.type !== '公單元') || (lastUnit === '母單元' && currentCombo[currentCombo.length - 1]?.type !== '母單元') || (lastUnit === '公母單元' && currentCombo[currentCombo.length - 1]?.type !== '公母單元')) {
				return; // 如果不符合條件則停止
			}
			results.push([...currentCombo]); // 儲存符合條件的組合
			return;
		}

		if (currentLength > totalLength) return; // 超過長度則停止

		// 加入公單元
		if (lastUnitType !== '公單元') {
			maleUnits.forEach((unit) => {
				findCombination([...currentCombo, { type: '公單元', length: unit }], currentLength + unit, '公單元', true);
			});
		}

		// 加入母單元
		if (lastUnitType !== '母單元') {
			femaleUnits.forEach((unit) => {
				findCombination([...currentCombo, { type: '母單元', length: unit }], currentLength + unit, '母單元', true);
			});
		}

		// 加入公母單元
		if (allowBoth && (lastUnitType === '公單元' || lastUnitType === '母單元')) {
			bothUnits.forEach((unit) => {
				findCombination([...currentCombo, { type: '公母單元', length: unit }], currentLength + unit, lastUnitType, false);
			});
		}
	}

	// 根據選擇的第一個單元開始遞歸
	if (firstUnit === '公單元') {
		maleUnits.forEach((unit) => {
			findCombination([{ type: '公單元', length: unit }], unit, '公單元', true);
		});
	} else if (firstUnit === '母單元') {
		femaleUnits.forEach((unit) => {
			findCombination([{ type: '母單元', length: unit }], unit, '母單元', true);
		});
	} else if (firstUnit === '公母單元') {
		bothUnits.forEach((unit) => {
			findCombination([{ type: '公母單元', length: unit }], unit, '公母單元', true);
		});
	}

	// 排序結果：先根據單元數量，然後再根據總長度
	results.sort((a, b) => {
		const lengthA = a.length;
		const lengthB = b.length;

		if (lengthA !== lengthB) {
			return lengthA - lengthB; // 單元數量少的排前面
		}

		// 如果單元數量相同，根據總長度排序
		const sumA = a.reduce((sum, unit) => sum + unit.length, 0);
		const sumB = b.reduce((sum, unit) => sum + unit.length, 0);

		return sumA - sumB; // 總長度少的排前面
	});

	// 顯示結果
	const resultsDiv = document.getElementById('results');
	const bestAnswer = results[0];
	const bestTotal = bestAnswer.reduce((a, b) => a + b.length, 0);
	console.log(bestAnswer);
	console.log(bestTotal);

	resultsDiv.innerHTML = results.length
		? results
				.slice(0, 10)
				.map((combo, index) => {
					if (index == 0) {
						return `<div class="mb-4 p-4 border-b border-gray-300">
                                    <p class="font-semibold text-blue-600 mb-2">組合${index + 1}：</p>
                                    <div class="space-y-2">
                                    ${combo
										.map(
											(unit) => `
                                        <div class="flex items-center">
                                            <span class="font-medium text-blue-500 mr-2">${unit.type}</span>
                                            <span class="text-gray-700">${unit.length}</span>
                                        </div>`
										)
										.join('')}
                                    </div>
                                    <div id="chart" class="flex w-full h-10 bg-gray-200 rounded-lg mt-3">${bestAnswer
										.map((x, index) => {
											let color = '';
											let percent = (x.length / bestTotal) * 100;
											console.log(percent);
											if (x.type == '公單元') {
												color = 'blue';
											}
											if (x.type == '母單元') {
												color = 'pink';
											}
											if (x.type == '公母單元') {
												color = 'purple';
											}
											// 对第一个和最后一个条形图做样式处理
											if (index == 0) {
												return `<div class="h-full bg-${color}-300 rounded-l-lg flex justify-center items-center text-gray-600" style="width: ${percent}%">${percent}%</div>`;
											}
											if (index == bestAnswer.length - 1) {
												return `<div class="h-full bg-${color}-300 rounded-r-lg flex justify-center items-center text-gray-600" style="width: ${percent}%">${percent}%</div>`;
											}

											return `<div class="h-full bg-${color}-300 flex justify-center items-center text-gray-600" style="width: ${percent}%">${percent}%</div>`;
										})
										.join('')}</div>
                                </div>`;
					}
					return `
                        <div class="mb-4 p-4 border-b border-gray-300">
                            <p class="font-semibold text-blue-600 mb-2">組合${index + 1}：</p>
                            <div class="space-y-2">
                            ${combo
								.map(
									(unit) => `
                                <div class="flex items-center">
                                    <span class="font-medium text-blue-500 mr-2">${unit.type}</span>
                                    <span class="text-gray-700">${unit.length}</span>
                                </div>`
								)
								.join('')}
                            </div>
                        </div>`;
				})
				.join('')
		: '<p>沒有符合條件的組合。</p>';
	// document.querySelector('#submit').innerHTML = '計算';
}

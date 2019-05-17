/*
	log 格式化console
	-----------------------------------
	ektx <530675800@qq.com>
*/

const logs = {

	options: {
		textAlign: 'left',
		width: 50,
		colspan: [ '100%' ]
	},

	option (obj = {}) {
		this.option = Object.assign(this.options, obj)
		console.log( this.option )
		return this
	},

	show (obj) {
		console.log(obj, this.option)
	},
	/*
	.list({
		content: [ 
			[ "content", "列表内容，数组形式"  ],
			[ "title", "标题" ],
			[ "algin", "对齐方式，可选 left, center, right" ],
			[ "width", "总列表宽度" ],
			[ "colspan", "分列数量" ]
		],
		title: ['List 说明'],
		align: 'center',
		width: 60,
		whiteSpace: 'nowrap',
		colspan: 2
	})
	*/
	list : function(obj) {
		let width = obj.width || 20;
		let align = obj.align;
		let html = '';
		// 行数
		let colspan = obj.colspan || 2;
		let listWidth = remainderVal = 0;
		// 默认为换行，可选择 nowrap 不换行 
		obj.whiteSpace = obj.whiteSpace || "normal";

		let filterAlign = function(align) {
			return /^(left|center|right|justify)$/.test(align) ? align : 'left';
		}

		if (typeof width === 'number') {
			// 单元格宽度
			listWidth  = Math.floor(width / colspan);
			// 分栏余数; 12%2 = 2  _____+++++==
			remainderVal = Math.floor(width % colspan);

			width = [];
			for (let i = 0; i < colspan; i++) {

				if (i == colspan -1) listWidth += remainderVal;

				width.push(listWidth)
			}	
		}

		if (obj.whiteSpace && obj.whiteSpace === 'normal') {
			arrayFormat(obj.content, width);
		}
		
		// 过滤 align
		if (typeof align === 'string') align = filterAlign(align);

		if (obj.content) {

			// 标题
			if (obj.title) {
				let titleStr = '';
				let _align = align;

				for (let i = 0; i < colspan; i++) {
					if (i === colspan -1) {
						listWidth += remainderVal;
					}

					let val = !obj.title[i] ? '' : obj.title[i];

					// 两端对齐特殊效果
					if (obj.align === 'justify' || typeof obj.align === 'object') _align = 'left';

					titleStr += positionStr(textOverflow(val), _align, '', listWidth)
				}
				html += titleStr;
			}

			// 列表
			if (obj.content) {
				let listHTML = '\n';

				for (let l of obj.content) {
					if (l !== obj.content[0]) 
						listHTML += '\n';

					// 列数 = 标题的个数 或 自己的长度
					// let steps = !obj.title ? l.length : obj.title.length;
					for (let i = 0; i < colspan; i++) {
						// 过滤空值
						let val = !l[i] ? '' : l[i];
						let _align = align;

						// 两端对齐特殊效果
						if (obj.align === 'justify') {
							if (i == 0) _align = 'left' 
							else if (i == colspan -1)  _align = 'right'
							else _align = 'center'
						}

						// 自定义对齐
						if (typeof align === 'object') {
							_align = align[i]
						}

						// 自定义宽度
						if (typeof width === 'object') {
							listWidth = width[i]
						}

						// 对隐藏文字时，截取
						if (obj.whiteSpace === "nowrap") val = textOverflow(val, listWidth);

						listHTML += positionStr( val, _align, '', listWidth);
					}
					
				}

				html += listHTML;
			}
		}

		console.log(html)
		return this;
	}
}


// 格式化输出
function output (obj) {
	let repeatStr = '';
	let endPlaceholder = startPlaceHolder = '';
	let sign = obj.sign;
	let contLen = getStrLen(obj.title.content);

	if (sign.length > 1) {
		sign = sign.substr(0, 1)
	}

	if (obj.title.decoration === 'above') {

		if (obj.width > contLen) {
			// ----- text ------
			let repeatCount = Math.floor( (obj.width - contLen - 2) /2 );

			if (repeatCount > 0) {
				startPlaceHolder = endPlaceholder = ' ';

				// 对不是平分的内容，endPlaceHolder + sign
				if ( (obj.width - contLen -2) %2 == 1 ) {
					endPlaceholder += sign;
				}

				repeatStr = sign.repeat(repeatCount);
				startPlaceHolder += obj.title.content;
				// console.log(repeatStr, startPlaceHolder)
			}
		}
	}
	// decoration = inset
	else if (obj.title.decoration === 'inset') {
		repeatStr = sign.repeat(obj.width);

		startPlaceHolder = positionStr(obj.title.content, obj.title.align, ' ', obj.width);

		endPlaceholder += '\n';
		startPlaceHolder = '\n' + startPlaceHolder;

		// 输出二级标题
		if (!!obj.subTitle) {
			endPlaceholder = '\n' + positionStr(obj.subTitle.content, obj.subTitle.align, ' ', obj.width) + '\n';
		}
	}

	return repeatStr + startPlaceHolder + endPlaceholder + repeatStr; 

}

// 可以过滤出中文字符长度
function getStrLen(str) {
	return str.replace(/[^\x00-\xff]/g, '__').length;
}


// 文字溢出
function textOverflow(str, len) {
	// 文字过长隐藏
	if (getStrLen(str) > len) {
		str = substrs(str, 0, len - 4) + '...';
	}
	return str;
}



/* 
	字符串截取
	----------------------------------------
	支持中文的截取

	@str 截取字符串
	@start 开始位置
	@len 截取长度
*/ 
function substrs(str, start, len) {

	let result = '';
	let strLen = getStrLen(str);

	len = len || strLen;
	start = start || 0;


	for (let i = 0; i < strLen; i++) {

		if (i >= start + len) {
			// console.log('OVER');
			break;
		}

		// 小于截取内容时
		if (i < start) {

			// 如果是中文,全角字符，在不输出时，全部格式成 __
			if ( /[^x00-\xff,?*&$\-+\s]/.test( str[i] ) ) {
				i++;
				str = str.replace(/[^\x00-\xff]/, '__');

				// i++ 之后是否已经超出了截取的限制
				// 超出则停止
				if (i > start + len) {
					console.log('add will OVER');
					break;
				}
			}
			
		} 
		// 开始截取
		else {

			// 对中文，我们加上一个字符，路过这个词
			if ( /[^x00-\xff,?*&$\-+\s]/.test( str[i] ) ) {
				str = '_' + str;
				i++;
				result += str[i]
				
			} 
			// 非中文添加
			else {
				result += str[i]
			}
			
		}

	}


	return result;
}


/*
	输出效果
	-----------------------------------------
	@str [string] 内容
	@align [left | center | right] 对齐方式
	@sign  [string] 修饰符
	@width [Number] 宽度
*/
function positionStr(str, align, sign, width) {
	let html = '';
	let _s = 0;
	const strLen = getStrLen(str);
	sign = sign || ' ';
	switch (align || 'left') {
		/*
		=====================
		title
		=====================
		*/
		case "left":
			_s = Math.floor((width - strLen));
			html += str + sign.repeat( _s > 0 ? _s : 0 );
			break;

		/*
		=====================
		        title
		=====================
		*/
		case "center":
			_s = Math.floor((width - strLen)/2);
			let _r = sign.repeat( _s > 0 ? _s : 0 );
			let _remainder = (width - strLen) %2;
			html = _r + str + _r + sign.repeat(_remainder);
			break;

		/*
		====================
		               title
		====================
		*/	
		case "right":
			_s = width - strLen;
			html = ' '.repeat( _s > 0 ? _s : 0 ) + str;	
	}

	return html;
}


function arrayFormat(arr, width) {
		// 临时存储数组
	var willMake = [];

	// 所有超出数组集
	var b = [];

	// 找到数组之中超出的内容
	for (let i = 0; i < arr.length; i++) {

		for (let x = 0; x < width.length; x++) {
			
			if (arr[i][x].length > width[x]) {
				// console.error(arr[i][x], x, i);
				b.push(i)
				break;

			}

		}
	}
	// 打印一下看看 @_@
	// console.log(b)

	// 对所有超出的内容处理
	for ( let i of b) {
		let str =  arr[i];
		// 内容每个倍数数组
		let maxLine = [];

		// str 是具体的单个数组内容
		// 如 i 是 0 时, 内容是：
		// [ "algin ", "对齐方式,可选 left,center,right,justify; 或使用数组" ]
		str.forEach(function(val, index) {
			// 我们再看看信息 @_@
			// console.log(val, index, Math.ceil(val.length / width[index]) );

			// 对数组内数据与宽度一一对比,计算它们的倍数
			maxLine.push( Math.ceil( getStrLen(val) / width[index]) )

			// 最后.我们找到最大的倍数,也就是我们要生成多少个新的数组
			if (index == str.length -1) {
				// 获取最大的数组
				let toMakeArr = Math.max.apply(null, maxLine);

				// 拆分之后的数组
				let cArr = [];
				
				for (let arr = 0; arr < toMakeArr; arr++) {
					cArr[arr] = [];

					width.forEach(function(val2, index2) {
						// ['align', '对齐方式,可选 left,ce'] 
						// => arr = 0,第一行,放入对应的宽度字符

						// ['', 'nter,right,just']
						// ['','ify; 或使用数组']
						// cArr[arr][index2] = str[index2].substr(arr*val2, val2)
						cArr[arr][index2] = substrs(str[index2], arr*val2, val2)
					})
				}

				// 最后；我们把他们保存到最后处理的数据之中
				willMake.push({
					arr: cArr, // 新数组
					index: i // 这是当前数据在原数组中的 index
				})
			}
			
		});


	}


	// 偏移量，这是因为当有数组被追加到之前的数组之后，新加了个数，导致了偏移
	let offset = 0;

	// 对所有生成好的数组进行添加工作
	for (let wVal = 0; wVal < willMake.length; wVal++) {

		// 偏移量
		if (wVal != 0) offset += willMake[wVal - 1].arr.length - 1;

		willMake[wVal].arr.forEach(function(val, i) {
			let newIndex = willMake[wVal].index + i + offset;

			if (newIndex < arr.length) {
				// 定义要删除的老数据
				let delIndex = 0;
				
				// 只有在0的时候，我们替换之前的数组，其它情况只加
				if (i == 0) delIndex = 1;

				arr.splice(newIndex, delIndex, val);

			} else {
				console.log('Too long')
				arr.push(val)
			}
		})
	}

	return arr;
}

module.exports = logs

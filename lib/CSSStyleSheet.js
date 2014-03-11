//.CommonJS
var CSSOM = {
	StyleSheet: require("./StyleSheet").StyleSheet,
	CSSStyleRule: require("./CSSStyleRule").CSSStyleRule,
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
 */
CSSOM.CSSStyleSheet = function CSSStyleSheet() {
	CSSOM.StyleSheet.call(this);
	this.cssRules = [];
};


CSSOM.CSSStyleSheet.prototype = new CSSOM.StyleSheet;
CSSOM.CSSStyleSheet.prototype.constructor = CSSOM.CSSStyleSheet;


/**
 * Used to insert a new rule into the style sheet. The new rule now becomes part of the cascade.
 *
 *   sheet = new Sheet("body {margin: 0}")
 *   sheet.toString()
 *   -> "body{margin:0;}"
 *   sheet.insertRule("img {border: none}", 0)
 *   -> 0
 *   sheet.toString()
 *   -> "img{border:none;}body{margin:0;}"
 *
 * @param {string} rule
 * @param {number} index
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-insertRule
 * @return {number} The index within the style sheet's rule collection of the newly inserted rule.
 */
CSSOM.CSSStyleSheet.prototype.insertRule = function(rule, index) {
	if (index < 0 || index > this.cssRules.length) {
		throw new RangeError("INDEX_SIZE_ERR");
	}
	this.cssRules.splice(index, 0, CSSOM.CSSStyleRule.parse(rule));
	return index;
};


/**
 * Used to delete a rule from the style sheet.
 *
 *   sheet = new Sheet("img{border:none} body{margin:0}")
 *   sheet.toString()
 *   -> "img{border:none;}body{margin:0;}"
 *   sheet.deleteRule(0)
 *   sheet.toString()
 *   -> "body{margin:0;}"
 *
 * @param {number} index within the style sheet's rule list of the rule to remove.
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-deleteRule
 */
CSSOM.CSSStyleSheet.prototype.deleteRule = function(index) {
	if (index < 0 || index >= this.cssRules.length) {
		throw new RangeError("INDEX_SIZE_ERR");
	}
	this.cssRules.splice(index, 1);
};


/**
 * NON-STANDARD
 * @return {string} serialize stylesheet
 */
CSSOM.CSSStyleSheet.prototype.toString = function() {
	var result = "";
	var rules = this.cssRules;

	function serializeRuleBodyWithoutIsContinuation(cssRule) {
		var isContinuation = cssRule.style.getPropertyValue('is-continuation');
			result;
		if (isContinuation) {
			rules[i].style.removeProperty('is-continuation');
		}
		result = cssRule.style.cssText;
		if (isContinuation) {
			rules[i].style.setProperty('is-continuation', isContinuation);
		}
		return result;
	}

	for (var i=0; i<rules.length; i++) {
		if (rules[i].type === CSSOM.CSSRule.STYLE_RULE) { // STYLE_RULE
			result += rules[i].selectorText + " {";
			if (rules[i].style) {
				result += serializeRuleBodyWithoutIsContinuation(rules[i]);
			}
			while (i + 1 < rules.length && rules[i + 1].type === CSSOM.CSSRule.STYLE_RULE && rules[i + 1].selectorText === rules[i].selectorText && rules[i + 1].style && rules[i + 1].style.getPropertyValue('is-continuation') === 'yes') {
				i += 1;
				result += " " + serializeRuleBodyWithoutIsContinuation(rules[i]);
			}
			result += "}\n";
		} else if (rules[i].type === CSSOM.CSSRule.FONT_FACE_RULE) {
			result += "@font-face {";
			if (rules[i].style) {
				result += serializeRuleBodyWithoutIsContinuation(rules[i]);
			}
			var fontFamily = rules[i].style.getPropertyValue('font-family');
			while (fontFamily && i + 1 < rules.length && rules[i + 1].type === CSSOM.CSSRule.FONT_FACE_RULE && rules[i + 1].style && rules[i + 1].style.getPropertyValue('is-continuation') === 'yes' && rules[i + 1].style.getPropertyValue('font-family') === fontFamily) {
				i += 1;
				if (rules[i].style) {
					rules[i].style.removeProperty('font-family');
					result += " " + serializeRuleBodyWithoutIsContinuation(rules[i]);
					rules[i].style.setProperty('font-family', fontFamily);
				}
			}
			result += "}\n";
		} else {
			result += rules[i].cssText + "\n";
		}
	}
	return result;
};


//.CommonJS
exports.CSSStyleSheet = CSSOM.CSSStyleSheet;
///CommonJS

/*=============================================================================
  CAO-TextColor.js - v1.0.0
 -----------------------------------------------------------------------------
  Copyright (c) 2021 CACAO
  Released under the CACAO's license - 1.0
  https://cacao-soft.github.io/Licenses/CAO-LICENSE.txt
 -----------------------------------------------------------------------------
  [Twitter] https://twitter.com/cacao_soft/
  [GitHub]  https://github.com/cacao-soft/
=============================================================================*/

/*:
 * @target MV
 * @author CACAO
 *
 * @plugindesc 
 *  制御文字 ¥C の[] 内の記述方法を増やします。
 *
 * @help
 * ¥C[R,G,B]
 *   R 赤, G 緑 , B 青 に 0 ~ 255 もしくは、0 〜 100 % で色を設定してください。
 *   例）¥C[255,0,0] で赤　¥C[100%,100%,0%] で黄
 *
 * ¥C[RRGGBB]
 *   R 赤, G 緑 , B 青 に16進法 00 ~ FF で色を設定してください。
 *   例）¥C[FF0000] で赤　¥C[FFFF00] で黄
 *
 * ¥[RGB]
 *   R 赤, G 緑 , B 青 に16進法 0 ~ F で色を設定してください。
 *   例）¥C[F00] で赤　¥C[FF0] で黄
 *   
*/

!function() {

  var _Window_Base_processEscapeCharacter =
    Window_Base.prototype.processEscapeCharacter
  Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    if (code === 'C') {
      this.changeTextColor(this.obtainEscapeTextColor(textState))
    } else {
      _Window_Base_processEscapeCharacter.apply(this, arguments)
    }
  }
  
  Window_Base.prototype.obtainEscapeTextColor = function(textState) {
    var reg = /^\[(\d{1,3}%?(?:,\d{1,3}%?){2}|(?:[0-9a-f]{3}){1,2})\]/i
    var arr = reg.exec(textState.text.slice(textState.index))
    if (arr) {
      textState.index += arr[0].length
      if (arr[0].indexOf(',') < 0) {
        return '#' + arr[1]
      } else {
        return 'rgb(' + arr[1] + ')'
      }
    } else {
      return this.textColor(this.obtainEscapeParam(textState))
    }
  }

}()

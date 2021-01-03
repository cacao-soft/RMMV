/*=============================================================================
  CAO-BitmapDrawEx.js - v1.0.0
 -----------------------------------------------------------------------------
  Copyright (c) 2021 CACAO
  Released under the CACAO's license.
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
 *  Bitmap に扇型描画処理を追加
 *
 * @help
 * drawPie(x, y, 開始角度, 終了角度, 大きさ, 色)
 *
 */
 
!function() {

  // 扇型の描画 中央座標 x,y, 開始角度 d1, 終了角度 d2, 半径 radius, 色 color
  Bitmap.prototype.drawPie = function(x, y, d1, d2, radius, color) {
    var context = this._context
    var deg = Math.PI / 180
    context.save()
    context.fillStyle = color
    context.beginPath()
    context.moveTo(x, y)
    context.arc(x, y, radius, deg*(d2-90), deg*(d1-90), true)
    context.fill()
    context.restore()
    this._setDirty()
  }

}()

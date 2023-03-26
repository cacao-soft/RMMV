/*=============================================================================
  CAO-TimeLimitedChoice.js - v1.0.1
 -----------------------------------------------------------------------------
  Copyright (c) 2022 CACAO
  Released under the MIT License.
  https://opensource.org/licenses/MIT
 -----------------------------------------------------------------------------
  [Twitter] https://twitter.com/cacao_soft/
  [GitHub]  https://github.com/cacao-soft/
=============================================================================*/

/*:
 * @target MV
 * @author CACAO
 * @url https://raw.githubusercontent.com/cacao-soft/RMMV/main/CAO-TimeLimitedChoice.js
 * @plugindesc v1.0.1 時間制限のある選択肢を作れるようにします。
 *
 * @help
 * == 使用方法 ==
 *
 *  1. イベントコマンドでタイマーを起動
 *  2. プラグインコマンドで時間切れ動作の指定
 *  3. イベントコマンドで選択肢を表示
 *
 * == プラグインコマンド ==
 *
 *  [Choice TLA skip]
 *    選択肢の分岐を飛ばして次のコマンドを実行する
 *
 *  [Choice TLA select]
 *    現在選択中の項目の選択肢を実行する
 *
 *  [Choice TLA cancel]
 *    キャンセル時に実行される選択肢を実行する
 *
 *  [Choice TLA index n]
 *    指定された番号 n (1-6) の選択肢を実行する
 *
 *
 * @param TimeoutSwitchID
 * @text 時間切れスイッチ
 * @desc
 * 時間切れ時にONにするスイッチ
 * 選択肢の表示を行なうと OFF になる
 * @type switch
 * @default 0
 *
 * @param TimeleftVariableID
 * @text 残り時間変数
 * @desc
 * 残り時間を取得する変数
 * @type variable
 * @default 0
 *
 * @param TimeleftType
 * @text 残り時間タイプ
 * @desc
 * 残り時間の取得方法を設定する
 * この値が残り時間変数に代入される
 * @type select
 * @option 秒数
 * @option フレーム数
 * @default フレーム数
 */

!function() {
    'use strict'

    const pluginName = document.currentScript.src.split('/').pop().split(/\.(?=[^.]+$)/)[0]
    const pluginParams = PluginManager.parameters(pluginName)
    const pluginCommands = {
        skip: function(args) { $gameMessage.setChoiceTimeoutType(99) },
        select: function(args) { $gameMessage.setChoiceTimeoutType(-1) },
        cancel: function(args) { $gameMessage.setChoiceTimeoutType(-2) },
        index: function(args) { $gameMessage.setChoiceTimeoutType(args.index - 1) }
    }

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        if (command === 'Choice' && args[0] === 'TLA') {
            if (pluginCommands[args[1]]) {
                pluginCommands[args[1]]({ index: args[2] })
                return
            }
        }
        _Game_Interpreter_pluginCommand.call(this, command, args)
    }

    function setTimeoutSwitch(value) {
        if (pluginParams.TimeoutSwitchID) {
            $gameSwitches.setValue(pluginParams.TimeoutSwitchID, value)
        }
    }

    const _Game_Message_clear = Game_Message.prototype.clear
    Game_Message.prototype.clear = function() {
        _Game_Message_clear.apply(this, arguments)
        this.clearChoiceTimeoutType()
    }

    Game_Message.prototype.choiceTimeoutType = function() {
        return this._choiceTimeoutType
    }

    Game_Message.prototype.setChoiceTimeoutType = function(timeoutType) {
        this._choiceTimeoutType = timeoutType
    }

    Game_Message.prototype.clearChoiceTimeoutType = function() {
        this._choiceTimeoutType = 0
    }

    const _Game_Interpreter_setupChoices = Game_Interpreter.prototype.setupChoices
    Game_Interpreter.prototype.setupChoices = function(params) {
        _Game_Interpreter_setupChoices.apply(this, arguments)
        if ($gameTimer._frames > 0) {
            setTimeoutSwitch(false)
        } else {
            $gameMessage.clearChoiceTimeoutType()
        }
    }

    const _Window_ChoiceList_close = Window_ChoiceList.prototype.close
    Window_ChoiceList.prototype.close = function() {
        _Window_ChoiceList_close.apply(this, arguments)
        if (pluginParams.TimeleftVariableID) {
            $gameVariables.setValue(pluginParams.TimeleftVariableID,
                (pluginParams.TimeleftType === '秒数') ?  $gameTimer.seconds() : $gameTimer._frames)
        }
    }

    const _Window_ChoiceList_update = Window_ChoiceList.prototype.update
    Window_ChoiceList.prototype.update = function() {
        _Window_ChoiceList_update.apply(this, arguments)
        this.checkTimeout()
    }

    Window_ChoiceList.prototype.isEnabledTimeout = function() {
      return $gameMessage.choiceTimeoutType() != 0
    }

    Window_ChoiceList.prototype.checkTimeout = function() {
        if (this.isEnabledTimeout() && $gameTimer._frames === 0) {
            this.callTimeoutHandler()
            setTimeoutSwitch(true)
        }
    }

    Window_ChoiceList.prototype.callTimeoutHandler = function() {
        if (!this.isEnabledTimeout()) return
        if ($gameMessage.choiceTimeoutType() < 0) {
            if ($gameMessage.choiceTimeoutType() === -2) {
                this.callCancelHandler()
            } else {
                if (this.index() < 0) {
                    this._index = $gameMessage.choices().length
                }
                this.callOkHandler()
            }
        } else if ($gameMessage.choiceTimeoutType() > 0) {
            $gameMessage.onChoice($gameMessage.choiceTimeoutType())
            this._messageWindow.terminateMessage()
            this.close()
        }
        this.deactivate()
    }

}()

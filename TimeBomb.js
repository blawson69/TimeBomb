/*
TimeBomb
Add a "time bomb" to the Combat Tracker in Roll20

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

TODO:
    make result token follow bomb token

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var TimeBomb = TimeBomb || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.1',
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },

    checkInstall = function () {
        if (!_.has(state, 'TimeBomb')) state['TimeBomb'] = state['TimeBomb'] || {};
        if (typeof state['TimeBomb'].bombs == 'undefined') state['TimeBomb'].bombs = [];
        log('--> TimeBomb v' + version + ' <-- Primed and ready. Let\'s blow sh*t up!');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'TimeBomb v' + version + ' loaded at ' + d.toLocaleTimeString() + '.', 'GM');
		}
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!bomb') && playerIsGM(msg.playerid)) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1]) {
				switch (parms[1]) {
                    case 'create':
                        commandCreate(msg);
                        break;
                    case 'add':
                        commandAdd(msg);
                        break;
                    case 'reset':
                        commandReset(msg);
                        break;
                    case 'hide':
                        commandHideResult(msg);
                        break;
                    case 'destroy':
                        commandDestroy(msg);
                        break;
                    case 'help':
                    default:
                        commandHelp(msg);
				}
			} else {
                commandHelp(msg);
			}
		}
    },

    commandCreate = function (msg) {
        if (_.size(msg.selected) !== 2) {
            showDialog('Error', 'You have not selected the right number of tokens! Please select a "Bomb" token and a "Result" token.', msg.who);
            return;
        }
        var bomb, result;
        _.each(msg.selected, function (obj) {
            var token = getObj(obj._type, obj._id);
            if (token) {
                var nameVal = token.get("bar1_value") ;
                if (nameVal === 'Bomb') bomb = token;
                if (nameVal === 'Result') result = token;
            }
        });

        if (typeof bomb != 'undefined' &&_.find(state['TimeBomb'].bombs, function (x) { return x == bomb.get('id'); })) {
            showDialog('Error', '"' + bomb.get('name') + '" has already been created.', msg.who);
            return;
        }

        if (typeof bomb != 'undefined' && typeof result != 'undefined') {
            var lOffset = parseInt(result.get('left')) - parseInt(bomb.get('left'));
            var tOffset = parseInt(result.get('top')) - parseInt(bomb.get('top'));
            bomb.set({bar3_value: result.get('id'), bar2_value: (bomb.get('bar2_value') == '' || !isNum(bomb.get('bar2_value')) ? 10 : bomb.get('bar2_value')), bar3_max: lOffset + '|' + tOffset, showplayers_bar1: false, showplayers_bar2: false, showplayers_bar3: false, playersedit_bar1: false, playersedit_bar2: false, playersedit_bar3: false, playersedit_name: false});
            result.set({layer: 'walls', bar3_value: bomb.get('id'), showplayers_bar1: false, showplayers_bar2: false, showplayers_bar3: false, showplayers_name: false, playersedit_bar1: false, playersedit_bar2: false, playersedit_bar3: false, playersedit_name: false});
            state['TimeBomb'].bombs.push(bomb.get('id'));

            showDialog('Success', '"' + bomb.get('name') + '" was created successfully! When ready to trigger the countdown (add it to the Turn Tracker), use <span style=\'' + styles.code + '\'>!bomb add</span> with the bomb token selected.', msg.who);
        } else {
            var err = "Couldn't find a required piece:<ul>"
                + (typeof bomb == 'undefined' ? '<li>A token named "Bomb".</li>' : '')
                + (typeof result == 'undefined' ? '<li>A token named "Result".</li>' : '')
                + '</ul>';
            showDialog('Error', err, msg.who);
        }
    },

    commandAdd = function (msg) {
        var bomb = getObj(msg.selected[0]._type, msg.selected[0]._id);
        var to = getTurnOrder();
        if (bomb && _.find(state['TimeBomb'].bombs, function (x) { return x == bomb.get('id'); }) && !_.find(to, function (y) { return y.id == bomb.get('id'); })) {
            to.push({
                id: bomb.get('id'),
                pr: bomb.get('bar2_value'),
                formula: -1
            });
            setTurnOrder(to);
        } else {
            var err = (_.find(to, function (x) { return x.id == bomb.get('id'); })) ? '"' + ((bomb) ? bomb.get('name') : 'unknown') + '" is already in the Turn Tracker' : 'Your Bomb must be created before it can be added to the Turn Tracker.';
            showDialog('Error', err, msg.who);
        }
    },

    commandReset = function (msg) {
        var parms = msg.content.split(/\s+/i);
        var token = getObj('graphic', parms[2]), bomb, result;
        if (token) {
                bomb = token;
                result = getObj('graphic', bomb.get('bar3_value'));
        }

        if (bomb && result) {
            var lOffset = parseInt(result.get('left')) - parseInt(bomb.get('left'));
            var tOffset = parseInt(result.get('top')) - parseInt(bomb.get('top'));
            result.set({layer: 'walls'});
            bomb.set({layer: 'objects', bar3_value: result.get('id'), bar3_max: lOffset + '|' + tOffset, showplayers_bar1: false});
            state['TimeBomb'].bombs.push(bomb.get('id'));
            showDialog('Bomb Reset', '"' + bomb.get('name') + '" has been successfully reset. When ready to trigger the countdown (add it to the Turn Tracker), use <span style=\'' + styles.code + '\'>!bomb add</span> with the bomb token selected.', msg.who);
            var bomb = getObj('graphic', result.get('bar3_value'));
        } else {
            var err = "Couldn't find a required piece:<ul>"
                + (typeof bomb == 'undefined' ? '<li>A token named "Bomb".</li>' : '')
                + (typeof result == 'undefined' ? '<li>A token named "Result".</li>' : '')
                + '</ul>';
            showDialog('Error', err, msg.who);
        }
    },

    commandHideResult = function (msg) {
        var parms = msg.content.split(/\s+/i);
        var result = getObj('graphic', parms[2]);
        if (result) {
            result.set({layer: 'walls'});
        }
    },

    commandDestroy = function (msg) {
        if (_.size(msg.selected) == 0) {
            showDialog('Error', 'You must select a valid Bomb "Result" token.', msg.who);
            return;
        }
        var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
        if (token && (token.get('bar1_value') == 'Bomb' || token.get('bar1_value') == 'Result')) {
            var bomb, result;
            if (token.get('bar1_value') == 'Bomb') {
                bomb = token;
                result = getObj('graphic', bomb.get('bar3_value'));
            } else {
                result = token;
                bomb = getObj('graphic', result.get('bar3_value'));
            }
            result.set({layer: 'objects', bar3_value: '', bar3_max: ''});
            bomb.set({layer: 'objects', bar3_value: '', bar3_max: ''});
            state['TimeBomb'].bombs = _.filter(state['TimeBomb'].bombs, function (x) { return x !== bomb.get('id') });
            showDialog('Bomb Destroyed', '"' + bomb.get('name') + '" has been successfully destroyed.', msg.who);
        } else {
            showDialog('Error', 'The selected token was not a Bomb token.', msg.who);
        }
    },

    getTurnOrder = function () {
        return (Campaign().get('turnorder') === '') ? [] : Array.from(JSON.parse(Campaign().get('turnorder')));
    },

    setTurnOrder = function (to) {
        // Make sure Turn Tracker is open first
        if (Campaign().get('initiativepage') == false)
        Campaign().set({initiativepage: Campaign().get('playerpageid')});
        Campaign().set('turnorder', JSON.stringify(to));
    },

    getCurrentTurn = function () {
        return _.first(getTurnOrder());
    },

    processGMNotes = function (notes) {
        var retval, text = unescape(notes).trim();
        if (text.search('{template:') != -1) {
            text = removeFormatting(text);
            text = text.replace('&amp;{template', '&{template');
        }
        return text;
    },

    removeFormatting = function (html) {
        html = html.replace(/<p[^>]*>/gi, '<p>').replace(/\n(<p>)?/gi, '</p><p>').replace(/<br>/gi, '</p><p>').replace(/<\/?(span|div|pre|img|code|a|b|i|h1|h2|h3|h4|h5|hr)[^>]*>/gi, '');
        if (html != '' && /<p>.*?<\/p>/g.test(html)) {
            html = html.match(/<p>.*?<\/p>/g).map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
            html = html.join(/\n/);
        }
        return html;
    },

    rollDice = function (exp) {
        exp = exp.split(/\D/gi);
        var roll, num = (exp[0]) ? parseInt(exp[0]) : 1,
        die = (exp[1]) ? parseInt(exp[1]) : 6,
        plus = (exp[2]) ? parseInt(exp[2]) : 0;
        roll = (num == 1) ? randomInteger(die) : randomInteger(die * num - (num - 1)) + (num - 1);
        return roll + plus;
    },

    isNum = function (txt) {
        var nr = /^\d+$/;
        return nr.test(txt);
    },

    commandHelp = function (msg) {
        var message = '<span style=\'' + styles.code + '\'>!bomb help</span><br>Sends this dialog to the chat window.<br><br>';
        message += 'More information here...';
        showDialog('TimeBomb Help', message, msg.who);
    },

    showDialog = function (title, content, whisperTo = '') {
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('TimeBomb', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('TimeBomb', body);
        }
    },

    checkTimer = function () {
        var curr = getCurrentTurn();
        if (curr && curr.id !== 'undefined' && _.find(state['TimeBomb'].bombs, function (x) { return x == curr.id; }) && curr.pr == 0) {
            var bomb = getObj('graphic', curr.id);
            if (bomb) {
                var result = getObj('graphic', bomb.get('bar3_value')),
                    offsets = bomb.get('bar3_max').split('|');
                var left = parseInt(bomb.get('left')) + parseInt(offsets[0]),
                    top = parseInt(bomb.get('top')) + parseInt(offsets[1]);

                result.set({left: left, top: top});
                _.delay(function () {
                    var effect = processGMNotes(bomb.get('gmnotes'));
                    if (effect !== '') showDialog('', effect);

                    bomb.set({layer: 'walls'});
                    if (result.get('bar1_max') == 'false' || result.get('bar1_max') == 'tokens' || result.get('bar1_max') == 'objects') {
                        result.set({layer: 'objects'});
                        toFront(result);
                    } else {
                        result.set({layer: 'map'});
                    }

                    var nto = _.filter(getTurnOrder(), function (obj) { return obj.id !== bomb.get('id'); });
                    setTurnOrder(nto);

                    state['TimeBomb'].bombs = _.filter(state['TimeBomb'].bombs, function (x) { return x !== bomb.get('id') });

                }, 350);

                _.delay(function () {
                    showDialog('', '"' + bomb.get('name') + '" has been detonated.<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!bomb hide ' + result.get('id') + '" title="Hide Detonation Token">Hide</a> <a style=\'' + styles.button + '\' href="!bomb reset ' + bomb.get('id') + '" title="Reset Bomb">Reset</a></div>', 'GM');
                }, 500);

            } else showDialog('', 'Bomb not found!', 'GM');
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on("change:campaign:turnorder", checkTimer);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    TimeBomb.checkInstall();
    TimeBomb.registerEventHandlers();
});

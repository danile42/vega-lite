/// <reference path="../../../../typings/vega-event-selector.d.ts" />
import { selector as parseSelector } from 'vega-event-selector';
import { stringValue } from 'vega-util';
import { X, Y } from '../../../channel';
import { BRUSH as INTERVAL_BRUSH } from '../interval';
import { channelSignalName, positionalProjections } from '../selection';
import { default as scalesCompiler, domain } from './scales';
var ANCHOR = '_zoom_anchor';
var DELTA = '_zoom_delta';
var zoom = {
    has: function (selCmpt) {
        return selCmpt.type === 'interval' && selCmpt.zoom;
    },
    signals: function (model, selCmpt, signals) {
        var name = selCmpt.name;
        var hasScales = scalesCompiler.has(selCmpt);
        var delta = name + DELTA;
        var _a = positionalProjections(selCmpt), x = _a.x, y = _a.y;
        var sx = stringValue(model.scaleName(X));
        var sy = stringValue(model.scaleName(Y));
        var events = parseSelector(selCmpt.zoom, 'scope');
        if (!hasScales) {
            events = events.map(function (e) { return (e.markname = name + INTERVAL_BRUSH, e); });
        }
        signals.push({
            name: name + ANCHOR,
            on: [{
                    events: events,
                    update: !hasScales ? "{x: x(unit), y: y(unit)}" :
                        '{' + [
                            (sx ? "x: invert(" + sx + ", x(unit))" : ''),
                            (sy ? "y: invert(" + sy + ", y(unit))" : '')
                        ].filter(function (expr) { return !!expr; }).join(', ') + '}'
                }]
        }, {
            name: delta,
            on: [{
                    events: events,
                    force: true,
                    update: 'pow(1.001, event.deltaY * pow(16, event.deltaMode))'
                }]
        });
        if (x !== null) {
            onDelta(model, selCmpt, 'x', 'width', signals);
        }
        if (y !== null) {
            onDelta(model, selCmpt, 'y', 'height', signals);
        }
        return signals;
    }
};
export default zoom;
function onDelta(model, selCmpt, channel, size, signals) {
    var name = selCmpt.name;
    var hasScales = scalesCompiler.has(selCmpt);
    var signal = signals.filter(function (s) {
        return s.name === channelSignalName(selCmpt, channel, hasScales ? 'data' : 'visual');
    })[0];
    var sizeSg = model.getSizeSignalRef(size).signal;
    var scaleCmpt = model.getScaleComponent(channel);
    var scaleType = scaleCmpt.get('type');
    var base = hasScales ? domain(model, channel) : signal.name;
    var delta = name + DELTA;
    var anchor = "" + name + ANCHOR + "." + channel;
    var zoomFn = !hasScales ? 'zoomLinear' :
        scaleType === 'log' ? 'zoomLog' :
            scaleType === 'pow' ? 'zoomPow' : 'zoomLinear';
    var update = zoomFn + "(" + base + ", " + anchor + ", " + delta +
        (hasScales && scaleType === 'pow' ? ", " + (scaleCmpt.get('exponent') || 1) : '') + ')';
    signal.on.push({
        events: { signal: delta },
        update: hasScales ? update : "clampRange(" + update + ", 0, " + sizeSg + ")"
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21waWxlL3NlbGVjdGlvbi90cmFuc2Zvcm1zL3pvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscUVBQXFFO0FBRXJFLE9BQU8sRUFBQyxRQUFRLElBQUksYUFBYSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDOUQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN0QyxPQUFPLEVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXBELE9BQU8sRUFBQyxLQUFLLElBQUksY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3BELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBcUIsTUFBTSxjQUFjLENBQUM7QUFFMUYsT0FBTyxFQUFDLE9BQU8sSUFBSSxjQUFjLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBSTNELElBQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUM5QixJQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFFNUIsSUFBTSxJQUFJLEdBQXFCO0lBQzdCLEdBQUcsRUFBRSxVQUFTLE9BQU87UUFDbkIsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3JELENBQUM7SUFFRCxPQUFPLEVBQUUsVUFBUyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU87UUFDdkMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMxQixJQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLElBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBQSxtQ0FBdUMsRUFBdEMsUUFBQyxFQUFFLFFBQUMsQ0FBbUM7UUFDOUMsSUFBTSxFQUFFLEdBQUcsV0FB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QUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzlELElBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7SUFDM0IsSUFBTSxNQUFNLEdBQUcsS0FBRyxJQUFJLEdBQUcsTUFBTSxTQUFJLE9BQVMsQ0FBQztJQUM3QyxJQUFNLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDeEMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDakQsSUFBTSxNQUFNLEdBQU0sTUFBTSxTQUFJLElBQUksVUFBSyxNQUFNLFVBQUssS0FBTztRQUNyRCxDQUFDLFNBQVMsSUFBSSxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFLLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUV4RixNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztRQUNiLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUM7UUFDdkIsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBYyxNQUFNLGFBQVEsTUFBTSxNQUFHO0tBQ25FLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy92ZWdhLWV2ZW50LXNlbGVjdG9yLmQudHNcIiAvPlxuXG5pbXBvcnQge3NlbGVjdG9yIGFzIHBhcnNlU2VsZWN0b3J9IGZyb20gJ3ZlZ2EtZXZlbnQtc2VsZWN0b3InO1xuaW1wb3J0IHtzdHJpbmdWYWx1ZX0gZnJvbSAndmVnYS11dGlsJztcbmltcG9ydCB7U2NhbGVDaGFubmVsLCBYLCBZfSBmcm9tICcuLi8uLi8uLi9jaGFubmVsJztcbmltcG9ydCB7VmdTaWduYWx9IGZyb20gJy4uLy4uLy4uL3ZlZ2Euc2NoZW1hJztcbmltcG9ydCB7QlJVU0ggYXMgSU5URVJWQUxfQlJVU0h9IGZyb20gJy4uL2ludGVydmFsJztcbmltcG9ydCB7Y2hhbm5lbFNpZ25hbE5hbWUsIHBvc2l0aW9uYWxQcm9qZWN0aW9ucywgU2VsZWN0aW9uQ29tcG9uZW50fSBmcm9tICcuLi9zZWxlY3Rpb24nO1xuaW1wb3J0IHtVbml0TW9kZWx9IGZyb20gJy4vLi4vLi4vdW5pdCc7XG5pbXBvcnQge2RlZmF1bHQgYXMgc2NhbGVzQ29tcGlsZXIsIGRvbWFpbn0gZnJvbSAnLi9zY2FsZXMnO1xuaW1wb3J0IHtUcmFuc2Zvcm1Db21waWxlcn0gZnJvbSAnLi90cmFuc2Zvcm1zJztcblxuXG5jb25zdCBBTkNIT1IgPSAnX3pvb21fYW5jaG9yJztcbmNvbnN0IERFTFRBID0gJ196b29tX2RlbHRhJztcblxuY29uc3Qgem9vbTpUcmFuc2Zvcm1Db21waWxlciA9IHtcbiAgaGFzOiBmdW5jdGlvbihzZWxDbXB0KSB7XG4gICAgcmV0dXJuIHNlbENtcHQudHlwZSA9PT0gJ2ludGVydmFsJyAmJiBzZWxDbXB0Lnpvb207XG4gIH0sXG5cbiAgc2lnbmFsczogZnVuY3Rpb24obW9kZWwsIHNlbENtcHQsIHNpZ25hbHMpIHtcbiAgICBjb25zdCBuYW1lID0gc2VsQ21wdC5uYW1lO1xuICAgIGNvbnN0IGhhc1NjYWxlcyA9IHNjYWxlc0NvbXBpbGVyLmhhcyhzZWxDbXB0KTtcbiAgICBjb25zdCBkZWx0YSA9IG5hbWUgKyBERUxUQTtcbiAgICBjb25zdCB7eCwgeX0gPSBwb3NpdGlvbmFsUHJvamVjdGlvbnMoc2VsQ21wdCk7XG4gICAgY29uc3Qgc3ggPSBzdHJpbmdWYWx1ZShtb2RlbC5zY2FsZU5hbWUoWCkpO1xuICAgIGNvbnN0IHN5ID0gc3RyaW5nVmFsdWUobW9kZWwuc2NhbGVOYW1lKFkpKTtcbiAgICBsZXQgZXZlbnRzID0gcGFyc2VTZWxlY3RvcihzZWxDbXB0Lnpvb20sICdzY29wZScpO1xuXG4gICAgaWYgKCFoYXNTY2FsZXMpIHtcbiAgICAgIGV2ZW50cyA9IGV2ZW50cy5tYXAoKGUpID0+IChlLm1hcmtuYW1lID0gbmFtZSArIElOVEVSVkFMX0JSVVNILCBlKSk7XG4gICAgfVxuXG4gICAgc2lnbmFscy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUgKyBBTkNIT1IsXG4gICAgICBvbjogW3tcbiAgICAgICAgZXZlbnRzOiBldmVudHMsXG4gICAgICAgIHVwZGF0ZTogIWhhc1NjYWxlcyA/IGB7eDogeCh1bml0KSwgeTogeSh1bml0KX1gIDpcbiAgICAgICAgICAneycgKyBbXG4gICAgICAgICAgICAoc3ggPyBgeDogaW52ZXJ0KCR7c3h9LCB4KHVuaXQpKWAgOiAnJyksXG4gICAgICAgICAgICAoc3kgPyBgeTogaW52ZXJ0KCR7c3l9LCB5KHVuaXQpKWAgOiAnJylcbiAgICAgICAgICBdLmZpbHRlcigoZXhwcikgPT4gISFleHByKS5qb2luKCcsICcpICsgJ30nXG4gICAgICB9XVxuICAgIH0sIHtcbiAgICAgIG5hbWU6IGRlbHRhLFxuICAgICAgb246IFt7XG4gICAgICAgIGV2ZW50czogZXZlbnRzLFxuICAgICAgICBmb3JjZTogdHJ1ZSxcbiAgICAgICAgdXBkYXRlOiAncG93KDEuMDAxLCBldmVudC5kZWx0YVkgKiBwb3coMTYsIGV2ZW50LmRlbHRhTW9kZSkpJ1xuICAgICAgfV1cbiAgICB9KTtcblxuICAgIGlmICh4ICE9PSBudWxsKSB7XG4gICAgICBvbkRlbHRhKG1vZGVsLCBzZWxDbXB0LCAneCcsICd3aWR0aCcsIHNpZ25hbHMpO1xuICAgIH1cblxuICAgIGlmICh5ICE9PSBudWxsKSB7XG4gICAgICBvbkRlbHRhKG1vZGVsLCBzZWxDbXB0LCAneScsICdoZWlnaHQnLCBzaWduYWxzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2lnbmFscztcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgem9vbTtcblxuZnVuY3Rpb24gb25EZWx0YShtb2RlbDogVW5pdE1vZGVsLCBzZWxDbXB0OiBTZWxlY3Rpb25Db21wb25lbnQsIGNoYW5uZWw6IFNjYWxlQ2hhbm5lbCwgc2l6ZTogJ3dpZHRoJyB8ICdoZWlnaHQnLCBzaWduYWxzOiBWZ1NpZ25hbFtdKSB7XG4gIGNvbnN0IG5hbWUgPSBzZWxDbXB0Lm5hbWU7XG4gIGNvbnN0IGhhc1NjYWxlcyA9IHNjYWxlc0NvbXBpbGVyLmhhcyhzZWxDbXB0KTtcbiAgY29uc3Qgc2lnbmFsID0gc2lnbmFscy5maWx0ZXIocyA9PiB7XG4gICAgcmV0dXJuIHMubmFtZSA9PT0gY2hhbm5lbFNpZ25hbE5hbWUoc2VsQ21wdCwgY2hhbm5lbCwgaGFzU2NhbGVzID8gJ2RhdGEnIDogJ3Zpc3VhbCcpO1xuICB9KVswXTtcbiAgY29uc3Qgc2l6ZVNnID0gbW9kZWwuZ2V0U2l6ZVNpZ25hbFJlZihzaXplKS5zaWduYWw7XG4gIGNvbnN0IHNjYWxlQ21wdCA9IG1vZGVsLmdldFNjYWxlQ29tcG9uZW50KGNoYW5uZWwpO1xuICBjb25zdCBzY2FsZVR5cGUgPSBzY2FsZUNtcHQuZ2V0KCd0eXBlJyk7XG4gIGNvbnN0IGJhc2UgPSBoYXNTY2FsZXMgPyBkb21haW4obW9kZWwsIGNoYW5uZWwpIDogc2lnbmFsLm5hbWU7XG4gIGNvbnN0IGRlbHRhID0gbmFtZSArIERFTFRBO1xuICBjb25zdCBhbmNob3IgPSBgJHtuYW1lfSR7QU5DSE9SfS4ke2NoYW5uZWx9YDtcbiAgY29uc3Qgem9vbUZuID0gIWhhc1NjYWxlcyA/ICd6b29tTGluZWFyJyA6XG4gICAgc2NhbGVUeXBlID09PSAnbG9nJyA/ICd6b29tTG9nJyA6XG4gICAgc2NhbGVUeXBlID09PSAncG93JyA/ICd6b29tUG93JyA6ICd6b29tTGluZWFyJztcbiAgY29uc3QgdXBkYXRlID0gYCR7em9vbUZufSgke2Jhc2V9LCAke2FuY2hvcn0sICR7ZGVsdGF9YCArXG4gICAgKGhhc1NjYWxlcyAmJiBzY2FsZVR5cGUgPT09ICdwb3cnID8gYCwgJHtzY2FsZUNtcHQuZ2V0KCdleHBvbmVudCcpIHx8IDF9YCA6ICcnKSArICcpJztcblxuICBzaWduYWwub24ucHVzaCh7XG4gICAgZXZlbnRzOiB7c2lnbmFsOiBkZWx0YX0sXG4gICAgdXBkYXRlOiBoYXNTY2FsZXMgPyB1cGRhdGUgOiBgY2xhbXBSYW5nZSgke3VwZGF0ZX0sIDAsICR7c2l6ZVNnfSlgXG4gIH0pO1xufVxuIl19
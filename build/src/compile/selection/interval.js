import * as tslib_1 from "tslib";
import { stringValue } from 'vega-util';
import { X, Y } from '../../channel';
import { warn } from '../../log';
import { hasContinuousDomain, isBinScale } from '../../scale';
import { keys } from '../../util';
import { channelSignalName, positionalProjections, STORE, TUPLE, unitName, } from './selection';
import scales from './transforms/scales';
export var BRUSH = '_brush';
export var SCALE_TRIGGER = '_scale_trigger';
var interval = {
    predicate: 'vlInterval',
    scaleDomain: 'vlIntervalDomain',
    signals: function (model, selCmpt) {
        var name = selCmpt.name;
        var hasScales = scales.has(selCmpt);
        var signals = [];
        var intervals = [];
        var tupleTriggers = [];
        var scaleTriggers = [];
        if (selCmpt.translate && !hasScales) {
            var filterExpr_1 = "!event.item || event.item.mark.name !== " + stringValue(name + BRUSH);
            events(selCmpt, function (_, evt) {
                var filters = evt.between[0].filter || (evt.between[0].filter = []);
                if (filters.indexOf(filterExpr_1) < 0) {
                    filters.push(filterExpr_1);
                }
            });
        }
        selCmpt.project.forEach(function (p) {
            var channel = p.channel;
            if (channel !== X && channel !== Y) {
                warn('Interval selections only support x and y encoding channels.');
                return;
            }
            var cs = channelSignals(model, selCmpt, channel);
            var dname = channelSignalName(selCmpt, channel, 'data');
            var vname = channelSignalName(selCmpt, channel, 'visual');
            var scaleStr = stringValue(model.scaleName(channel));
            var scaleType = model.getScaleComponent(channel).get('type');
            var toNum = hasContinuousDomain(scaleType) ? '+' : '';
            signals.push.apply(signals, cs);
            tupleTriggers.push(dname);
            intervals.push("{encoding: " + stringValue(channel) + ", " +
                ("field: " + stringValue(p.field) + ", extent: " + dname + "}"));
            scaleTriggers.push({
                scaleName: model.scaleName(channel),
                expr: "(!isArray(" + dname + ") || " +
                    ("(" + toNum + "invert(" + scaleStr + ", " + vname + ")[0] === " + toNum + dname + "[0] && ") +
                    (toNum + "invert(" + scaleStr + ", " + vname + ")[1] === " + toNum + dname + "[1]))")
            });
        });
        // Proxy scale reactions to ensure that an infinite loop doesn't occur
        // when an interval selection filter touches the scale.
        if (!hasScales) {
            signals.push({
                name: name + SCALE_TRIGGER,
                update: scaleTriggers.map(function (t) { return t.expr; }).join(' && ') +
                    (" ? " + (name + SCALE_TRIGGER) + " : {}")
            });
        }
        // Only add an interval to the store if it has valid data extents. Data extents
        // are set to null if pixel extents are equal to account for intervals over
        // ordinal/nominal domains which, when inverted, will still produce a valid datum.
        return signals.concat({
            name: name + TUPLE,
            on: [{
                    events: tupleTriggers.map(function (t) { return ({ signal: t }); }),
                    update: tupleTriggers.join(' && ') +
                        (" ? {unit: " + unitName(model) + ", intervals: [" + intervals.join(', ') + "]} : null")
                }]
        });
    },
    modifyExpr: function (model, selCmpt) {
        var tpl = selCmpt.name + TUPLE;
        return tpl + ', ' +
            (selCmpt.resolve === 'global' ? 'true' : "{unit: " + unitName(model) + "}");
    },
    marks: function (model, selCmpt, marks) {
        var name = selCmpt.name;
        var _a = positionalProjections(selCmpt), xi = _a.xi, yi = _a.yi;
        var store = "data(" + stringValue(selCmpt.name + STORE) + ")";
        // Do not add a brush if we're binding to scales.
        if (scales.has(selCmpt)) {
            return marks;
        }
        var update = {
            x: xi !== null ? { signal: name + "_x[0]" } : { value: 0 },
            y: yi !== null ? { signal: name + "_y[0]" } : { value: 0 },
            x2: xi !== null ? { signal: name + "_x[1]" } : { field: { group: 'width' } },
            y2: yi !== null ? { signal: name + "_y[1]" } : { field: { group: 'height' } }
        };
        // If the selection is resolved to global, only a single interval is in
        // the store. Wrap brush mark's encodings with a production rule to test
        // this based on the `unit` property. Hide the brush mark if it corresponds
        // to a unit different from the one in the store.
        if (selCmpt.resolve === 'global') {
            for (var _i = 0, _b = keys(update); _i < _b.length; _i++) {
                var key = _b[_i];
                update[key] = [tslib_1.__assign({ test: store + ".length && " + store + "[0].unit === " + unitName(model) }, update[key]), { value: 0 }];
            }
        }
        // Two brush marks ensure that fill colors and other aesthetic choices do
        // not interefere with the core marks, but that the brushed region can still
        // be interacted with (e.g., dragging it around).
        var _c = selCmpt.mark, fill = _c.fill, fillOpacity = _c.fillOpacity, stroke = tslib_1.__rest(_c, ["fill", "fillOpacity"]);
        var vgStroke = keys(stroke).reduce(function (def, k) {
            def[k] = [{
                    test: [
                        xi !== null && name + "_x[0] !== " + name + "_x[1]",
                        yi != null && name + "_y[0] !== " + name + "_y[1]",
                    ].filter(function (x) { return x; }).join(' && '),
                    value: stroke[k]
                }, { value: null }];
            return def;
        }, {});
        return [{
                name: name + BRUSH + '_bg',
                type: 'rect',
                clip: true,
                encode: {
                    enter: {
                        fill: { value: fill },
                        fillOpacity: { value: fillOpacity }
                    },
                    update: update
                }
            }].concat(marks, {
            name: name + BRUSH,
            type: 'rect',
            clip: true,
            encode: {
                enter: {
                    fill: { value: 'transparent' }
                },
                update: tslib_1.__assign({}, update, vgStroke)
            }
        });
    }
};
export default interval;
/**
 * Returns the visual and data signals for an interval selection.
 */
function channelSignals(model, selCmpt, channel) {
    var vname = channelSignalName(selCmpt, channel, 'visual');
    var dname = channelSignalName(selCmpt, channel, 'data');
    var hasScales = scales.has(selCmpt);
    var scaleName = model.scaleName(channel);
    var scaleStr = stringValue(scaleName);
    var scale = model.getScaleComponent(channel);
    var scaleType = scale ? scale.get('type') : undefined;
    var size = model.getSizeSignalRef(channel === X ? 'width' : 'height').signal;
    var coord = channel + "(unit)";
    var on = events(selCmpt, function (def, evt) {
        return def.concat({ events: evt.between[0], update: "[" + coord + ", " + coord + "]" }, // Brush Start
        { events: evt, update: "[" + vname + "[0], clamp(" + coord + ", 0, " + size + ")]" } // Brush End
        );
    });
    // React to pan/zooms of continuous scales. Non-continuous scales
    // (bin-linear, band, point) cannot be pan/zoomed and any other changes
    // to their domains (e.g., filtering) should clear the brushes.
    on.push({
        events: { signal: selCmpt.name + SCALE_TRIGGER },
        update: hasContinuousDomain(scaleType) && !isBinScale(scaleType) ?
            "[scale(" + scaleStr + ", " + dname + "[0]), scale(" + scaleStr + ", " + dname + "[1])]" : "[0, 0]"
    });
    return hasScales ? [{ name: dname, on: [] }] : [{
            name: vname, value: [], on: on
        }, {
            name: dname,
            on: [{ events: { signal: vname }, update: vname + "[0] === " + vname + "[1] ? null : invert(" + scaleStr + ", " + vname + ")" }]
        }];
}
function events(selCmpt, cb) {
    return selCmpt.events.reduce(function (on, evt) {
        if (!evt.between) {
            warn(evt + " is not an ordered event stream for interval selections");
            return on;
        }
        return cb(on, evt);
    }, []);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcGlsZS9zZWxlY3Rpb24vaW50ZXJ2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDdEMsT0FBTyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUMvQixPQUFPLEVBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzVELE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFHaEMsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixxQkFBcUIsRUFHckIsS0FBSyxFQUNMLEtBQUssRUFDTCxRQUFRLEdBQ1QsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxNQUFNLE1BQU0scUJBQXFCLENBQUM7QUFFekMsTUFBTSxDQUFDLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQztBQUM5QixNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7QUFFOUMsSUFBTSxRQUFRLEdBQXFCO0lBQ2pDLFNBQVMsRUFBRSxZQUFZO0lBQ3ZCLFdBQVcsRUFBRSxrQkFBa0I7SUFFL0IsT0FBTyxFQUFFLFVBQVMsS0FBSyxFQUFFLE9BQU87UUFDOUIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMxQixJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLElBQU0sT0FBTyxHQUFVLEVBQUUsQ0FBQztRQUMxQixJQUFNLFNBQVMsR0FBVSxFQUFFLENBQUM7UUFDNUIsSUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1FBQ25DLElBQU0sYUFBYSxHQUFVLEVBQUUsQ0FBQztRQUVoQyxJQUFJLE9B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QUVELGdCQUFnQixPQUEyQixFQUFFLEVBQVk7SUFDdkQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFTLEVBQVMsRUFBRSxHQUFrQjtRQUNqRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUksR0FBRyw0REFBeUQsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7c3RyaW5nVmFsdWV9IGZyb20gJ3ZlZ2EtdXRpbCc7XG5pbXBvcnQge1gsIFl9IGZyb20gJy4uLy4uL2NoYW5uZWwnO1xuaW1wb3J0IHt3YXJufSBmcm9tICcuLi8uLi9sb2cnO1xuaW1wb3J0IHtoYXNDb250aW51b3VzRG9tYWluLCBpc0JpblNjYWxlfSBmcm9tICcuLi8uLi9zY2FsZSc7XG5pbXBvcnQge2tleXN9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHtWZ0V2ZW50U3RyZWFtfSBmcm9tICcuLi8uLi92ZWdhLnNjaGVtYSc7XG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi4vdW5pdCc7XG5pbXBvcnQge1xuICBjaGFubmVsU2lnbmFsTmFtZSxcbiAgcG9zaXRpb25hbFByb2plY3Rpb25zLFxuICBTZWxlY3Rpb25Db21waWxlcixcbiAgU2VsZWN0aW9uQ29tcG9uZW50LFxuICBTVE9SRSxcbiAgVFVQTEUsXG4gIHVuaXROYW1lLFxufSBmcm9tICcuL3NlbGVjdGlvbic7XG5pbXBvcnQgc2NhbGVzIGZyb20gJy4vdHJhbnNmb3Jtcy9zY2FsZXMnO1xuXG5leHBvcnQgY29uc3QgQlJVU0ggPSAnX2JydXNoJztcbmV4cG9ydCBjb25zdCBTQ0FMRV9UUklHR0VSID0gJ19zY2FsZV90cmlnZ2VyJztcblxuY29uc3QgaW50ZXJ2YWw6U2VsZWN0aW9uQ29tcGlsZXIgPSB7XG4gIHByZWRpY2F0ZTogJ3ZsSW50ZXJ2YWwnLFxuICBzY2FsZURvbWFpbjogJ3ZsSW50ZXJ2YWxEb21haW4nLFxuXG4gIHNpZ25hbHM6IGZ1bmN0aW9uKG1vZGVsLCBzZWxDbXB0KSB7XG4gICAgY29uc3QgbmFtZSA9IHNlbENtcHQubmFtZTtcbiAgICBjb25zdCBoYXNTY2FsZXMgPSBzY2FsZXMuaGFzKHNlbENtcHQpO1xuICAgIGNvbnN0IHNpZ25hbHM6IGFueVtdID0gW107XG4gICAgY29uc3QgaW50ZXJ2YWxzOiBhbnlbXSA9IFtdO1xuICAgIGNvbnN0IHR1cGxlVHJpZ2dlcnM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgc2NhbGVUcmlnZ2VyczogYW55W10gPSBbXTtcblxuICAgIGlmIChzZWxDbXB0LnRyYW5zbGF0ZSAmJiAhaGFzU2NhbGVzKSB7XG4gICAgICBjb25zdCBmaWx0ZXJFeHByID0gYCFldmVudC5pdGVtIHx8IGV2ZW50Lml0ZW0ubWFyay5uYW1lICE9PSAke3N0cmluZ1ZhbHVlKG5hbWUgKyBCUlVTSCl9YDtcbiAgICAgIGV2ZW50cyhzZWxDbXB0LCBmdW5jdGlvbihfOiBhbnlbXSwgZXZ0OiBWZ0V2ZW50U3RyZWFtKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBldnQuYmV0d2VlblswXS5maWx0ZXIgfHwgKGV2dC5iZXR3ZWVuWzBdLmZpbHRlciA9IFtdKTtcbiAgICAgICAgaWYgKGZpbHRlcnMuaW5kZXhPZihmaWx0ZXJFeHByKSA8IDApIHtcbiAgICAgICAgICBmaWx0ZXJzLnB1c2goZmlsdGVyRXhwcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbENtcHQucHJvamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICAgIGNvbnN0IGNoYW5uZWwgPSBwLmNoYW5uZWw7XG4gICAgICBpZiAoY2hhbm5lbCAhPT0gWCAmJiBjaGFubmVsICE9PSBZKSB7XG4gICAgICAgIHdhcm4oJ0ludGVydmFsIHNlbGVjdGlvbnMgb25seSBzdXBwb3J0IHggYW5kIHkgZW5jb2RpbmcgY2hhbm5lbHMuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3MgPSBjaGFubmVsU2lnbmFscyhtb2RlbCwgc2VsQ21wdCwgY2hhbm5lbCk7XG4gICAgICBjb25zdCBkbmFtZSA9IGNoYW5uZWxTaWduYWxOYW1lKHNlbENtcHQsIGNoYW5uZWwsICdkYXRhJyk7XG4gICAgICBjb25zdCB2bmFtZSA9IGNoYW5uZWxTaWduYWxOYW1lKHNlbENtcHQsIGNoYW5uZWwsICd2aXN1YWwnKTtcbiAgICAgIGNvbnN0IHNjYWxlU3RyID0gc3RyaW5nVmFsdWUobW9kZWwuc2NhbGVOYW1lKGNoYW5uZWwpKTtcbiAgICAgIGNvbnN0IHNjYWxlVHlwZSA9IG1vZGVsLmdldFNjYWxlQ29tcG9uZW50KGNoYW5uZWwpLmdldCgndHlwZScpO1xuICAgICAgY29uc3QgdG9OdW0gPSBoYXNDb250aW51b3VzRG9tYWluKHNjYWxlVHlwZSkgPyAnKycgOiAnJztcblxuICAgICAgc2lnbmFscy5wdXNoLmFwcGx5KHNpZ25hbHMsIGNzKTtcbiAgICAgIHR1cGxlVHJpZ2dlcnMucHVzaChkbmFtZSk7XG4gICAgICBpbnRlcnZhbHMucHVzaChge2VuY29kaW5nOiAke3N0cmluZ1ZhbHVlKGNoYW5uZWwpfSwgYCArXG4gICAgICAgIGBmaWVsZDogJHtzdHJpbmdWYWx1ZShwLmZpZWxkKX0sIGV4dGVudDogJHtkbmFtZX19YCk7XG5cbiAgICAgIHNjYWxlVHJpZ2dlcnMucHVzaCh7XG4gICAgICAgIHNjYWxlTmFtZTogbW9kZWwuc2NhbGVOYW1lKGNoYW5uZWwpLFxuICAgICAgICBleHByOiBgKCFpc0FycmF5KCR7ZG5hbWV9KSB8fCBgICtcbiAgICAgICAgICBgKCR7dG9OdW19aW52ZXJ0KCR7c2NhbGVTdHJ9LCAke3ZuYW1lfSlbMF0gPT09ICR7dG9OdW19JHtkbmFtZX1bMF0gJiYgYCArXG4gICAgICAgICAgICBgJHt0b051bX1pbnZlcnQoJHtzY2FsZVN0cn0sICR7dm5hbWV9KVsxXSA9PT0gJHt0b051bX0ke2RuYW1lfVsxXSkpYFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBQcm94eSBzY2FsZSByZWFjdGlvbnMgdG8gZW5zdXJlIHRoYXQgYW4gaW5maW5pdGUgbG9vcCBkb2Vzbid0IG9jY3VyXG4gICAgLy8gd2hlbiBhbiBpbnRlcnZhbCBzZWxlY3Rpb24gZmlsdGVyIHRvdWNoZXMgdGhlIHNjYWxlLlxuICAgIGlmICghaGFzU2NhbGVzKSB7XG4gICAgICBzaWduYWxzLnB1c2goe1xuICAgICAgICBuYW1lOiBuYW1lICsgU0NBTEVfVFJJR0dFUixcbiAgICAgICAgdXBkYXRlOiBzY2FsZVRyaWdnZXJzLm1hcCgodCkgPT4gdC5leHByKS5qb2luKCcgJiYgJykgK1xuICAgICAgICAgIGAgPyAke25hbWUgKyBTQ0FMRV9UUklHR0VSfSA6IHt9YFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gT25seSBhZGQgYW4gaW50ZXJ2YWwgdG8gdGhlIHN0b3JlIGlmIGl0IGhhcyB2YWxpZCBkYXRhIGV4dGVudHMuIERhdGEgZXh0ZW50c1xuICAgIC8vIGFyZSBzZXQgdG8gbnVsbCBpZiBwaXhlbCBleHRlbnRzIGFyZSBlcXVhbCB0byBhY2NvdW50IGZvciBpbnRlcnZhbHMgb3ZlclxuICAgIC8vIG9yZGluYWwvbm9taW5hbCBkb21haW5zIHdoaWNoLCB3aGVuIGludmVydGVkLCB3aWxsIHN0aWxsIHByb2R1Y2UgYSB2YWxpZCBkYXR1bS5cbiAgICByZXR1cm4gc2lnbmFscy5jb25jYXQoe1xuICAgICAgbmFtZTogbmFtZSArIFRVUExFLFxuICAgICAgb246IFt7XG4gICAgICAgIGV2ZW50czogdHVwbGVUcmlnZ2Vycy5tYXAoKHQpID0+ICh7c2lnbmFsOiB0fSkpLFxuICAgICAgICB1cGRhdGU6IHR1cGxlVHJpZ2dlcnMuam9pbignICYmICcpICtcbiAgICAgICAgICBgID8ge3VuaXQ6ICR7dW5pdE5hbWUobW9kZWwpfSwgaW50ZXJ2YWxzOiBbJHtpbnRlcnZhbHMuam9pbignLCAnKX1dfSA6IG51bGxgXG4gICAgICB9XVxuICAgIH0pO1xuICB9LFxuXG4gIG1vZGlmeUV4cHI6IGZ1bmN0aW9uKG1vZGVsLCBzZWxDbXB0KSB7XG4gICAgY29uc3QgdHBsID0gc2VsQ21wdC5uYW1lICsgVFVQTEU7XG4gICAgcmV0dXJuIHRwbCArICcsICcgK1xuICAgICAgKHNlbENtcHQucmVzb2x2ZSA9PT0gJ2dsb2JhbCcgPyAndHJ1ZScgOiBge3VuaXQ6ICR7dW5pdE5hbWUobW9kZWwpfX1gKTtcbiAgfSxcblxuICBtYXJrczogZnVuY3Rpb24obW9kZWwsIHNlbENtcHQsIG1hcmtzKSB7XG4gICAgY29uc3QgbmFtZSA9IHNlbENtcHQubmFtZTtcbiAgICBjb25zdCB7eGksIHlpfSA9IHBvc2l0aW9uYWxQcm9qZWN0aW9ucyhzZWxDbXB0KTtcbiAgICBjb25zdCBzdG9yZSA9IGBkYXRhKCR7c3RyaW5nVmFsdWUoc2VsQ21wdC5uYW1lICsgU1RPUkUpfSlgO1xuXG4gICAgLy8gRG8gbm90IGFkZCBhIGJydXNoIGlmIHdlJ3JlIGJpbmRpbmcgdG8gc2NhbGVzLlxuICAgIGlmIChzY2FsZXMuaGFzKHNlbENtcHQpKSB7XG4gICAgICByZXR1cm4gbWFya3M7XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlOiBhbnkgPSB7XG4gICAgICB4OiB4aSAhPT0gbnVsbCA/IHtzaWduYWw6IGAke25hbWV9X3hbMF1gfSA6IHt2YWx1ZTogMH0sXG4gICAgICB5OiB5aSAhPT0gbnVsbCA/IHtzaWduYWw6IGAke25hbWV9X3lbMF1gfSA6IHt2YWx1ZTogMH0sXG4gICAgICB4MjogeGkgIT09IG51bGwgPyB7c2lnbmFsOiBgJHtuYW1lfV94WzFdYH0gOiB7ZmllbGQ6IHtncm91cDogJ3dpZHRoJ319LFxuICAgICAgeTI6IHlpICE9PSBudWxsID8ge3NpZ25hbDogYCR7bmFtZX1feVsxXWB9IDoge2ZpZWxkOiB7Z3JvdXA6ICdoZWlnaHQnfX1cbiAgICB9O1xuXG4gICAgLy8gSWYgdGhlIHNlbGVjdGlvbiBpcyByZXNvbHZlZCB0byBnbG9iYWwsIG9ubHkgYSBzaW5nbGUgaW50ZXJ2YWwgaXMgaW5cbiAgICAvLyB0aGUgc3RvcmUuIFdyYXAgYnJ1c2ggbWFyaydzIGVuY29kaW5ncyB3aXRoIGEgcHJvZHVjdGlvbiBydWxlIHRvIHRlc3RcbiAgICAvLyB0aGlzIGJhc2VkIG9uIHRoZSBgdW5pdGAgcHJvcGVydHkuIEhpZGUgdGhlIGJydXNoIG1hcmsgaWYgaXQgY29ycmVzcG9uZHNcbiAgICAvLyB0byBhIHVuaXQgZGlmZmVyZW50IGZyb20gdGhlIG9uZSBpbiB0aGUgc3RvcmUuXG4gICAgaWYgKHNlbENtcHQucmVzb2x2ZSA9PT0gJ2dsb2JhbCcpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXModXBkYXRlKSkge1xuICAgICAgICB1cGRhdGVba2V5XSA9IFt7XG4gICAgICAgICAgdGVzdDogYCR7c3RvcmV9Lmxlbmd0aCAmJiAke3N0b3JlfVswXS51bml0ID09PSAke3VuaXROYW1lKG1vZGVsKX1gLFxuICAgICAgICAgIC4uLnVwZGF0ZVtrZXldXG4gICAgICAgIH0sIHt2YWx1ZTogMH1dO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFR3byBicnVzaCBtYXJrcyBlbnN1cmUgdGhhdCBmaWxsIGNvbG9ycyBhbmQgb3RoZXIgYWVzdGhldGljIGNob2ljZXMgZG9cbiAgICAvLyBub3QgaW50ZXJlZmVyZSB3aXRoIHRoZSBjb3JlIG1hcmtzLCBidXQgdGhhdCB0aGUgYnJ1c2hlZCByZWdpb24gY2FuIHN0aWxsXG4gICAgLy8gYmUgaW50ZXJhY3RlZCB3aXRoIChlLmcuLCBkcmFnZ2luZyBpdCBhcm91bmQpLlxuICAgIGNvbnN0IHtmaWxsLCBmaWxsT3BhY2l0eSwgLi4uc3Ryb2tlfSA9IHNlbENtcHQubWFyaztcbiAgICBjb25zdCB2Z1N0cm9rZSA9IGtleXMoc3Ryb2tlKS5yZWR1Y2UoKGRlZiwgaykgPT4ge1xuICAgICAgZGVmW2tdID0gW3tcbiAgICAgICAgdGVzdDogW1xuICAgICAgICAgIHhpICE9PSBudWxsICYmIGAke25hbWV9X3hbMF0gIT09ICR7bmFtZX1feFsxXWAsXG4gICAgICAgICAgeWkgIT0gbnVsbCAmJiBgJHtuYW1lfV95WzBdICE9PSAke25hbWV9X3lbMV1gLFxuICAgICAgICBdLmZpbHRlcih4ID0+IHgpLmpvaW4oJyAmJiAnKSxcbiAgICAgICAgdmFsdWU6IHN0cm9rZVtrXVxuICAgICAgfSwge3ZhbHVlOiBudWxsfV07XG4gICAgICByZXR1cm4gZGVmO1xuICAgIH0sIHt9KTtcblxuICAgIHJldHVybiBbe1xuICAgICAgbmFtZTogbmFtZSArIEJSVVNIICsgJ19iZycsXG4gICAgICB0eXBlOiAncmVjdCcsXG4gICAgICBjbGlwOiB0cnVlLFxuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIGVudGVyOiB7XG4gICAgICAgICAgZmlsbDoge3ZhbHVlOiBmaWxsfSxcbiAgICAgICAgICBmaWxsT3BhY2l0eToge3ZhbHVlOiBmaWxsT3BhY2l0eX1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiB1cGRhdGVcbiAgICAgIH1cbiAgICB9IGFzIGFueV0uY29uY2F0KG1hcmtzLCB7XG4gICAgICBuYW1lOiBuYW1lICsgQlJVU0gsXG4gICAgICB0eXBlOiAncmVjdCcsXG4gICAgICBjbGlwOiB0cnVlLFxuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIGVudGVyOiB7XG4gICAgICAgICAgZmlsbDoge3ZhbHVlOiAndHJhbnNwYXJlbnQnfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IHsuLi51cGRhdGUsIC4uLnZnU3Ryb2tlfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgaW50ZXJ2YWw7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmlzdWFsIGFuZCBkYXRhIHNpZ25hbHMgZm9yIGFuIGludGVydmFsIHNlbGVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2hhbm5lbFNpZ25hbHMobW9kZWw6IFVuaXRNb2RlbCwgc2VsQ21wdDogU2VsZWN0aW9uQ29tcG9uZW50LCBjaGFubmVsOiAneCd8J3knKTogYW55IHtcbiAgY29uc3Qgdm5hbWUgPSBjaGFubmVsU2lnbmFsTmFtZShzZWxDbXB0LCBjaGFubmVsLCAndmlzdWFsJyk7XG4gIGNvbnN0IGRuYW1lID0gY2hhbm5lbFNpZ25hbE5hbWUoc2VsQ21wdCwgY2hhbm5lbCwgJ2RhdGEnKTtcbiAgY29uc3QgaGFzU2NhbGVzID0gc2NhbGVzLmhhcyhzZWxDbXB0KTtcbiAgY29uc3Qgc2NhbGVOYW1lID0gbW9kZWwuc2NhbGVOYW1lKGNoYW5uZWwpO1xuICBjb25zdCBzY2FsZVN0ciA9IHN0cmluZ1ZhbHVlKHNjYWxlTmFtZSk7XG4gIGNvbnN0IHNjYWxlID0gbW9kZWwuZ2V0U2NhbGVDb21wb25lbnQoY2hhbm5lbCk7XG4gIGNvbnN0IHNjYWxlVHlwZSA9IHNjYWxlID8gc2NhbGUuZ2V0KCd0eXBlJykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHNpemUgPSBtb2RlbC5nZXRTaXplU2lnbmFsUmVmKGNoYW5uZWwgPT09IFggPyAnd2lkdGgnIDogJ2hlaWdodCcpLnNpZ25hbDtcbiAgY29uc3QgY29vcmQgPSBgJHtjaGFubmVsfSh1bml0KWA7XG5cbiAgY29uc3Qgb24gPSBldmVudHMoc2VsQ21wdCwgZnVuY3Rpb24oZGVmOiBhbnlbXSwgZXZ0OiBWZ0V2ZW50U3RyZWFtKSB7XG4gICAgcmV0dXJuIGRlZi5jb25jYXQoXG4gICAgICB7ZXZlbnRzOiBldnQuYmV0d2VlblswXSwgdXBkYXRlOiBgWyR7Y29vcmR9LCAke2Nvb3JkfV1gfSwgICAgICAgICAgIC8vIEJydXNoIFN0YXJ0XG4gICAgICB7ZXZlbnRzOiBldnQsIHVwZGF0ZTogYFske3ZuYW1lfVswXSwgY2xhbXAoJHtjb29yZH0sIDAsICR7c2l6ZX0pXWB9IC8vIEJydXNoIEVuZFxuICAgICk7XG4gIH0pO1xuXG4gIC8vIFJlYWN0IHRvIHBhbi96b29tcyBvZiBjb250aW51b3VzIHNjYWxlcy4gTm9uLWNvbnRpbnVvdXMgc2NhbGVzXG4gIC8vIChiaW4tbGluZWFyLCBiYW5kLCBwb2ludCkgY2Fubm90IGJlIHBhbi96b29tZWQgYW5kIGFueSBvdGhlciBjaGFuZ2VzXG4gIC8vIHRvIHRoZWlyIGRvbWFpbnMgKGUuZy4sIGZpbHRlcmluZykgc2hvdWxkIGNsZWFyIHRoZSBicnVzaGVzLlxuICBvbi5wdXNoKHtcbiAgICBldmVudHM6IHtzaWduYWw6IHNlbENtcHQubmFtZSArIFNDQUxFX1RSSUdHRVJ9LFxuICAgIHVwZGF0ZTogaGFzQ29udGludW91c0RvbWFpbihzY2FsZVR5cGUpICYmICFpc0JpblNjYWxlKHNjYWxlVHlwZSkgP1xuICAgICAgYFtzY2FsZSgke3NjYWxlU3RyfSwgJHtkbmFtZX1bMF0pLCBzY2FsZSgke3NjYWxlU3RyfSwgJHtkbmFtZX1bMV0pXWAgOiBgWzAsIDBdYFxuICB9KTtcblxuICByZXR1cm4gaGFzU2NhbGVzID8gW3tuYW1lOiBkbmFtZSwgb246IFtdfV0gOiBbe1xuICAgIG5hbWU6IHZuYW1lLCB2YWx1ZTogW10sIG9uOiBvblxuICB9LCB7XG4gICAgbmFtZTogZG5hbWUsXG4gICAgb246IFt7ZXZlbnRzOiB7c2lnbmFsOiB2bmFtZX0sIHVwZGF0ZTogYCR7dm5hbWV9WzBdID09PSAke3ZuYW1lfVsxXSA/IG51bGwgOiBpbnZlcnQoJHtzY2FsZVN0cn0sICR7dm5hbWV9KWB9XVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZXZlbnRzKHNlbENtcHQ6IFNlbGVjdGlvbkNvbXBvbmVudCwgY2I6IEZ1bmN0aW9uKSB7XG4gIHJldHVybiBzZWxDbXB0LmV2ZW50cy5yZWR1Y2UoZnVuY3Rpb24ob246IGFueVtdLCBldnQ6IFZnRXZlbnRTdHJlYW0pIHtcbiAgICBpZiAoIWV2dC5iZXR3ZWVuKSB7XG4gICAgICB3YXJuKGAke2V2dH0gaXMgbm90IGFuIG9yZGVyZWQgZXZlbnQgc3RyZWFtIGZvciBpbnRlcnZhbCBzZWxlY3Rpb25zYCk7XG4gICAgICByZXR1cm4gb247XG4gICAgfVxuICAgIHJldHVybiBjYihvbiwgZXZ0KTtcbiAgfSwgW10pO1xufVxuIl19